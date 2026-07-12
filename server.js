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

function getBuiltInTopic(question) {
  const text = String(question || "").toLowerCase();
  if (/percentage|percent|%|fraction|1\/3|3\/4/.test(text)) return "percentage";
  if (/ratio|proportion/.test(text)) return "ratio";
  if (/profit|loss|discount|cp|sp|cost price|selling price/.test(text)) return "profit-loss";
  if (/interest|simple interest|compound interest|\bsi\b|\bci\b/.test(text)) return "interest";
  if (/time and work|work|pipe|cistern|efficiency/.test(text)) return "time-work";
  if (/speed|distance|train|boat|stream/.test(text)) return "speed-distance";
  if (/series|number series|alphabet series/.test(text)) return "series";
  if (/coding|decoding|code language/.test(text)) return "coding";
  if (/syllogism|statement|conclusion|only a few/.test(text)) return "syllogism";
  if (/tense|verb|grammar|english|error spotting/.test(text)) return "english-grammar";
  if (/parts of speech|noun|pronoun|adjective|adverb/.test(text)) return "parts-speech";
  if (/current affairs|news|scheme|award|appointment|pib|ministry/.test(text)) return "current-affairs";
  if (/study plan|\bplan\b|routine|schedule|timetable/.test(text)) return "study-plan";
  return "general";
}

const builtInLessons = {
  percentage: {
    title: "Percentage",
    meaning: "Percentage means per 100. It helps compare marks, discounts, profit, population, and data in one common scale.",
    rule: "Percentage = Part / Whole x 100. To find a percent of a number: Percent x Number / 100.",
    example: "If you score 40 marks out of 80, percentage = 40 / 80 x 100 = 50%.",
    mistake: "Do not confuse fractions. 1/3 is 33.33%, 1/2 is 50%, 3/4 is 75%.",
    practice: "Solve these: 15% of 200, 12.5% of 480, and what percent is 45 out of 90?"
  },
  ratio: {
    title: "Ratio and Proportion",
    meaning: "Ratio compares two quantities. Proportion says two ratios are equal.",
    rule: "For a:b, total parts = a + b. One part value = total / total parts.",
    example: "If boys:girls = 3:2 and total is 50, one part = 50 / 5 = 10. Boys = 30, girls = 20.",
    mistake: "Never add actual numbers before finding one part. First convert ratio parts into real values.",
    practice: "Solve: A:B = 5:7 and total is 72. Find A and B."
  },
  "profit-loss": {
    title: "Profit and Loss",
    meaning: "Cost price is buying price. Selling price is selling price. Profit happens when SP is more than CP.",
    rule: "Profit = SP - CP. Loss = CP - SP. Profit% = Profit / CP x 100. Loss% = Loss / CP x 100.",
    example: "CP = 500 and SP = 600. Profit = 100, so profit% = 100 / 500 x 100 = 20%.",
    mistake: "Profit and loss percent are always calculated on CP unless the question says otherwise.",
    practice: "Solve: CP = 800, SP = 720. Find loss and loss percent."
  },
  interest: {
    title: "Simple and Compound Interest",
    meaning: "Interest is extra money paid on principal. SSC asks mostly formula and comparison questions.",
    rule: "Simple Interest = P x R x T / 100. Amount = Principal + Interest.",
    example: "P = 1000, R = 10%, T = 2 years. SI = 1000 x 10 x 2 / 100 = 200.",
    mistake: "Check time units. If time is in months, convert to years before using the formula.",
    practice: "Solve: P = 2500, R = 8%, T = 3 years. Find SI."
  },
  "time-work": {
    title: "Time and Work",
    meaning: "This topic is about speed of doing work. More people or more efficiency usually means less time.",
    rule: "If a person finishes work in n days, one day work = 1/n. Combined work = sum of one day work.",
    example: "A does work in 10 days and B in 15 days. Together one day work = 1/10 + 1/15 = 1/6, so 6 days.",
    mistake: "Do not add days directly. Add work per day.",
    practice: "Solve: A in 12 days, B in 18 days. Together how many days?"
  },
  "speed-distance": {
    title: "Time, Speed and Distance",
    meaning: "Speed tells how fast distance is covered. SSC often mixes units.",
    rule: "Speed = Distance / Time. Distance = Speed x Time. 1 m/s = 18/5 km/h.",
    example: "Distance 120 km, speed 40 km/h, time = 120 / 40 = 3 hours.",
    mistake: "Always convert units before solving. Do not mix minutes with hours.",
    practice: "Solve: A train travels 180 km in 3 hours. Find speed."
  },
  series: {
    title: "Reasoning Series",
    meaning: "Series questions test pattern finding in numbers, letters, or mixed symbols.",
    rule: "Check difference, multiplication, square/cube, alternating pattern, and alphabet position.",
    example: "2, 4, 8, 16, ? follows x2, so answer is 32.",
    mistake: "Do not stop at the first pattern if it fails later. Test it on every term.",
    practice: "Solve: 3, 6, 12, 24, ? and A, C, F, J, ?"
  },
  coding: {
    title: "Coding-Decoding",
    meaning: "A word or number is written in a hidden rule. You must find the rule and apply it.",
    rule: "Check alphabet shift, reverse order, pair swap, number position, and vowel/consonant pattern.",
    example: "If CAT is DBU, each letter moves +1. DOG becomes EPH.",
    mistake: "Check whether the same shift applies to all letters before answering.",
    practice: "If BOOK is coded as CPPL, code TREE."
  },
  syllogism: {
    title: "Syllogism",
    meaning: "Syllogism checks what must be true from given statements, not what feels true in real life.",
    rule: "Draw simple circles for all, no, some, and some not. Follow only the statement.",
    example: "All cats are animals. Some animals are black. You cannot say some cats are black unless forced.",
    mistake: "Do not use outside knowledge. Use only the given statement.",
    practice: "Practice 10 questions by drawing circles slowly."
  },
  "english-grammar": {
    title: "SSC English Grammar",
    meaning: "Grammar questions test rule use in sentences: tense, subject-verb agreement, preposition, article, and error spotting.",
    rule: "Read the full sentence, find subject and verb, then check tense and grammar connection.",
    example: "He go to school is wrong. He goes to school is correct because singular subject takes singular verb.",
    mistake: "Do not judge by sound only. Find the grammar rule.",
    practice: "Write 5 sentences and mark subject, verb, tense, and error."
  },
  "parts-speech": {
    title: "Parts of Speech",
    meaning: "Parts of speech tell the job of each word in a sentence.",
    rule: "Noun names. Pronoun replaces noun. Verb shows action/state. Adjective describes noun. Adverb describes verb/adjective/adverb.",
    example: "The smart student quickly solved it. smart = adjective, student = noun, quickly = adverb, solved = verb.",
    mistake: "A word can change role depending on the sentence. Always check the job in that sentence.",
    practice: "Pick 10 sentences and mark noun, verb, adjective, and adverb."
  },
  "current-affairs": {
    title: "Current Affairs for SSC",
    meaning: "Current affairs is not just news. For SSC, turn news into exam facts.",
    rule: "For every news item write: who, what, where, when, why, and static GK link.",
    example: "If a government scheme is in news, note scheme name, ministry, aim, beneficiaries, and launch year.",
    mistake: "Do not read long news like entertainment. Extract MCQ facts.",
    practice: "Open News Hub and convert 3 items into one-line MCQ notes."
  },
  "study-plan": {
    title: "SSC Study Plan",
    meaning: "A plan converts big syllabus into daily quests so you do not feel lost.",
    rule: "Daily mix: 45 min Maths, 30 min Reasoning, 30 min English, 20 min GK, plus mistake revision.",
    example: "Day 1: Percentage basics + 30 MCQ, Series basics + 20 MCQ, Parts of Speech + 20 MCQ, 20 current affairs facts.",
    mistake: "Do not only watch videos. Solve questions and revise mistakes every day.",
    practice: "Today finish one lesson step, one 60s MCQ, and one mock mistake review."
  },
  general: {
    title: "SSC Doubt Solver",
    meaning: "First identify the chapter, what is given, and what the question asks.",
    rule: "Use this method: meaning -> formula/rule -> substitute values -> solve -> check units/options.",
    example: "If a question gives marks out of total, it is usually percentage. Use part / whole x 100.",
    mistake: "Do not jump to the answer. Underline given values and the keyword first.",
    practice: "Rewrite your doubt as: given, asked, formula, answer. Then solve one similar MCQ."
  }
};

function buildOfflineExplanation(question, style = "simple") {
  const lesson = builtInLessons[getBuiltInTopic(question)] || builtInLessons.general;
  const title = question || lesson.title;
  const styleLine = style === "exam focused"
    ? "Exam focus: look for keywords, eliminate wrong options, and write one notebook rule."
    : style === "step by step"
      ? "Step-by-step mode: move slowly from meaning to formula to example to practice."
      : "Simple mode: understand the idea first, then solve one easy example.";

  return [
    `Built-in SSC Brain: ${title}`,
    "",
    `Topic: ${lesson.title}`,
    styleLine,
    "",
    `1. Meaning: ${lesson.meaning}`,
    `2. Formula / Rule: ${lesson.rule}`,
    `3. Example: ${lesson.example}`,
    `4. Common mistake: ${lesson.mistake}`,
    `5. Practice task: ${lesson.practice}`,
    "",
    "Fast method: read the question -> circle keywords -> choose rule -> substitute values -> calculate -> check options.",
    "",
    "This answer works inside the app. Ollama, Gemini, or OpenAI are optional upgrades for deeper open-ended answers."
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
    if (provider !== "ollama") {
      try {
        const answer = await explainWithOllama(question, style);
        return res.json({ answer, mode: "local" });
      } catch (_) {
        // Built-in SSC Brain below keeps the app useful without external AI.
      }
    }

    const fallback = buildOfflineExplanation(question, style);
    return res.json({ answer: fallback, mode: "built-in", providerError: error.message });
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

