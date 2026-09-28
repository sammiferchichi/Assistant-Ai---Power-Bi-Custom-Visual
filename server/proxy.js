const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const GROQ_API_KEY = process.env.GROQ_API_KEY || "";
// Local LLM (Ollama) — no key needed. Default: http://localhost:11434
const LOCAL_LLM_URL = process.env.LOCAL_LLM_URL || "http://localhost:11434/api/chat";
const LOCAL_LLM_MODEL = process.env.LOCAL_LLM_MODEL || "llama3.1";

app.get("/", (req, res) => res.send("Proxy OK. Use POST /chat"));

app.post("/chat", async (req, res) => {
    try {
        const fetch = (await import("node-fetch")).default;
        const model = req.body.model || "gemini";

        let contents = req.body.contents || [];
        const systemPrompt = req.body.system_instruction?.parts?.[0]?.text || "";

        let data;

        if (model === "gemini") {
            if (!GEMINI_API_KEY) return res.status(400).json({ error: "Missing GEMINI_API_KEY on server (.env)" });
            if (systemPrompt && contents.length > 0) {
                contents = [
                    { role: "user", parts: [{ text: systemPrompt + "\n\nMa question: " + contents[0].parts[0].text }] },
                    ...contents.slice(1)
                ];
            }
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
                { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ contents }) }
            );
            data = await response.json();
            const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || JSON.stringify(data);
            return res.json({ reply: text });

        } else if (model === "groq") {
            if (!GROQ_API_KEY) return res.status(400).json({ error: "Missing GROQ_API_KEY on server (.env)" });
            const messages = [];
            if (systemPrompt) messages.push({ role: "system", content: systemPrompt });
            contents.forEach((msg) => {
                messages.push({ role: msg.role === "model" ? "assistant" : msg.role, content: msg.parts[0].text });
            });
            const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${GROQ_API_KEY}` },
                body: JSON.stringify({ model: "llama-3.3-70b-versatile", messages, max_tokens: 1000 })
            });
            data = await response.json();
            const text = data?.choices?.[0]?.message?.content || JSON.stringify(data);
            return res.json({ reply: text });

        } else if (model === "local") {
            // Ollama-compatible endpoint. Works with Ollama, LM Studio (OpenAI-compatible), etc.
            // Ollama native: POST http://localhost:11434/api/chat { model, messages, stream:false }
            const messages = [];
            if (systemPrompt) messages.push({ role: "system", content: systemPrompt });
            contents.forEach((msg) => {
                messages.push({ role: msg.role === "model" ? "assistant" : msg.role, content: msg.parts[0].text });
            });
            const response = await fetch(LOCAL_LLM_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ model: LOCAL_LLM_MODEL, messages, stream: false })
            });
            data = await response.json();
            // Ollama format: { message: { content } } | OpenAI format: { choices[0].message.content }
            const text = data?.message?.content || data?.choices?.[0]?.message?.content || JSON.stringify(data);
            return res.json({ reply: text });

        } else {
            return res.status(400).json({ error: "Unknown model. Use: gemini | groq | local" });
        }
    } catch (error) {
        console.log("Erreur:", error.message);
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Proxy running on http://localhost:${PORT}`));
