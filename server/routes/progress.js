// Progress, attempts and stats API routes.
const express = require('express');
const {readUserInteractions, appendUserInteraction} = require('../store/interactions');
const {updateBktMasteryCsv} = require('../services/mastery');

const progressRouter = express.Router();
const attemptsRouter = express.Router();
const statsRouter = express.Router();

progressRouter.post('/save', async (req, res) => {
  const {userId, caseId, partOneCorrect, partTwoCorrect, hintsUsed, skillName} = req.body;

  if (!userId || !caseId) {
    return res.status(400).json({error: 'Missing userId or caseId'});
  }

  if (typeof partTwoCorrect !== 'boolean') {
    return res.status(400).json({error: 'partTwoCorrect must be true or false'});
  }

  const resolvedPartOneCorrect = Boolean(partOneCorrect);
  const resolvedHintsUsed = Number.isFinite(hintsUsed) ? hintsUsed : 0;
  const resolvedSkillName = skillName || `case-${caseId}`;

  try {
    appendUserInteraction({
      user_id: String(userId).padStart(5, '0'),
      session_id: `live-${userId}`,
      sequence: Date.now(),
      case_id: caseId,
      question_id: caseId,
      kc_id: resolvedSkillName,
      student_response: partTwoCorrect ? 'correct' : 'incorrect',
      correct: partTwoCorrect,
      time_sec: '',
      hint_used: resolvedHintsUsed > 0,
      time_before_first_hint: '',
      attempts: 1,
      answer_change_count: 0,
      iou_score: '',
      timestamp: new Date().toISOString()
    });

    const mastery = updateBktMasteryCsv(userId, resolvedSkillName, partTwoCorrect);
    const progress = {
      user_id: Number(userId),
      case_id: caseId,
      part_one_correct: resolvedPartOneCorrect,
      part_two_correct: partTwoCorrect,
      hints_used: resolvedHintsUsed,
      completed_at: new Date().toISOString()
    };

    res.json({
      message: 'Progress saved',
      progress,
      skill: mastery
    });
  } catch (err) {
    console.error('Error saving progress:', err);
    res.status(500).json({error: 'Failed to save progress'});
  }
});

progressRouter.get('/:userId', async (req, res) => {
  const userId = req.params.userId;

  try {
    const rows = readUserInteractions()
      .filter(row => row.user_id === String(userId).padStart(5, '0'))
      .map(row => ({
        user_id: Number(userId),
        case_id: row.case_id,
        part_two_correct: row.correct === 'true',
        hints_used: row.hint_used === 'true' ? 1 : 0,
        completed_at: row.timestamp
      }));
    res.json(rows);
  } catch (err) {
    console.error('Error fetching progress:', err);
    res.status(500).json({error: 'Failed to fetch progress'});
  }
});

progressRouter.get('/:userId/:caseId', async (req, res) => {
  const {userId, caseId} = req.params;

  try {
    const rows = readUserInteractions().filter(row =>
      row.user_id === String(userId).padStart(5, '0') && row.case_id === caseId
    );

    if (rows.length === 0) {
      return res.status(404).json({error: 'Progress not found'});
    }

    const row = rows[rows.length - 1];
    res.json({
      user_id: Number(userId),
      case_id: row.case_id,
      part_two_correct: row.correct === 'true',
      hints_used: row.hint_used === 'true' ? 1 : 0,
      completed_at: row.timestamp
    });
  } catch (err) {
    console.error('Error fetching progress:', err);
    res.status(500).json({error: 'Failed to fetch progress'});
  }
});

attemptsRouter.get('/:userId', async (req, res) => {
  const userId = req.params.userId;

  try {
    const rows = readUserInteractions()
      .filter(row => row.user_id === String(userId).padStart(5, '0'))
      .reverse();
    res.json(rows);
  } catch (err) {
    console.error('Error fetching attempts:', err);
    res.status(500).json({error: 'Failed to fetch attempts'});
  }
});

statsRouter.get('/:userId', async (req, res) => {
  const userId = req.params.userId;

  try {
    const rows = readUserInteractions()
      .filter(row => row.user_id === String(userId).padStart(5, '0'));
    const correct = rows.filter(row => row.correct === 'true').length;
    const hints = rows.map(row => row.hint_used === 'true' ? 1 : 0);
    res.json({
      total_cases_completed: rows.length,
      part_one_correct: null,
      part_two_correct: correct,
      average_hints_used: hints.length ? hints.reduce((sum, value) => sum + value, 0) / hints.length : 0
    });
  } catch (err) {
    console.error('Error fetching stats:', err);
    res.status(500).json({error: 'Failed to fetch stats'});
  }
});

module.exports = {progressRouter, attemptsRouter, statsRouter};
