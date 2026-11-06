// AI tutor chat API route.
const express = require('express');
const {CHAT_MESSAGE_MAX_LENGTH} = require('../config');
const {getChatReply, ChatError} = require('../services/chat');

const router = express.Router();

function cleanHistory(history) {
  if (!Array.isArray(history)) {
    return [];
  }

  return history
    .filter(entry =>
      entry &&
      (entry.role === 'user' || entry.role === 'assistant') &&
      typeof entry.content === 'string' &&
      entry.content.trim()
    )
    .map(entry => ({role: entry.role, content: entry.content.slice(0, CHAT_MESSAGE_MAX_LENGTH)}));
}

router.post('/', async (req, res) => {
  const {caseId, message, history, partTwoComplete} = req.body;
  const text = typeof message === 'string' ? message.trim() : '';

  if (!caseId || !text) {
    return res.status(400).json({error: 'Missing caseId or message'});
  }

  if (text.length > CHAT_MESSAGE_MAX_LENGTH) {
    return res.status(400).json({error: `Messages must be ${CHAT_MESSAGE_MAX_LENGTH} characters or fewer`});
  }

  try {
    const reply = await getChatReply({
      caseId: String(caseId),
      message: text,
      history: cleanHistory(history),
      partTwoComplete: partTwoComplete === true
    });

    res.json({reply});
  } catch (err) {
    if (err instanceof ChatError) {
      return res.status(err.status).json({error: err.message});
    }
    console.error('Chat error:', err);
    res.status(500).json({error: 'Failed to get a reply from the AI assistant'});
  }
});

module.exports = router;
