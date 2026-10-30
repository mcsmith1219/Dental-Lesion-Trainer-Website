// Reads cases and questions.
const {CASES_CSV_PATH, QUESTIONS_CSV_PATH} = require('../config');
const {readCsvFile} = require('./csv');

function readCases() {
  return readCsvFile(CASES_CSV_PATH);
}

function readQuestions() {
  return readCsvFile(QUESTIONS_CSV_PATH);
}

function findQuestionsForCase(caseId) {
  const direct = readQuestions()
    .filter(row => row.case_id === caseId)
    .sort((left, right) => left.question_id.localeCompare(right.question_id));

  if (direct.length > 0) {
    return direct;
  }

  const caseRow = readCases().find(row => row.case_id === caseId);
  if (!caseRow) {
    return [];
  }

  const questionCaseIds = new Set(readQuestions().map(question => question.case_id));
  const equivalent = readCases().find(row =>
    row.case_id !== caseId &&
    row.category === caseRow.category &&
    row.diagnosis === caseRow.diagnosis &&
    row.features === caseRow.features &&
    row.severity === caseRow.severity &&
    questionCaseIds.has(row.case_id)
  );

  return equivalent
    ? readQuestions()
      .filter(row => row.case_id === equivalent.case_id)
      .sort((left, right) => left.question_id.localeCompare(right.question_id))
    : [];
}

module.exports = {readCases, readQuestions, findQuestionsForCase};
