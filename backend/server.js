require("dotenv").config();

const express = require("express");
const path = require("path");
const cors = require("cors");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Static frontend
app.use(express.static(path.join(__dirname, "public")));

// Database
require("./config/db");

// Routes
const chatRoute = require("./routes/chat");
const authRoute = require("./routes/auth");
const pythonRoute = require("./routes/python");

// API routes
app.use("/api/chat", chatRoute);
app.use("/api/auth", authRoute);
app.use("/api/python", pythonRoute);

// API info
app.get("/api", (req, res) => {
  res.json({
    status: "running",
    version: "2.1.0",
    ai: "Groq",
    database: "SQLite"
  });
});

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    time: new Date().toISOString()
  });
});

// Frontend fallback
app.use((req, res) => {
  if (
    req.path.startsWith('/api') ||
    req.path.startsWith('/chat') ||
    req.path.startsWith('/auth') ||
    req.path === '/health'
  ) {
    return res.status(404).json({ error: 'Not found' });
  }

  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

