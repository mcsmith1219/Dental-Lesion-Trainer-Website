// User profile API route.
const express = require('express');
const {readCsvUsers} = require('../store/users');

const router = express.Router();

router.get('/:userId', async (req, res) => {
  const userId = req.params.userId;

  try {
    const user = readCsvUsers().find(candidate => String(candidate.id) === String(userId));

    if (!user) {
      return res.status(404).json({error: 'User not found'});
    }

    res.json({id: user.id, username: user.username, email: user.email});
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).json({error: 'Failed to fetch user'});
  }
});

module.exports = router;
