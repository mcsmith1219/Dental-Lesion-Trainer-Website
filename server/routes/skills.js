// Skill mastery API route.
const express = require('express');
const bkt = require('../services/bkt');
const {readBktMastery} = require('../store/mastery');

const router = express.Router();

router.get('/:userId', async (req, res) => {
  const userId = req.params.userId;

  try {
    const studentId = String(userId).padStart(5, '0');
    const mastery = readBktMastery()
      .filter(row => row.student_id === studentId)
      .map(row => ({
        skill_name: row.skill,
        p_know: Number(row.mastery_probability),
        mastered: Number(row.mastery_probability) >= bkt.MASTERY_DISPLAY_THRESHOLD,
        observations: Number(row.observations),
        updated_at: row.last_updated
      }))
      .sort((left, right) => left.skill_name.localeCompare(right.skill_name));

    res.json(mastery);
  } catch (err) {
    console.error('Error fetching skill mastery:', err);
    res.status(500).json({error: 'Failed to fetch skill mastery'});
  }
});

module.exports = router;
