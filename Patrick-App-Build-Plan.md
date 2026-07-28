# Patrick → Web App: Build Plan

*A step-by-step plan to turn Patrick (the Montreal-newcomer / PVT guide) into a public bilingual web app you can build with Claude's help. Free public service, cost-capped, phased.*

> ⚠️ **Verify-before-you-commit:** model names, API pricing, and free-tier limits change often. Treat every vendor-specific detail below as "check the provider's current page first." Nothing here is official immigration, legal, or financial advice.

---

## 1. What we're building

A single web page where anyone (no login) can chat with Patrick in French or English. Patrick answers using an LLM, searches trusted sources, cites links, and keeps his guardrails (no PII, "verify with a pro"). It runs on a free hosting tier, with a message cap so a viral day can't drain your budget.

**Design principle:** ship the smallest thing that actually helps a newcomer, then grow.

---

## 2. The architecture (plain English)

```
  Visitor's browser                 Your backend (hidden)              Anthropic
 ┌──────────────────┐   message    ┌───────────────────────┐  API   ┌───────────┐
 │  index.html      │ ───────────► │  /api/chat function   │ ─────► │  Claude   │
 │  (chat UI, FR/EN)│ ◄─────────── │  • holds Patrick prompt│ ◄───── │  + web    │
 │                  │   reply      │  • holds API key (secret)      │  search   │
 └──────────────────┘              │  • rate-limits callers │        └───────────┘
                                   └───────────────────────┘
```

Three parts:

1. **Frontend** — one HTML page: chat box, FR/EN toggle, disclaimer, renders answers + source links.
2. **Backend function** — a tiny serverless function that stores Patrick's system prompt, calls the Claude API (with web search), and holds your secret API key. **The key must live here, never in the browser.**
3. **The model + web search** — Claude generates Patrick's replies; the built-in web search lets him cite real pages.

---

## 3. Cost guardrails (read this twice)

A public, no-login chatbot is an open door to your API bill. Every answer costs you a fraction of a cent. Non-negotiable protections for v1:

- **Per-visitor rate limit** — e.g. max N messages per IP per hour.
- **Global daily ceiling** — the function stops answering past a set number of messages/day, showing "Patrick is resting, come back tomorrow."
- **Cap `max_tokens`** — shorter answers cost less.
- **Consider a cheaper model** — a smaller/faster Claude model for a high-traffic public bot; a bigger one only if quality demands it. *(Verify current model lineup + pricing.)*
- **Optional light captcha** — deters bots/scrapers hammering the endpoint.

---

## 4. Phased roadmap

### Phase 0 — Validate (before writing app code)
Share your existing GPT / `.skill` in 2–3 real PVTiste communities (pvtistes.net forums, FB groups, OFQJ networks). Do people actually ask Patrick things? **This is your real signal.** If nobody engages with the free version, an app won't fix that.

### Phase 1 — MVP web app  *(the code in this repo)*
Single-page chatbot, bilingual, capped, on a free tier. Goal: a real URL you can share.

### Phase 2 — Polish
Printable-guide export (reuse Patrick's wrap-up doc), a feedback button, basic analytics (how many chats, top questions), nicer mobile layout.

### Phase 3 — Spread
Turn it into an **embeddable widget** partners (OFQJ, city services, pvtistes) can drop on their sites. This is the real reach multiplier.

---

## 5. Sustainability (you said you hadn't thought about it)

Even free-to-users costs *you* per message. Options, from lean to ambitious:

| Path | Notes |
|---|---|
| **Self-fund, capped** | Fine at small scale; the caps in §3 keep it cheap. |
| **Donations** | A "buy Patrick a poutine" button once people love it. |
| **Grant / partnership** | Québec–France youth-mobility bodies (OFQJ, etc.) fund newcomer services. Strongest fit for a mission like this. |
| **Widget licensing** | Partners pay to embed. Only viable after Phase 2–3 proves value. |

**Coach's note:** don't monetize until people use it. Reach first, revenue later.

---

## 6. Deploy checklist (Phase 1)

1. ☐ Get an **Anthropic API key** (console account, billing set, spend limit configured).
2. ☐ Pick a host with a free tier that supports serverless functions. *(Verify current options/limits.)*
3. ☐ Put your API key in the host's **environment variables** — never in code or the browser.
4. ☐ Deploy the frontend + `/api/chat` function.
5. ☐ Test in French and English; confirm sources appear and the disclaimer shows.
6. ☐ Confirm the rate limit + daily cap actually trigger (test them).
7. ☐ Set a **hard spend limit** in the Anthropic console as a final backstop.
8. ☐ Buy a domain (optional) and share the link in your Phase-0 communities.

---

## 7. Legal / trust guardrails

- Keep Patrick's **"general info, not official advice — verify with a professional"** disclaimer visible on-screen, not just in his replies.
- **Never store PII.** Patrick already refuses it; the app shouldn't log message contents with identifiers.
- Add a short **privacy note**: what you do/don't keep (aim for: nothing personal).
- Immigration/health/legal topics are sensitive — always point to official sources (IRCC, RAMQ, TAL) for anything binding.

---

## 8. What Claude can generate for you

- ✅ The full MVP code (frontend + backend) — *see the `patrick-app/` folder.*
- ✅ Deploy walkthroughs for your chosen host.
- ✅ The rate-limiting logic.
- ✅ Phase 2 features when you're ready.

**Next:** the working MVP is in `patrick-app/` — read its `README.md` to deploy.
