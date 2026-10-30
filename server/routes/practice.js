// Practice case API routes.
const express = require('express');
const bkt = require('../services/bkt');
const {UNIT_CATEGORIES} = require('../config');
const {readBktMastery} = require('../store/mastery');
const {getUnlockedUnits} = require('../services/units');
const {selectCaseForSkill} = require('../services/case-selection');

const router = express.Router();

router.get('/all', async (req, res) => {
  const {userId, exclude} = req.query;

  if (!userId) {
    return res.status(400).json({error: 'Missing userId'});
  }

  try {
    const studentId = String(userId).padStart(5, '0');
    const unlockedSkills = getUnlockedUnits(studentId).map(unit => UNIT_CATEGORIES[unit]);
    const masteryByskill = new Map(
      readBktMastery()
        .filter(row => row.student_id === studentId)
        .map(row => [row.skill, Number(row.mastery_probability)])
    );

    const MIN_WEIGHT = 0.05;
    const weights = unlockedSkills.map(skill => {
      const mastery = masteryByskill.has(skill) ? masteryByskill.get(skill) : bkt.DEFAULT_PARAMS.pInit;
      return Math.max(1 - mastery, MIN_WEIGHT);
    });
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    let roll = Math.random() * totalWeight;
    let chosenSkill = unlockedSkills[unlockedSkills.length - 1];
    for (let i = 0; i < unlockedSkills.length; i += 1) {
      roll -= weights[i];
      if (roll <= 0) {
        chosenSkill = unlockedSkills[i];
        break;
      }
    }

    const selection = selectCaseForSkill(chosenSkill, userId, exclude);

    if (!selection) {
      return res.status(404).json({error: 'No practice cases are available yet'});
    }

    res.json({...selection, skill: chosenSkill, unlockedSkills});
  } catch (err) {
    console.error('Error selecting practice-all case:', err);
    res.status(500).json({error: 'Failed to select practice case'});
  }
});

router.get('/:unit', async (req, res) => {
  const category = UNIT_CATEGORIES[req.params.unit];

  if (!category) {
    return res.status(400).json({error: 'Invalid practice unit'});
  }

  try {
    const selection = selectCaseForSkill(category, req.query.userId, req.query.exclude);

    if (!selection) {
      return res.status(404).json({error: 'No practiced cases are available for this unit'});
    }

    res.json(selection);
  } catch (err) {
    console.error('Error selecting practice case:', err);
    res.status(500).json({error: 'Failed to select practice case'});
  }
});

module.exports = router;
