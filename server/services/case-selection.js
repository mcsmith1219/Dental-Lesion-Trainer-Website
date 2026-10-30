// Picks the next case for a skill.
const bkt = require('./bkt');
const {readCases} = require('../store/cases');
const {readBktMastery} = require('../store/mastery');
const {readUserInteractions} = require('../store/interactions');

function selectCaseForSkill(category, userId, excludeCaseId = null) {
  const availableCases = readCases().filter(caseRow => caseRow.category === category);
  if (availableCases.length === 0) {
    return null;
  }

  const studentId = userId ? String(userId).padStart(5, '0') : null;
  const masteryRows = studentId
    ? readBktMastery().filter(row => row.student_id === studentId && row.skill === category)
    : [];
  const mastery = masteryRows.length ? Number(masteryRows[0].mastery_probability) : bkt.DEFAULT_PARAMS.pInit;
  const targetDifficulty = bkt.targetDifficulty(mastery);
  const targetSeverity = bkt.difficultyToSeverity(targetDifficulty);
  const completedCaseIds = new Set(studentId
    ? readUserInteractions()
      .filter(row => row.user_id === studentId)
      .map(row => row.case_id)
    : []);
  const otherCases = availableCases.filter(caseRow => caseRow.case_id !== excludeCaseId);
  const bank = otherCases.length ? otherCases : availableCases;
  const candidates = bank.filter(caseRow => !completedCaseIds.has(caseRow.case_id));

  let selected;
  if (candidates.length) {
    const closestDistance = Math.min(...candidates.map(caseRow => Math.abs(Number(caseRow.severity) - targetSeverity)));
    const closestMatches = candidates.filter(caseRow => Math.abs(Number(caseRow.severity) - targetSeverity) === closestDistance);
    selected = closestMatches[Math.floor(Math.random() * closestMatches.length)];
  } else {
    selected = bank[Math.floor(Math.random() * bank.length)];
  }

  return {
    caseId: selected.case_id,
    targetSeverity,
    targetDifficulty,
    mastery,
    allCompleted: candidates.length === 0
  };
}

module.exports = {selectCaseForSkill};
