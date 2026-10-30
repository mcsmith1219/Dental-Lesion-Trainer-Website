// Case and question API routes.
const express = require('express');
const {readCases, readQuestions, findQuestionsForCase} = require('../store/cases');

const casesRouter = express.Router();
const questionsRouter = express.Router();

casesRouter.get('/', async (req, res) => {
  try {
    const questionCaseIds = new Set(readQuestions().map(question => question.case_id));
    const availableCases = readCases()
      .filter(caseRow => questionCaseIds.has(caseRow.case_id))
      .sort((left, right) => left.case_id.localeCompare(right.case_id));
    res.json(availableCases);
  } catch (err) {
    console.error('Error fetching cases:', err);
    res.status(500).json({error: 'Failed to fetch cases'});
  }
});

casesRouter.get('/:caseId', async (req, res) => {
  const {caseId} = req.params;

  try {
    const caseRow = readCases().find(row => row.case_id === caseId);

    if (!caseRow) {
      return res.status(404).json({error: 'Case not found'});
    }

    res.json(caseRow);
  } catch (err) {
    console.error('Error fetching case:', err);
    res.status(500).json({error: 'Failed to fetch case'});
  }
});

questionsRouter.get('/:caseId', async (req, res) => {
  const {caseId} = req.params;

  try {
    res.json(findQuestionsForCase(caseId));
  } catch (err) {
    console.error('Error fetching questions:', err);
    res.status(500).json({error: 'Failed to fetch questions'});
  }
});

module.exports = {casesRouter, questionsRouter};
