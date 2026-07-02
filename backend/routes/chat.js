const express = require('express');
const router = express.Router();
const Groq = require('groq-sdk');
const { v4: uuidv4 } = require('uuid');
const authMiddleware = require('../middleware/auth');
const logger = require('../utils/logger');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// In-memory conversation store (replace with DB in production)
const conversations = new Map();

const SYSTEM_PROMPT = `You are Aura. Detect user's language and STRICTLY reply in that same language.
Support all languages including Tamil, Hindi, French, German, Japanese etc.
Be friendly and casual. Maximum 2 sentences.`;

// Get all conversations for user
router.get('/conversations', authMiddleware, (req, res) => {
  const userConvos = [];
  conversations.forEach((convo) => {
    if (convo.userId === req.user.id) {
      userConvos.push({
        id: convo.id,
        title: convo.title,
        createdAt: convo.createdAt,
        updatedAt: convo.updatedAt,
        messageCount: convo.messages.length,
        preview: convo.messages.length > 0 ? convo.messages[convo.messages.length - 1].content.slice(0, 80) : '',
      });
    }
  });
  userConvos.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  res.json(userConvos);
});

// Get single conversation
router.get('/conversations/:id', authMiddleware, (req, res) => {
  const convo = conversations.get(req.params.id);
  if (!convo || convo.userId !== req.user.id) {
    return res.status(404).json({ error: 'Conversation not found' });
  }
  res.json(convo);
});

// Create new conversation
router.post('/conversations', authMiddleware, (req, res) => {
  const convo = {
    id: uuidv4(),
    userId: req.user.id,
    title: req.body.title || 'New Conversation',
    messages: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  conversations.set(convo.id, convo);
  res.status(201).json(convo);
});

// Delete conversation
router.delete('/conversations/:id', authMiddleware, (req, res) => {
  const convo = conversations.get(req.params.id);
  if (!convo || convo.userId !== req.user.id) {
    return res.status(404).json({ error: 'Conversation not found' });
  }
  conversations.delete(req.params.id);
  res.json({ message: 'Conversation deleted' });
});

// Update conversation title
router.patch('/conversations/:id', authMiddleware, (req, res) => {
  const convo = conversations.get(req.params.id);
  if (!convo || convo.userId !== req.user.id) {
    return res.status(404).json({ error: 'Conversation not found' });
  }
  if (req.body.title) convo.title = req.body.title;
  convo.updatedAt = new Date();
  res.json(convo);
});

// Send message (streaming)
router.post('/conversations/:id/messages', authMiddleware, async (req, res) => {
  try {
    let convo = conversations.get(req.params.id);

    // Auto-create conversation if not found
    if (!convo) {
      convo = {
        id: req.params.id,
        userId: req.user.id,
        title: 'New Conversation',
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      conversations.set(convo.id, convo);
    }

    if (convo.userId !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { content, role = 'user', preferredLang } = req.body;
    if (!content) return res.status(400).json({ error: 'Message content required' });

    const langInstruction = preferredLang 
      ? `IMPORTANT: User's selected language is ${preferredLang}. Reply ONLY in this language.`
      : '';

    // Add user message
    const userMessage = {
      id: uuidv4(),
      role: 'user',
      content,
      timestamp: new Date(),
    };
    convo.messages.push(userMessage);

    // Auto-title after first message
    if (convo.messages.length === 1) {
      convo.title = content.slice(0, 50) + (content.length > 50 ? '...' : '');
    }

    // Build messages for Groq (keep last 20 for context)
    const contextMessages = convo.messages.slice(-20).map((m) => ({
      role: m.role,
      content: m.content,
    }));

    // Set up SSE streaming
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    const stream = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [{ role: 'system', content: `${SYSTEM_PROMPT}\n${langInstruction}`.trim() }, ...contextMessages],
      stream: true,
      max_tokens: 150,
      temperature: 0.5,
    });

    let fullResponse = '';

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content || '';
      if (delta) {
        fullResponse += delta;
        res.write(`data: ${JSON.stringify({ type: 'delta', content: delta })}\n\n`);
      }
    }

    // Save AI response
    const aiMessage = {
      id: uuidv4(),
      role: 'assistant',
      content: fullResponse,
      timestamp: new Date(),
    };
    convo.messages.push(aiMessage);
    convo.updatedAt = new Date();

    res.write(`data: ${JSON.stringify({ type: 'done', messageId: aiMessage.id, conversationId: convo.id })}\n\n`);
    res.end();

    logger.info(`Message processed for conversation ${convo.id}`);
  } catch (err) {
    logger.error(`Chat error: ${err.message}`);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to process message' });
    } else {
      res.write(`data: ${JSON.stringify({ type: 'error', message: err.message })}\n\n`);
      res.end();
    }
  }
});

// Export conversation
router.get('/conversations/:id/export', authMiddleware, (req, res) => {
  const convo = conversations.get(req.params.id);
  if (!convo || convo.userId !== req.user.id) {
    return res.status(404).json({ error: 'Conversation not found' });
  }

  const exportData = {
    title: convo.title,
    createdAt: convo.createdAt,
    messages: convo.messages.map((m) => ({
      role: m.role,
      content: m.content,
      timestamp: m.timestamp,
    })),
  };

  res.setHeader('Content-Disposition', `attachment; filename="conversation-${convo.id}.json"`);
  res.json(exportData);
});

module.exports = router;
