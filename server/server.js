// Starts the Express server.
require('dotenv').config({quiet: true});
const express = require('express');
const {PORT, PUBLIC_DIR} = require('./config');

const authRouter = require('./routes/auth');
const usersRouter = require('./routes/users');
const {casesRouter, questionsRouter} = require('./routes/cases');
const practiceRouter = require('./routes/practice');
const testsRouter = require('./routes/tests');
const {progressRouter, attemptsRouter, statsRouter} = require('./routes/progress');
const skillsRouter = require('./routes/skills');
const slideshowRouter = require('./routes/slideshow');

const app = express();

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());
app.use(express.static(PUBLIC_DIR));

app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/cases', casesRouter);
app.use('/api/questions', questionsRouter);
app.use('/api/practice', practiceRouter);
app.use('/api/tests', testsRouter);
app.use('/api/progress', progressRouter);
app.use('/api/skills', skillsRouter);
app.use('/api/attempts', attemptsRouter);
app.use('/api/stats', statsRouter);
app.use('/api/slideshow-images', slideshowRouter);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

process.on('SIGINT', () => {
  process.exit();
});
