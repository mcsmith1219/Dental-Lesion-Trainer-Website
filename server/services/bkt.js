// Bayesian Knowledge Tracing math.
const DEFAULT_PARAMS = {
  pInit: 0.3,
  pTransit: 0.1,
  pGuess: 0.2,
  pSlip: 0.1
};

const SKILL_PARAMS = {
};

const DIFFICULTY_LEVELS = ['Beginner', 'Intermediate', 'Difficult'];

function getParams(skillName) {
  return { ...DEFAULT_PARAMS, ...(SKILL_PARAMS[skillName] || {}) };
}

function severityToDifficulty(severity) {
  return DIFFICULTY_LEVELS[Math.min(Math.max(Number(severity), 1), DIFFICULTY_LEVELS.length) - 1];
}

function difficultyToSeverity(difficulty) {
  const index = DIFFICULTY_LEVELS.indexOf(difficulty);
  return index === -1 ? 1 : index + 1;
}

function targetDifficulty(pKnow) {
  if (pKnow < 0.5) return 'Beginner';
  if (pKnow < 0.8) return 'Intermediate';
  return 'Difficult';
}

function updateKnowledge(pKnow, correct, params = DEFAULT_PARAMS) {
  if (pKnow < 0 || pKnow > 1) {
    throw new RangeError('pKnow must be between 0 and 1');
  }
  const {pGuess, pSlip, pTransit} = params;
  let posterior;
  if (correct) {
    const numerator = pKnow * (1 - pSlip);
    const denominator = numerator + (1 - pKnow) * pGuess;
    posterior = denominator === 0 ? pKnow : numerator / denominator;
  } else {
    const numerator = pKnow * pSlip;
    const denominator = numerator + (1 - pKnow) * (1 - pGuess);
    posterior = denominator === 0 ? pKnow : numerator / denominator;
  }
  const updated = posterior + (1 - posterior) * pTransit;
  return Math.min(1, Math.max(0, updated));
}

function recordAttempt(skillName, pKnow, correct) {
  const params = getParams(skillName);
  const startingKnowledge = pKnow == null ? params.pInit : pKnow;
  return updateKnowledge(startingKnowledge, correct, params);
}

function isMastered(pKnow, threshold = 0.95) {
  return pKnow >= threshold;
}

const MASTERY_DISPLAY_THRESHOLD = 0.85;

module.exports = {
  DEFAULT_PARAMS,
  SKILL_PARAMS,
  DIFFICULTY_LEVELS,
  MASTERY_DISPLAY_THRESHOLD,
  getParams,
  severityToDifficulty,
  difficultyToSeverity,
  targetDifficulty,
  updateKnowledge,
  recordAttempt,
  isMastered
};
