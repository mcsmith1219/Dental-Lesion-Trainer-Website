// Login and sign-up API routes.
const express = require('express');
const {readCsvUsers, appendCsvUser} = require('../store/users');

const router = express.Router();

router.post('/register', async (req, res) => {
  const {username, email, password} = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({error: 'Missing required fields'});
  }

  try {
    const users = readCsvUsers();
    const userExists = users.some(user => user.username === username || user.email === email);

    if (userExists) {
      return res.status(400).json({error: 'User already exists'});
    }

    const nextId = users.reduce((highestId, user) => Math.max(highestId, user.id), -1) + 1;
    const newUser = {
      id: nextId,
      user_id: String(nextId).padStart(5, '0'),
      username,
      email,
      password,
      role: 'student'
    };
    appendCsvUser(newUser);

    res.status(201).json({
      message: 'User registered successfully',
      user: {id: newUser.id, username: newUser.username, email: newUser.email}
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({error: 'Registration failed'});
  }
});

router.post('/login', async (req, res) => {
  const {username, password} = req.body;

  if (!username || !password) {
    return res.status(400).json({error: 'Missing username or password'});
  }

  try {
    const users = readCsvUsers();
    const user = users.find(candidate => candidate.username === username && candidate.password === password);

    if (!user) {
      return res.status(401).json({error: 'Invalid credentials'});
    }

    res.json({
      message: 'Login successful',
      user: {id: user.id, username: user.username, email: user.email}
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({error: 'Login failed'});
  }
});

module.exports = router;
