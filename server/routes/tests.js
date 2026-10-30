// Unit test API routes.
const express = require('express');
const {UNIT_CATEGORIES} = require('../config');
const {appendUnitTestResult} = require('../store/unit-tests');
const {getUnitTestStatus, getUnlockedUnits} = require('../services/units');
const {selectCaseForSkill} = require('../services/case-selection');

const router = express.Router();

router.get('/:unit', async (req, res) => {
  const unit = Number(req.params.unit);
  const category = UNIT_CATEGORIES[unit];

  if (!category) {
    return res.status(400).json({error: 'Invalid unit'});
  }

  try {
    const selection = selectCaseForSkill(category, req.query.userId);

    if (!selection) {
      return res.status(404).json({error: 'No test case is available for this unit'});
    }

    res.json({...selection, unit, skill: category});
  } catch (err) {
    console.error('Error selecting unit test case:', err);
    res.status(500).json({error: 'Failed to select unit test case'});
  }
});

router.post('/save', async (req, res) => {
  const {userId, unit, caseId, passed} = req.body;
  const unitNumber = Number(unit);
  const category = UNIT_CATEGORIES[unitNumber];

  if (!userId || !category || !caseId) {
    return res.status(400).json({error: 'Missing userId, unit, or caseId'});
  }

  if (typeof passed !== 'boolean') {
    return res.status(400).json({error: 'passed must be true or false'});
  }

  try {
    appendUnitTestResult({
      student_id: String(userId).padStart(5, '0'),
      unit: unitNumber,
      skill: category,
      case_id: caseId,
      passed,
      completed_at: new Date().toISOString()
    });

    res.json({message: 'Test result saved', unit: unitNumber, skill: category, passed});
  } catch (err) {
    console.error('Error saving unit test result:', err);
    res.status(500).json({error: 'Failed to save unit test result'});
  }
});

router.get('/status/:userId', async (req, res) => {
  const studentId = String(req.params.userId).padStart(5, '0');

  try {
    const testStatus = getUnitTestStatus(studentId);
    const unlockedUnits = new Set(getUnlockedUnits(studentId));

    const status = Object.entries(UNIT_CATEGORIES).map(([unit, skill]) => ({
      unit: Number(unit),
      skill,
      passed: Boolean(testStatus[unit]),
      unlocked: unlockedUnits.has(Number(unit))
    }));

    res.json(status);
  } catch (err) {
    console.error('Error fetching unit test status:', err);
    res.status(500).json({error: 'Failed to fetch unit test status'});
  }
});

module.exports = router;
