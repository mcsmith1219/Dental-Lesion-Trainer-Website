// Gets AI tutor replies about a case from the local Ollama model.
const fs = require('fs');
const path = require('path');
const {PUBLIC_DIR, OLLAMA_URL, OLLAMA_MODEL, CHAT_TIMEOUT_MS, CHAT_HISTORY_LIMIT} = require('../config');
const {readCases, findQuestionsForCase} = require('../store/cases');

class ChatError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function buildSystemPrompt(caseRow, questions, partTwoComplete) {
  const hints = questions.map(question => question.hint_type).filter(Boolean);
  const lines = [
    'You are a dental radiology tutor helping a dental student work through an x-ray case.',
    'The x-ray for this case is attached to the student\'s latest message.',
    'Reply in two to four short sentences of plain text, with no markdown, headings or lists.',
    'Only discuss this case, dental radiology and lesion identification.',
    'If you are not sure about something, say so instead of guessing.'
  ];

  if (hints.length > 0) {
    lines.push(`Hints the student can be given: ${hints.join(' ')}`);
  }

  if (partTwoComplete) {
    lines.push(
      'The student has already submitted their diagnosis, so you may explain the answer.',
      `Diagnosis: ${caseRow.diagnosis}.`,
      `Key features: ${caseRow.features}`,
      `Typical treatment: ${caseRow.treatment}`
    );
  } else {
    lines.push(
      'The student has not identified the lesion yet. Never name the lesion type or the diagnosis, even if asked directly.',
      'Instead, guide them with questions and point out what to look at on the x-ray.'
    );
  }

  return lines.join('\n');
}

function readXrayImage(imagePath) {
  if (!imagePath) {
    return null;
  }

  const fullPath = path.resolve(PUBLIC_DIR, imagePath);
  if (!fullPath.startsWith(PUBLIC_DIR + path.sep) || !fs.existsSync(fullPath)) {
    return null;
  }

  return fs.readFileSync(fullPath).toString('base64');
}

async function getChatReply({caseId, message, history, partTwoComplete}) {
  const caseRow = readCases().find(row => row.case_id === caseId);
  if (!caseRow) {
    throw new ChatError(404, 'Case not found');
  }

  const image = readXrayImage(caseRow.image_path);
  const messages = [
    {role: 'system', content: buildSystemPrompt(caseRow, findQuestionsForCase(caseId), partTwoComplete)},
    ...history.slice(-CHAT_HISTORY_LIMIT),
    {role: 'user', content: message, ...(image ? {images: [image]} : {})}
  ];

  let response;
  try {
    response = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({model: OLLAMA_MODEL, messages, stream: false, think: false}),
      signal: AbortSignal.timeout(CHAT_TIMEOUT_MS)
    });
  } catch (err) {
    if (err.name === 'TimeoutError') {
      throw new ChatError(504, 'The AI assistant took too long to answer. Please try again.');
    }
    throw new ChatError(503, 'The AI assistant is not running. Start Ollama and try again.');
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new ChatError(502, data.error ? `The AI model returned an error: ${data.error}` : 'The AI model returned an error.');
  }

  const reply = data.message && typeof data.message.content === 'string' ? data.message.content.trim() : '';
  if (!reply) {
    throw new ChatError(502, 'The AI model returned an empty reply.');
  }

  return reply;
}

module.exports = {getChatReply, ChatError};
