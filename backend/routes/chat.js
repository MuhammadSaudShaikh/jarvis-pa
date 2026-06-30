const express = require("express");
const router = express.Router();
const axios = require("axios");

const groq = require("../config/ai");
const { saveMessage, getChatHistory, clearHistory } = require("../models/Chat");
const verifyToken = require("../middleware/verifyToken");

const SYSTEM_PROMPT = `
You are Jarvis, an intelligent AI assistant inspired by Tony Stark(ironman).

Personality:
- Address the user as "Master Saud" or "Master"
- Be confident, calm, and slightly witty
- Keep responses short and sharp
- Sound like a high-level AI assistant
- Occasionally add light sarcasm (but respectful)
- Speak like a real assistant, not like ChatGPT

Style:
- No long paragraphs
- No over-explaining
- No emojis
- Clear and direct tone

Examples:
User: hello
Jarvis: Good to see you, Master Saud. What are we working on today?

User: what is python
Jarvis: A powerful programming language, Sir. Clean, fast, and very dangerous in the right hands.

User: are you smart
Jarvis: I prefer “efficient,” Master.

Stay in character at all times.
`;

// In-memory per user cache
const userMemories = new Map();

// Initialize memory
function getUserMemory(userId) {
  if (!userMemories.has(userId)) {
    userMemories.set(userId, [
      {
        role: "system",
        content:
          "You are Jarvis, a smart AI assistant. Speak in Roman Urdu and English. Keep responses natural and short.",
      },
    ]);
  }
  return userMemories.get(userId);
}

// Add message to memory
function addUserMessage(userId, role, content) {
  const memory = getUserMemory(userId);
  memory.push({ role, content });

  // Keep last 12 messages + system
  if (memory.length > 13) {
    memory.splice(1, 1);
  }
}

// Load DB history into memory (first time)
async function hydrateMemory(userId) {
  const memory = getUserMemory(userId);

  if (memory.length > 1) return;

  const history = await getChatHistory(userId, 10);

  history.reverse().forEach((msg) => {
    memory.push({
      role: msg.role,
      content: msg.content,
    });
  });
}

// POST /chat
router.post("/", async (req, res) => {
  try {
    const { message } = req.body;

    const userId = 1;
    const username = "Saud";

    if (!message) {
      return res.status(400).json({ error: "Message required" });
    }

    // Load previous memory if empty
    await hydrateMemory(userId);

    // Save user message
    await saveMessage(userId, "user", message);
    addUserMessage(userId, "user", message);

    const memory = getUserMemory(userId);

    // AI response
    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "system", content: SYSTEM_PROMPT }, ...memory],
      temperature: 0.7,
      max_tokens: 500,
    });

    const reply = response.choices?.[0]?.message?.content || "No response";

    // Save assistant reply
    await saveMessage(userId, "assistant", reply);
    addUserMessage(userId, "assistant", reply);

    // Call Python TTS (non-blocking)
    axios.post("http://127.0.0.1:5005/speak", { text: reply }).catch(() => {});

    res.json({
      reply,
      user: username,
    });
  } catch (err) {
    console.error("Chat error:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET history
router.get("/history", async (req, res) => {
  try {
    const userId = 1;

    const history = await getChatHistory(userId, 50);

    res.json({
      history,
      count: history.length,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE history
router.delete("/history", async (req, res) => {
  try {
    const userId = 1;

    const deleted = await clearHistory(userId);

    userMemories.delete(userId);

    res.json({
      message: "History cleared",
      deletedCount: deleted,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
