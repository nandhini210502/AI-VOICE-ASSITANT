const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const logger = require('../utils/logger');

// TTS settings endpoint - returns available voices config
router.get('/settings', authMiddleware, (req, res) => {
  res.json({
    engines: ['browser', 'web-speech'],
    defaultVoice: 'auto',
    defaultRate: 1.0,
    defaultPitch: 1.0,
    defaultVolume: 1.0,
  });
});

// Health check for TTS service
router.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'TTS service ready (browser-based)' });
});

module.exports = router;
