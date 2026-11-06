// App settings and file paths.
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..');
const PUBLIC_DIR = path.join(ROOT_DIR, 'public');
const DATA_DIR = path.join(ROOT_DIR, 'data');

module.exports = {
  PORT: process.env.PORT || 3000,
  PUBLIC_DIR,

  USERS_CSV_PATH: path.join(DATA_DIR, 'users.csv'),
  CASES_CSV_PATH: path.join(DATA_DIR, 'cases.csv'),
  QUESTIONS_CSV_PATH: path.join(DATA_DIR, 'questions.csv'),
  BKT_MASTERY_CSV_PATH: path.join(DATA_DIR, 'bkt-mastery.csv'),
  USER_INTERACTIONS_CSV_PATH: path.join(DATA_DIR, 'user_interactions.csv'),
  UNIT_TESTS_CSV_PATH: path.join(DATA_DIR, 'unit-tests.csv'),

  SLIDESHOW_DIR: path.join(PUBLIC_DIR, 'images', 'slide-show-images'),
  SLIDESHOW_EXTENSIONS: new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp', '.avif', '.svg']),

  OLLAMA_URL: process.env.OLLAMA_URL || 'http://localhost:11434',
  OLLAMA_MODEL: process.env.OLLAMA_MODEL || 'qwen3.5:4b',
  CHAT_TIMEOUT_MS: 120000,
  CHAT_HISTORY_LIMIT: 10,
  CHAT_MESSAGE_MAX_LENGTH: 1000,

  UNIT_CATEGORIES: {
    1: 'Periapical Lesion',
    2: 'Carious Lesion',
    3: 'Periodontal Lesion',
    4: 'Cystic Lesion',
    5: 'Traumatic Lesion'
  }
};
