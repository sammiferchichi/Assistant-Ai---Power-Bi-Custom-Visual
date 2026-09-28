# Power BI custom visual Assistant AI — Open-Source Version

Custom Visual Power BI (TypeScript) + Express proxy for Gemini / Groq / Local LLM (Ollama).
No secrets in this repo. Use your own API keys via `.env`.

> Original PFE project: churn prediction + Power BI dashboard + XAI assistant.
> This folder contains only the AI assistant visual, sanitized for GitHub.

## Architecture

```
Power BI (visual.ts update()) -> aggregates data -> POST /chat -> proxy.js -> Gemini / Groq / Ollama
```

* `Assistant Ai/src/visual.ts`: UI, aggregation, XAI mode (1 row = selected client), typewriter, Idle/Talk video
* `Assistant Ai/src/visual.template.ts`: video URLs + UI texts (edit me)
* `Assistant Ai/capabilities.json`: WebAccess privileges (edit domains)
* `server/proxy.js`: keeps API keys server-side, never in the visual

## 1. Setup proxy + add your own API key

```bash
cd server
npm install
cp .env.example .env
# edit .env with notepad
node proxy.js
# -> Proxy running on http://localhost:3000
```

Get keys:
* Gemini (free): https://aistudio.google.com/app/apikey -> `GEMINI_API_KEY=...`
* Groq (free): https://console.groq.com/keys -> `GROQ_API_KEY=...`

Test: `POST http://localhost:3000/chat` with `{ "model":"gemini", "contents":[{"role":"user","parts":[{"text":"dis juste: API OK"}]}] }`

Deploy (Render / Railway / Fly):
* Build: `npm install`, Start: `node proxy.js`
* Set Environment Variables `GEMINI_API_KEY`, `GROQ_API_KEY` in dashboard, not in code.
* Update `API_URL` in `Assistant Ai/src/visual.ts:14` and domains in `capabilities.json`, then `npm run package`.

## 2. Use a local LLM (no key, free, private)

Install Ollama: https://ollama.com

```bash
ollama pull llama3.1
ollama serve
# server/.env:
# LOCAL_LLM_URL=http://localhost:11434/api/chat
# LOCAL_LLM_MODEL=llama3.1
node proxy.js
```

In Power BI visual, select `Local LLM (Ollama)` in dropdown. Proxy uses `model: "local"`.

LM Studio alternative: start local server (OpenAI-compatible, e.g. `http://localhost:1234/v1/chat/completions`), set `LOCAL_LLM_URL` accordingly. Response parsers support both Ollama `{message.content}` and OpenAI `{choices[0].message.content}` formats.

## 3. Setup visual

```bash
npm install -g powerbi-visuals-tools
cd Assistant Ai
npm install
# edit src/visual.template.ts (VIDEO_SRC), src/visual.ts (API_URL), pbiviz.json (guid/author), capabilities.json (domains)
npx tsc --noEmit
npm run package
# dist/*.pbiviz -> Power BI Desktop > ... > Import visual > add columns to "Données"
```

Videos must be HTTPS (Cloudinary or other). For offline dev, put `.webm` in `assets/` and update template.

## Demo

<video src="https://github.com/user-attachments/assets/b2930085-3498-4d62-a2cd-e856dea72eac" controls width="700"></video>

## Steps How to add the Custom visual in Power BI


<img width="2048" height="1462" alt="steps" src="https://github.com/user-attachments/assets/956a5e2e-6397-46f6-a252-4f69ff77e716" />


# good luck :)
