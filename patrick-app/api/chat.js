/**
 * /api/chat — Patrick chat backend.
 * -----------------------------------------------------------------------------
 * Framework-agnostic serverless handler (Vercel/Netlify Node: export default),
 * plus a pure `handleChat()` core.
 *
 * REAL MODE (Bedrock): when BEDROCK_KB_ID + BEDROCK_CLAUDE_PROFILE are set AND
 *   the AWS SDK is installed, Patrick:
 *     1) Retrieves relevant chunks from the Knowledge Base (RetrieveCommand),
 *     2) Generates the answer with Claude Haiku via Converse, using the SYSTEM
 *        PROMPT (so it asks nationality, never defaults to France, cites sources).
 * FALLBACK MODE (mock): if config/SDK missing OR a Bedrock call errors, it falls
 *   back to the local keyword mock so the page always works (and logs the error).
 *
 * MEMORY: the front sends `history` (array of {who,text,sources?}). On a normal
 *   turn we replay it as multi-turn Converse messages so Patrick remembers earlier
 *   answers (nationality, age, status) and stops re-asking. RAG context is injected
 *   only into the LAST user message.
 * SYNTHESIS: with `mode:"synthesis"` there is NO retrieval — Patrick reads the whole
 *   conversation and writes a structured one-pager (profil, questions, réponses clés,
 *   démarches prioritaires, ressources, prochaines étapes).
 *
 * REQUEST  (POST JSON): { "message": string, "lang": "fr" | "en",
 *                         "history"?: [{who,text,sources?}...], "mode"?: "synthesis" }
 * RESPONSE (JSON):      { "reply": string, "sources": [[name,url]...],
 *                         "unanswered": boolean, "rest": boolean, "synthesis"?: boolean }
 * -----------------------------------------------------------------------------
 */

const fs = require("fs");
const path = require("path");

/* ---- System prompt ---- */
let SYSTEM_PROMPT = "";
try { SYSTEM_PROMPT = fs.readFileSync(path.join(__dirname, "patrick-system-prompt.md"), "utf8"); }
catch { SYSTEM_PROMPT = "You are Patrick, a Working Holiday guide for Montreal. Ask for nationality before nationality-dependent facts; never default to France; cite official sources; never invent."; }

/* ---- Config ---- */
const CONFIG = {
  PER_IP_MAX: 12,
  PER_IP_WINDOW_MS: 60 * 60 * 1000,   // 1 hour
  DAILY_GLOBAL_MAX: 500,
  MAX_TOKENS: 1100,                    // caps generated length (cost) — 1100 évite les réponses coupées
  MAX_TOKENS_SYNTH: 1600,              // one-pager de synthèse (un peu plus long)
  TOP_K: 5,                            // chunks retrieved from the KB
  HISTORY_TURNS: 8                     // derniers tours envoyés au modèle (mémoire)
};

/* ---- Bedrock wiring (lazy; falls back to mock if unavailable) ---- */
const REGION  = process.env.AWS_REGION || "ca-central-1";
const KB_ID   = process.env.BEDROCK_KB_ID;
const MODEL   = process.env.BEDROCK_CLAUDE_PROFILE; // inference-profile id for Haiku in ca-central-1
let RetrieveCommand, ConverseCommand, agentClient, runtimeClient;
let BEDROCK_READY = false;
try {
  if (KB_ID && MODEL) {
    const agent = require("@aws-sdk/client-bedrock-agent-runtime");
    const rt    = require("@aws-sdk/client-bedrock-runtime");
    RetrieveCommand = agent.RetrieveCommand;
    ConverseCommand = rt.ConverseCommand;
    agentClient   = new agent.BedrockAgentRuntimeClient({ region: REGION });
    runtimeClient = new rt.BedrockRuntimeClient({ region: REGION });
    BEDROCK_READY = true;
  }
} catch (e) {
  console.error("[chat] AWS SDK unavailable → mock mode:", e.message);
  BEDROCK_READY = false;
}

/* ---- State (in-memory mock; use a shared store in prod) ---- */
const ipHits = new Map();
let dayKey = todayKey();
let dailyCount = 0;
function todayKey(){ return new Date().toISOString().slice(0, 10); }
function rollDayIfNeeded(){ const k = todayKey(); if (k !== dayKey){ dayKey = k; dailyCount = 0; ipHits.clear(); } }
function checkLimits(ip){
  rollDayIfNeeded();
  if (dailyCount >= CONFIG.DAILY_GLOBAL_MAX) return { ok:false, reason:"global" };
  const now = Date.now();
  const arr = (ipHits.get(ip) || []).filter(t => now - t < CONFIG.PER_IP_WINDOW_MS);
  if (arr.length >= CONFIG.PER_IP_MAX) return { ok:false, reason:"ip" };
  arr.push(now); ipHits.set(ip, arr);
  return { ok:true };
}

/* ---- Bedrock: retrieve + generate ---- */
async function bedrockRetrieve(message){
  const out = await agentClient.send(new RetrieveCommand({
    knowledgeBaseId: KB_ID,
    retrievalQuery: { text: String(message) },
    retrievalConfiguration: { vectorSearchConfiguration: { numberOfResults: CONFIG.TOP_K } }
  }));
  const results = out.retrievalResults || [];
  const chunks = results.map(r => (r.content && r.content.text) || "").filter(Boolean);
  // Pull official source URLs cited inside the retrieved fiches → clickable sources.
  const urls = [...new Set((chunks.join("\n").match(/https?:\/\/[^\s)>\]]+/g) || [])
    .map(u => u.replace(/[.,;]+$/,"")))].slice(0, 6);
  const sources = urls.map(u => [u.replace(/^https?:\/\/(www\.)?/, "").split("/")[0], u]);
  return { chunks, sources };
}
/** Low-level Converse call: takes prebuilt messages + a system prompt. */
async function bedrockConverse(messages, systemText, maxTokens){
  const resp = await runtimeClient.send(new ConverseCommand({
    modelId: MODEL,
    system: [{ text: systemText }],
    messages,
    inferenceConfig: { maxTokens: maxTokens || CONFIG.MAX_TOKENS, temperature: 0.2 }
  }));
  const parts = (resp.output && resp.output.message && resp.output.message.content) || [];
  return parts.map(p => p.text || "").join("").trim();
}

/**
 * Turn the browser `history` ([{who,text}]) into valid Converse `messages`.
 * Rules Bedrock enforces: must start with a `user` turn, roles must alternate,
 * and the last turn must be `user`. We keep only the last HISTORY_TURNS turns,
 * drop a leading assistant turn if the window starts on one, and guarantee the
 * conversation ends on the user's latest message.
 */
function buildMessages(history, lastUserText){
  const src = Array.isArray(history) ? history.slice(-CONFIG.HISTORY_TURNS) : [];
  let msgs = src
    .filter(m => m && (m.text != null) && String(m.text).trim())
    .map(m => ({
      role: m.who === "you" ? "user" : "assistant",
      content: [{ text: String(m.text) }]
    }));
  // Must start with a user turn.
  while (msgs.length && msgs[0].role !== "user") msgs.shift();
  // Collapse any accidental consecutive same-role turns (keep alternation).
  msgs = msgs.filter((m, i) => i === 0 || m.role !== msgs[i-1].role);
  // Ensure the conversation ends on the user's latest message.
  if (!msgs.length || msgs[msgs.length-1].role !== "user"){
    msgs.push({ role: "user", content: [{ text: String(lastUserText || "") }] });
  }
  return msgs;
}

/** Normal turn: RAG context is injected ONLY into the last (user) message. */
async function bedrockGenerate(message, chunks, lang, history){
  const context = chunks.map((c,i)=>`[Fiche ${i+1}]\n${c}`).join("\n\n");
  const userText =
    `Contexte — extraits du corpus Patrick (réponds UNIQUEMENT à partir d'ici + sources citées) :\n\n${context}\n\n` +
    `Langue de réponse : ${lang === "en" ? "anglais" : "français"}.\n` +
    `Question de l'utilisateur :\n${message}`;
  const msgs = buildMessages(history, message);
  msgs[msgs.length-1] = { role: "user", content: [{ text: userText }] };
  return await bedrockConverse(msgs, SYSTEM_PROMPT, CONFIG.MAX_TOKENS);
}

/* ---- Synthesis (one-pager, no retrieval) ---- */
const SYNTH_INSTRUCTION = {
  fr: "À partir de l'échange ci-dessous, rédige une SYNTHÈSE one-pager EN FRANÇAIS, structurée avec ces sections en titres Markdown :\n" +
      "## 1. Profil & situation\n## 2. Questions posées\n## 3. Réponses & recommandations clés\n## 4. Démarches prioritaires (avec délais)\n## 5. Ressources & liens utiles\n## 6. À clarifier / prochaines étapes\n" +
      "Concis, puces courtes, pas de copier-coller du chat. Reprends les liens officiels cités. " +
      "Termine par une ligne rappelant que c'est de l'information générale à vérifier aux sources officielles.",
  en: "From the exchange below, write a one-pager SUMMARY IN ENGLISH, structured with these Markdown headings:\n" +
      "## 1. Profile & situation\n## 2. Questions asked\n## 3. Key answers & recommendations\n## 4. Priority steps (with timelines)\n## 5. Useful resources & links\n## 6. To clarify / next steps\n" +
      "Concise, short bullets, no copy-paste of the chat. Reuse the official links cited. " +
      "End with a line reminding this is general info to verify with official sources."
};
function collectSources(history){
  const all = [].concat(...(Array.isArray(history)?history:[]).map(m => (m && m.sources) || []));
  return [...new Map(all.filter(s=>Array.isArray(s)&&s[1]).map(s=>[s[1], s])).values()].slice(0, 8);
}
function conversationToText(history){
  return (Array.isArray(history)?history:[])
    .filter(m => m && String(m.text||"").trim())
    .map(m => `${m.who === "you" ? "Utilisateur" : "Patrick"}: ${String(m.text).trim()}`)
    .join("\n");
}
/** Local fallback one-pager (used when Bedrock is unavailable). */
function localSynthesis(history, L){
  const d = new Date().toISOString().slice(0,10);
  const qs = (history||[]).filter(m=>m.who==="you").map(m=>String(m.text).trim());
  const links = collectSources(history);
  const T = L==="en"
    ? { t:"My Patrick roadmap", a:"Questions asked", k:"Key answers", r:"Useful resources", n:"Next steps",
        nt:"General info — verify anything sensitive (immigration, health, lease, money, taxes) with the official source." }
    : { t:"Ma feuille de route — Patrick", a:"Questions posées", k:"Réponses clés", r:"Ressources utiles", n:"Prochaines étapes",
        nt:"Info générale — vérifie les points sensibles (immigration, santé, bail, argent, impôts) à la source officielle." };
  let out = `# ${T.t}\n_${d}_\n\n## ${T.a}\n` + (qs.length?qs.map(q=>"- "+q).join("\n"):"—") + "\n\n## " + T.k + "\n";
  let lastQ="";
  for(const m of (history||[])){
    if(m.who==="you") lastQ=String(m.text).trim();
    else { out += (lastQ?`**${lastQ}**\n`:"") + String(m.text).trim() + "\n\n"; lastQ=""; }
  }
  if(links.length) out += `## ${T.r}\n` + links.map(([n,u])=>`- ${n} : ${u}`).join("\n") + "\n\n";
  out += `## ${T.n}\n- ${T.nt}\n`;
  return out.trim()+"\n";
}
async function handleSynthesis(history, L){
  const sources = collectSources(history);
  if (BEDROCK_READY){
    try {
      const userText = `${SYNTH_INSTRUCTION[L]}\n\n--- CONVERSATION ---\n${conversationToText(history)}`;
      const reply = await bedrockConverse(
        [{ role:"user", content:[{ text:userText }] }], SYSTEM_PROMPT, CONFIG.MAX_TOKENS_SYNTH);
      if (reply) return { status:200, body:{ reply, sources, unanswered:false, rest:false, synthesis:true } };
    } catch (e) {
      console.error("[chat] Bedrock synthesis error → local fallback:", e.name, e.message);
    }
  }
  return { status:200, body:{ reply:localSynthesis(history, L), sources, unanswered:false, rest:false, synthesis:true } };
}

/* ---- Mock corpus (fallback only) ---- */
const CORPUS = [
  { keys:["nas","sin"], fr:"Le NAS est gratuit et requis pour travailler : Service Canada, passeport + permis de travail.",
    en:"The SIN is free and required to work: Service Canada, passport + work permit.",
    src:[["Service Canada — NAS","https://www.canada.ca/fr/emploi-developpement-social/services/numero-assurance-sociale.html"]] },
  { keys:["ramq","santé","health","maladie"], fr:"La RAMQ n'est pas automatique pour tous : ça dépend de ta nationalité et de ton statut. En PVT, tu n'y as pas droit → assurance privée obligatoire.",
    en:"RAMQ isn't automatic for everyone: it depends on your nationality and status. On a Working Holiday you're not eligible → private insurance is mandatory.",
    src:[["RAMQ","https://www.ramq.gouv.qc.ca"]] },
  { keys:["logement","bail","housing","louer","rent"], fr:"Petites annonces OU agent immobilier (payé par le proprio). Ne verse jamais d'argent avant d'avoir visité.",
    en:"Classifieds OR a real-estate agent (paid by the owner). Never pay before visiting.",
    src:[["TAL","https://www.tal.gouv.qc.ca"]] },
  { keys:["transport","métro","metro","bus","chrono","opus"], fr:"App Chrono (ARTM) + carte OPUS en ville ; Orléans Express / Via Rail / FlixBus entre villes.",
    en:"Chrono app (ARTM) + OPUS card in the city; Orléans Express / Via Rail / FlixBus between cities.",
    src:[["ARTM / Chrono","https://www.artm.quebec/application-mobile-chrono/"]] }
];
const OFFTOPIC = ["bitcoin","recette","stock","football","python"];
function mockRetrieve(message){
  const s = String(message).toLowerCase();
  if (OFFTOPIC.some(k => s.includes(k))) return { offtopic:true };
  let best=null, score=0;
  for (const doc of CORPUS){ const h=doc.keys.filter(k=>s.includes(k)).length; if(h>score){score=h;best=doc;} }
  return score>0 ? { doc:best } : { none:true };
}

/* ---- Persistent anonymous log (DynamoDB) — INERT until env LOG_TABLE is set ---- */
let ddbClient = null, PutItemCommand = null, DDB_READY = false;
function initDdb(){
  if (DDB_READY || !process.env.LOG_TABLE) return;
  try {
    const m = require("@aws-sdk/client-dynamodb");
    PutItemCommand = m.PutItemCommand;
    ddbClient = new m.DynamoDBClient({ region: REGION });
    DDB_READY = true;
  } catch (e) { console.error("[log] DynamoDB SDK unavailable:", e.message); }
}
/** Fire-and-forget write of ONE anonymous event. No IP, no identity. Safe no-op if LOG_TABLE unset. */
function logToStore(evt){
  if (!process.env.LOG_TABLE) return;
  initDdb();
  if (!DDB_READY) return;
  const item = {
    id:       { S: `${Date.now()}-${Math.random().toString(36).slice(2,8)}` },
    ts:       { S: String(evt.ts || new Date().toISOString()) },
    type:     { S: String(evt.type || "q") },
    lang:     { S: String(evt.lang || "") },
    answered: { BOOL: !!evt.answered },
    sourced:  { BOOL: !!evt.sourced },
    question: { S: String(evt.question || "").slice(0, 300) }
  };
  ddbClient.send(new PutItemCommand({ TableName: process.env.LOG_TABLE, Item: item }))
    .catch(e => console.error("[log] DynamoDB put error:", e.name));
}

function logUnanswered(message){
  const evt = { type:"unanswered", ts:new Date().toISOString(), answered:false, sourced:false, question:String(message).slice(0,300) };
  console.log(JSON.stringify(evt)); logToStore(evt);
}
// Journal anonyme de TOUTES les questions (pour classer par fréquence). AUCUN identifiant : pas d'IP,
// pas de nom. Seuls la question (tronquée), la langue et l'issue.
function logQuestion(message, lang, answered, sourced){
  const evt = { type:"q", ts:new Date().toISOString(), lang, answered:!!answered, sourced:!!sourced, question:String(message||"").slice(0,300) };
  console.log(JSON.stringify(evt)); logToStore(evt);
}

const T = {
  fr:{ rest:"Patrick se repose 😴 — reviens plus tard (plafond de démo atteint).",
       ip:"Tu vas un peu vite 😅 — réessaie dans un moment.",
       offtopic:"Ceci n'est pas dans mes attributions : je me concentre sur le PVT et l'installation à Montréal.",
       unanswered:"Excellente question — je la note pour notre équipe. Je préfère ne pas deviner qu'affirmer une info non vérifiée.",
       bad:"Message vide." },
  en:{ rest:"Patrick is resting 😴 — come back later (demo cap reached).",
       ip:"A bit fast 😅 — try again in a moment.",
       offtopic:"That's outside my scope: I focus on the Working Holiday and settling in Montreal.",
       unanswered:"Great question — I'm logging it for our team. I'd rather not guess than assert unverified info.",
       bad:"Empty message." }
};

/** Pure core — async (Bedrock or mock). */
async function handleChat({ message, lang, history, mode } = {}, ip = "anon"){
  const L = (lang === "en") ? "en" : "fr";
  const isSynth = mode === "synthesis";

  // Validation depends on the mode.
  if (isSynth){
    if (!Array.isArray(history) || !history.length)
      return { status:400, body:{ reply:T[L].bad, sources:[], unanswered:false, rest:false } };
  } else if (!message || !String(message).trim()){
    return { status:400, body:{ reply:T[L].bad, sources:[], unanswered:false, rest:false } };
  }

  const lim = checkLimits(ip);
  if (!lim.ok){
    const msg = lim.reason === "global" ? T[L].rest : T[L].ip;
    return { status:429, body:{ reply:msg, sources:[], unanswered:false, rest:lim.reason==="global" } };
  }
  dailyCount++;

  // ---- SYNTHESIS: no retrieval, whole-conversation one-pager ----
  if (isSynth) return await handleSynthesis(history, L);

  // ---- REAL: Bedrock (Retrieve + Converse, with conversation memory) ----
  if (BEDROCK_READY){
    try {
      const { chunks, sources } = await bedrockRetrieve(message);
      if (!chunks.length){ logUnanswered(message); return { status:200, body:{ reply:T[L].unanswered, sources:[], unanswered:true, rest:false } }; }
      const reply = await bedrockGenerate(message, chunks, L, history);
      if (reply){ logQuestion(message, L, true, sources.length>0); return { status:200, body:{ reply, sources, unanswered:false, rest:false } }; }
      // empty generation → fall through to mock
    } catch (e) {
      console.error("[chat] Bedrock error → mock fallback:", e.name, e.message);
    }
  }

  // ---- FALLBACK: local mock ----
  const r = mockRetrieve(message);
  if (r.offtopic) return { status:200, body:{ reply:T[L].offtopic, sources:[], unanswered:false, rest:false } };
  if (r.none){ logUnanswered(message); return { status:200, body:{ reply:T[L].unanswered, sources:[], unanswered:true, rest:false } }; }
  logQuestion(message, L, true, (r.doc.src||[]).length>0);
  return { status:200, body:{ reply:r.doc[L], sources:r.doc.src, unanswered:false, rest:false } };
}

/* ---- HTTP adapter ---- */
function getIp(req){
  const xf = (req.headers && (req.headers["x-forwarded-for"] || req.headers["X-Forwarded-For"])) || "";
  return (Array.isArray(xf) ? xf[0] : String(xf).split(",")[0].trim()) || (req.socket && req.socket.remoteAddress) || "anon";
}
async function readBody(req){
  if (req.body) return typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  return await new Promise((resolve) => {
    let data=""; req.on("data",c=>data+=c); req.on("end",()=>{ try{ resolve(JSON.parse(data||"{}")); }catch{ resolve({}); } });
  });
}
async function handler(req, res){
  if (req.method !== "POST"){ res.statusCode=405; return res.end(JSON.stringify({ error:"Method not allowed" })); }
  let body; try { body = await readBody(req); } catch { body = {}; }
  const out = await handleChat(body, getIp(req));
  res.statusCode = out.status;
  res.setHeader("Content-Type","application/json");
  res.end(JSON.stringify(out.body));
}

module.exports = handler;
module.exports.default = handler;
module.exports.handleChat = handleChat;
module.exports.CONFIG = CONFIG;
module.exports.BEDROCK_READY = BEDROCK_READY;
module.exports._reset = () => { ipHits.clear(); dailyCount = 0; dayKey = todayKey(); };

/* ---- Self-test: `node api/chat.js` (runs the mock path when Bedrock isn't configured) ---- */
if (require.main === module){
  (async () => {
    const A = (label, cond) => console.log((cond?"✓":"✗")+" "+label);
    console.log("BEDROCK_READY =", BEDROCK_READY, "(mock path expected in this sandbox)");
    module.exports._reset();
    let r = await handleChat({ message:"comment obtenir mon NAS ?", lang:"fr" }, "1.1.1.1");
    A("réponse NAS + source", r.status===200 && /NAS/.test(r.body.reply) && r.body.sources.length>0);
    r = await handleChat({ message:"how do I get around metro?", lang:"en" }, "1.1.1.1");
    A("EN transport", r.status===200 && /Chrono|OPUS/.test(r.body.reply));
    r = await handleChat({ message:"quel est le prix du bitcoin ?", lang:"fr" }, "1.1.1.1");
    A("hors-sujet refusé", /attributions/.test(r.body.reply));
    r = await handleChat({ message:"question ultra pointue jamais vue xyz", lang:"fr" }, "1.1.1.1");
    A("question sans réponse loggée", r.body.unanswered===true);
    r = await handleChat({ message:"", lang:"fr" }, "1.1.1.1");
    A("message vide -> 400", r.status===400);
    // buildMessages: window starting on assistant must be dropped → starts on user, ends on user
    const bm = buildMessages([{who:"patrick",text:"a"},{who:"you",text:"b"},{who:"patrick",text:"c"},{who:"you",text:"d"}], "d");
    A("buildMessages commence par user", bm[0].role==="user");
    A("buildMessages finit par user", bm[bm.length-1].role==="user");
    A("buildMessages alterne", bm.every((m,i)=>i===0||m.role!==bm[i-1].role));
    // synthesis (mock path → local one-pager fallback)
    module.exports._reset();
    const syn = await handleChat({ mode:"synthesis", lang:"fr",
      history:[{who:"you",text:"comment obtenir mon NAS ?"},{who:"patrick",text:"Va à Service Canada avec ton passeport.",sources:[["Service Canada","https://www.canada.ca/fr/emploi-developpement-social/services/numero-assurance-sociale.html"]]}] }, "2.2.2.2");
    A("synthèse: one-pager structuré", syn.status===200 && syn.body.synthesis===true && /Profil|Questions/.test(syn.body.reply));
    A("synthèse: sources reprises", syn.body.sources.length>0);
    const synBad = await handleChat({ mode:"synthesis", lang:"fr", history:[] }, "2.2.2.2");
    A("synthèse sans historique -> 400", synBad.status===400);
    console.log("done.");
  })();
}
