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
 * REQUEST  (POST JSON): { "message": string, "lang": "fr" | "en" }
 * RESPONSE (JSON):      { "reply": string, "sources": [[name,url]...],
 *                         "unanswered": boolean, "rest": boolean }
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
  MAX_TOKENS: 500,                     // caps generated length (cost)
  TOP_K: 5                             // chunks retrieved from the KB
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
async function bedrockGenerate(message, chunks, lang){
  const context = chunks.map((c,i)=>`[Fiche ${i+1}]\n${c}`).join("\n\n");
  const userText =
    `Contexte — extraits du corpus Patrick (réponds UNIQUEMENT à partir d'ici + sources citées) :\n\n${context}\n\n` +
    `Langue de réponse : ${lang === "en" ? "anglais" : "français"}.\n` +
    `Question de l'utilisateur :\n${message}`;
  const resp = await runtimeClient.send(new ConverseCommand({
    modelId: MODEL,
    system: [{ text: SYSTEM_PROMPT }],
    messages: [{ role: "user", content: [{ text: userText }] }],
    inferenceConfig: { maxTokens: CONFIG.MAX_TOKENS, temperature: 0.2 }
  }));
  const parts = (resp.output && resp.output.message && resp.output.message.content) || [];
  return parts.map(p => p.text || "").join("").trim();
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

function logUnanswered(message){
  console.log(JSON.stringify({ type:"unanswered", ts:new Date().toISOString(), question:String(message).slice(0,300) }));
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
async function handleChat({ message, lang } = {}, ip = "anon"){
  const L = (lang === "en") ? "en" : "fr";
  if (!message || !String(message).trim())
    return { status:400, body:{ reply:T[L].bad, sources:[], unanswered:false, rest:false } };

  const lim = checkLimits(ip);
  if (!lim.ok){
    const msg = lim.reason === "global" ? T[L].rest : T[L].ip;
    return { status:429, body:{ reply:msg, sources:[], unanswered:false, rest:lim.reason==="global" } };
  }
  dailyCount++;

  // ---- REAL: Bedrock (Retrieve + Converse) ----
  if (BEDROCK_READY){
    try {
      const { chunks, sources } = await bedrockRetrieve(message);
      if (!chunks.length){ logUnanswered(message); return { status:200, body:{ reply:T[L].unanswered, sources:[], unanswered:true, rest:false } }; }
      const reply = await bedrockGenerate(message, chunks, L);
      if (reply) return { status:200, body:{ reply, sources, unanswered:false, rest:false } };
      // empty generation → fall through to mock
    } catch (e) {
      console.error("[chat] Bedrock error → mock fallback:", e.name, e.message);
    }
  }

  // ---- FALLBACK: local mock ----
  const r = mockRetrieve(message);
  if (r.offtopic) return { status:200, body:{ reply:T[L].offtopic, sources:[], unanswered:false, rest:false } };
  if (r.none){ logUnanswered(message); return { status:200, body:{ reply:T[L].unanswered, sources:[], unanswered:true, rest:false } }; }
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
    module.exports._reset();
    let blocked=false;
    for (let i=0;i<CONFIG.PER_IP_MAX+2;i++){ const rr=await handleChat({message:"nas",lang:"fr"},"9.9.9.9"); if(rr.status===429) blocked=true; }
    A("rate-limit par IP déclenché", blocked);
    console.log("done.");
  })();
}
