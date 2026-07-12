const express = require("express");
const fs = require("fs");
const path = require("path");

loadEnvFile();

const app = express();
const PORT = 3000;
const DB_FILE = path.join(__dirname, "database.json");

app.use(express.json());
app.use(express.static(path.join(__dirname, "Public")));

function loadEnvFile() {
  const envPath = path.join(__dirname, ".env");
  if (!fs.existsSync(envPath)) return;

  const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);
  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;

    const equalIndex = trimmed.indexOf("=");
    if (equalIndex === -1) return;

    const key = trimmed.slice(0, equalIndex).trim();
    const value = trimmed.slice(equalIndex + 1).trim().replace(/^['"]|['"]$/g, "");
    if (key && !process.env[key]) process.env[key] = value;
  });
}

function readDB() {
  return JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
}

function writeDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

function getResponseText(data) {
  if (data.output_text) return data.output_text;

  const parts = [];
  (data.output || []).forEach((item) => {
    (item.content || []).forEach((content) => {
      if (content.type === "output_text" && content.text) parts.push(content.text);
    });
  });

  return parts.join("\n").trim();
}

function buildOfflineExplanation(question) {
  const topic = question || "this SSC topic";
  return [
    `Offline explainer for: ${topic}`,
    "",
    "1. Meaning: First understand what the topic is asking in simple words.",
    "2. Formula or rule: Write the main formula/rule in your notebook.",
    "3. Example: Solve one easy example slowly without timer.",
    "4. Practice: Solve 10 basic questions, then 10 exam-level questions.",
    "5. Revision: Mark mistakes and revise them tomorrow.",
    "",
    "For free AI, install Ollama and run: ollama pull llama3.2"
  ].join("\n");
}

function buildTutorPrompt(question, style) {
  return [
    "You are an SSC exam tutor for India.",
    "Explain in very simple language, step by step.",
    "Use short headings, formulas when useful, one worked example, common mistakes, and a small practice task.",
    "Do not invent current exam dates. Tell the student to check ssc.gov.in for dates.",
    `Style: ${style}`,
    `Question: ${question}`
  ].join("\n");
}

async function explainWithOllama(question, style) {
  const model = process.env.OLLAMA_MODEL || "llama3.2";
  const ollamaUrl = process.env.OLLAMA_URL || "http://localhost:11434/api/generate";

  const res = await fetch(ollamaUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      prompt: buildTutorPrompt(question, style),
      stream: false,
      options: {
        temperature: 0.3
      }
    })
  });

  if (!res.ok) {
    throw new Error("Ollama is not ready. Install Ollama, run ollama pull llama3.2, then restart this app.");
  }

  const data = await res.json();
  return data.response || "No answer returned from Ollama.";
}


function extractGeminiText(data) {
  if (data.output_text) return data.output_text;

  const parts = [];

  (data.candidates || []).forEach((candidate) => {
    (candidate.content?.parts || []).forEach((part) => {
      if (part.text) parts.push(part.text);
    });
  });

  (data.steps || []).forEach((step) => {
    (step.content || []).forEach((content) => {
      if (content.text) parts.push(content.text);
      if (content.type === "text" && content.data) parts.push(content.data);
    });
  });

  return parts.join("\n").trim();
}

function extractGeminiAudio(data) {
  if (data.output_audio?.data) return data.output_audio.data;

  for (const step of data.steps || []) {
    for (const content of step.content || []) {
      if (content.audio?.data) return content.audio.data;
      if (content.type === "audio" && content.data) return content.data;
    }
  }

  return "";
}

async function explainWithGemini(question, style) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "your_gemini_key_here") {
    throw new Error("Gemini key is missing here. Put your real key in E:\\trash\\IRL\\.env and restart node server.js.");
  }

  const preferredModels = [
    process.env.GEMINI_MODEL || "gemini-2.0-flash",
    "gemini-3.5-flash",
    "gemini-2.0-flash",
    "gemini-1.5-flash"
  ].filter((model, index, list) => model && list.indexOf(model) === index);

  let lastError = "Gemini request failed.";

  for (const model of preferredModels) {
    const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: "You are an SSC exam tutor for India. Explain in very simple language, step by step. Use short headings, formulas when useful, one worked example, common mistakes, and a small practice task. Do not invent current exam dates; tell the student to check ssc.gov.in for dates." }]
        },
        contents: [{
          role: "user",
          parts: [{ text: `Student wants a ${style} explanation. Question: ${question}` }]
        }],
        generationConfig: {
          temperature: 0.35,
          maxOutputTokens: 900
        }
      })
    });

    const data = await geminiRes.json();

    if (geminiRes.ok) {
      return extractGeminiText(data) || `Gemini answered, but no text was returned from ${model}.`;
    }

    lastError = data.error?.message || `${model} failed with status ${geminiRes.status}.`;
  }

  throw new Error(`Gemini failed: ${lastError}`);
}
async function explainWithOpenAI(question, style) {
  const aiRes = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || "gpt-5.6-luna",
      instructions: "You are an SSC exam tutor for India. Explain in very simple language, step by step. Use short headings, formulas when useful, one worked example, common mistakes, and a small practice task. Do not invent current exam dates; tell the student to check ssc.gov.in for dates.",
      input: `Student wants a ${style} explanation. Question: ${question}`,
      max_output_tokens: 900
    })
  });

  const data = await aiRes.json();

  if (!aiRes.ok) {
    throw new Error(data.error?.message || "OpenAI request failed.");
  }

  return getResponseText(data) || "No answer returned.";
}

function decodeXml(value) {
  return String(value || "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCharCode(parseInt(code, 16)));
}

function stripTags(value) {
  return String(value || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function cleanRssText(value) {
  return stripTags(decodeXml(value))
    .replace(/\u00a0/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function cleanNewsTitle(value) {
  return cleanRssText(value).replace(/\s+-\s+[^-]{2,90}$/, "").trim();
}

function parseRssItems(xml, source, limit = 8) {
  const items = [];
  const blocks = String(xml || "").match(/<item[\s\S]*?<\/item>/gi) || [];
  for (const block of blocks.slice(0, limit)) {
    const pickRaw = (tag) => {
      const match = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));
      return match ? match[1] : "";
    };
    const title = cleanNewsTitle(pickRaw("title"));
    const link = cleanRssText(pickRaw("link")) || "https://ssc.gov.in";
    const rawSummary = cleanRssText(pickRaw("description"));
    const summary = rawSummary.replace(title, "").replace(/\s+-\s+[^-]{2,90}$/, "").trim() || "Open the source and make one exam-focused note.";
    const pubDate = cleanRssText(pickRaw("pubDate"));
    const dateValue = new Date(pubDate);
    const date = Number.isNaN(dateValue.getTime()) ? "Latest" : dateValue.toLocaleDateString("en-IN");
    if (title) items.push({ title, link, summary: summary.slice(0, 260), source, date });
  }
  return items;
}

function offlineNewsPayload() {
  const today = new Date().toLocaleDateString("en-IN");
  return {
    mode: "fallback",
    lastUpdated: today,
    examUpdates: [
      { title: "SSC official website", source: "ssc.gov.in", link: "https://ssc.gov.in", date: "Check daily", summary: "Use this for notification, registration, admit card, result, answer key, and exam calendar.", study: "Verify every date and deadline on the official SSC website." },
      { title: "Registration checklist", source: "IRL RPG", link: "https://ssc.gov.in", date: today, summary: "When a form opens, check eligibility, age, fee, photo/signature, and final date.", study: "Keep documents ready before the last day." },
      { title: "Exam calendar planning", source: "IRL RPG", link: "https://ssc.gov.in", date: today, summary: "Use tentative dates to plan mocks and revision.", study: "Reverse plan from exam date to today." }
    ],
    currentAffairs: [
      { title: "Daily PIB scan", source: "PIB", link: "https://www.pib.gov.in", date: today, summary: "Read schemes, cabinet decisions, reports, awards, science, economy, and environment updates.", study: "Convert each update into one MCQ fact." },
      { title: "SSC current affairs filter", source: "IRL RPG", link: "https://www.pib.gov.in", date: today, summary: "Focus on facts that can become MCQ questions, not drama.", study: "Write who, what, where, when, why, and static GK link." }
    ]
  };
}

app.get("/api/news", async (req, res) => {
  const payload = offlineNewsPayload();
  try {
    const feeds = [
      { key: "examUpdates", source: "Google News / SSC", url: "https://news.google.com/rss/search?q=SSC%20exam%20ssc.gov.in%20notification%20admit%20card%20result&hl=en-IN&gl=IN&ceid=IN:en" },
      { key: "currentAffairs", source: "Google News / Current Affairs", url: "https://news.google.com/rss/search?q=India%20current%20affairs%20PIB%20government%20scheme%20economy%20science&hl=en-IN&gl=IN&ceid=IN:en" }
    ];

    for (const feed of feeds) {
      const response = await fetch(feed.url, { headers: { "User-Agent": "IRL-RPG-Study-App/1.0" } });
      if (!response.ok) continue;
      const xml = await response.text();
      const items = parseRssItems(xml, feed.source, 8);
      if (items.length) payload[feed.key] = items;
    }

    payload.mode = "live";
    payload.lastUpdated = new Date().toLocaleString("en-IN");
    res.json(payload);
  } catch (error) {
    res.json(payload);
  }
});
app.get("/api/data", (req, res) => {
  res.json(readDB());
});

app.post("/api/complete", (req, res) => {
  const db = readDB();
  const quest = db.quests.find(q => q.id === req.body.id);

  if (!quest) return res.status(404).json({ error: "Quest not found" });

  db.xp += quest.xp;

  if (db.xp >= db.level * 100) {
    db.xp -= db.level * 100;
    db.level += 1;
  }

  writeDB(db);
  res.json(db);
});

app.post("/api/explain", async (req, res) => {
  const question = String(req.body.question || "").trim();
  const style = String(req.body.style || "simple").trim();
  const provider = String(process.env.AI_PROVIDER || "ollama").toLowerCase();

  if (!question) {
    return res.status(400).json({ error: "Ask a question first." });
  }

  try {
    if (provider === "gemini") {
      const answer = await explainWithGemini(question, style);
      return res.json({ answer, mode: "gemini" });
    }

    if (provider === "openai" && process.env.OPENAI_API_KEY) {
      const answer = await explainWithOpenAI(question, style);
      return res.json({ answer, mode: "ai" });
    }

    const answer = await explainWithOllama(question, style);
    return res.json({ answer, mode: "local" });
  } catch (error) {
    try {
      const answer = await explainWithOllama(question, style);
      return res.json({ answer, mode: "local" });
    } catch (_) {
      const fallback = buildOfflineExplanation(question);
      return res.json({ answer: `${error.message}\n\n${fallback}`, mode: "offline" });
    }
  }
});

app.post("/api/speech", async (req, res) => {
  const text = String(req.body.text || "").trim().slice(0, 3500);
  const provider = String(process.env.AI_PROVIDER || "gemini").toLowerCase();

  if (!text) {
    return res.status(400).json({ error: "No text to read." });
  }

  if (provider === "gemini" && process.env.GEMINI_API_KEY) {
    try {
      const voiceRes = await fetch("https://generativelanguage.googleapis.com/v1beta/interactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": process.env.GEMINI_API_KEY
        },
        body: JSON.stringify({
          model: process.env.GEMINI_TTS_MODEL || "gemini-3.1-flash-tts-preview",
          input: `Say as a warm, gentle female SSC tutor, clear and encouraging: ${text}`,
          response_format: { type: "audio" },
          generation_config: {
            speech_config: [
              { voice: process.env.GEMINI_TTS_VOICE || "Aoede" }
            ]
          }
        })
      });

      const data = await voiceRes.json();

      if (!voiceRes.ok) {
        return res.status(500).json({ error: data.error?.message || "Gemini voice unavailable. Using browser voice." });
      }

      const base64Audio = extractGeminiAudio(data);
      if (!base64Audio) {
        return res.status(500).json({ error: "Gemini did not return audio. Using browser voice." });
      }

      res.setHeader("Content-Type", "audio/wav");
      res.setHeader("Cache-Control", "no-store");
      return res.send(Buffer.from(base64Audio, "base64"));
    } catch (error) {
      return res.status(500).json({ error: "Gemini voice unavailable. Using browser voice." });
    }
  }

  if (provider === "openai" && process.env.OPENAI_API_KEY) {
    try {
      const voiceRes = await fetch("https://api.openai.com/v1/audio/speech", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: process.env.OPENAI_TTS_MODEL || "gpt-4o-mini-tts",
          voice: process.env.OPENAI_TTS_VOICE || "nova",
          input: text,
          response_format: "mp3",
          instructions: "Speak like a warm, patient female SSC tutor. Keep the voice clear, gentle, and encouraging."
        })
      });

      if (!voiceRes.ok) return res.status(500).json({ error: "OpenAI voice unavailable. Using browser voice." });

      const audioBuffer = Buffer.from(await voiceRes.arrayBuffer());
      res.setHeader("Content-Type", "audio/mpeg");
      res.setHeader("Cache-Control", "no-store");
      return res.send(audioBuffer);
    } catch (error) {
      return res.status(500).json({ error: "OpenAI voice unavailable. Using browser voice." });
    }
  }

  res.status(400).json({ error: "Cloud voice not configured. Using browser voice." });
});
app.listen(PORT, () => {
  console.log(`IRL RPG running at http://localhost:${PORT}`);
});

