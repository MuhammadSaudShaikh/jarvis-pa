const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');

const PYTHON_SERVICE_URL = 'http://localhost:5000';

// Voice to Text
router.post('/listen', verifyToken, async (req, res) => {
    try {
        const response = await fetch(`${PYTHON_SERVICE_URL}/listen`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ timeout: 5 })
        });
        const data = await response.json();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: 'Python service not running', details: err.message });
    }
});

// Text to Voice
router.post('/speak', verifyToken, async (req, res) => {
    const { text } = req.body;
    try {
        const response = await fetch(`${PYTHON_SERVICE_URL}/speak`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text })
        });
        const data = await response.json();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: 'Python service not running', details: err.message });
    }
});

// PC Commands
router.post('/command', verifyToken, async (req, res) => {
    const { command } = req.body;
    try {
        const response = await fetch(`${PYTHON_SERVICE_URL}/command`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ command })
        });
        const data = await response.json();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: 'Python service not running', details: err.message });
    }
});

// Open App
router.post('/open', verifyToken, async (req, res) => {
    const { app } = req.body;
    try {
        const response = await fetch(`${PYTHON_SERVICE_URL}/open`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ app })
        });
        const data = await response.json();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: 'Python service not running', details: err.message });
    }
});

// Google Search
router.post('/search', verifyToken, async (req, res) => {
    const { query } = req.body;
    try {
        const response = await fetch(`${PYTHON_SERVICE_URL}/search`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query })
        });
        const data = await response.json();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: 'Python service not running', details: err.message });
    }
});

module.exports = router;