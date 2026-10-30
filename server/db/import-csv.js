// Imports the CSV data into PostgreSQL.
require('dotenv').config({quiet: true});
const {Client} = require('pg');
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', '..', 'data');

const client = new Client({
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  database: process.env.PGDATABASE
});

function splitCsvLine(line) {
  const values = [];
  let current = '';
  let insideQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (insideQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === ',' && !insideQuotes) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  values.push(current.trim());
  return values;
}

function parseCsv(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8').trim();
  const lines = raw.split(/\r?\n/);
  const headers = splitCsvLine(lines[0]);

  return lines.slice(1).map(line => {
    const values = splitCsvLine(line);
    const row = {};
    headers.forEach((header, i) => {
      row[header] = values[i] !== undefined && values[i] !== '' ? values[i] : null;
    });
    return row;
  });
}

function toBool(value) {
  if (value === null) return null;
  const normalized = value.toLowerCase();
  if (normalized === '1' || normalized === 'yes' || normalized === 'true') return true;
  if (normalized === '0' || normalized === 'no' || normalized === 'false') return false;
  return null;
}

function toNumberOrNull(value) {
  if (value === null) return null;
  const num = Number(value);
  return Number.isNaN(num) ? null : num;
}

function toTimestampOrNull(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

async function importCases() {
  const rows = parseCsv(path.join(DATA_DIR, 'cases.csv'));
  for (const row of rows) {
    await client.query(
      `INSERT INTO cases (case_id, category, image_path, localization, diagnosis, features, treatment, severity)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (case_id) DO UPDATE SET
         category = $2, image_path = $3, localization = $4, diagnosis = $5,
         features = $6, treatment = $7, severity = $8`,
      [row.case_id, row.category, row.image_path, row.localization, row.diagnosis, row.features, row.treatment, row.severity]
    );
  }
  console.log(`✓ Imported ${rows.length} rows into cases`);
}

async function importQuestions() {
  const rows = parseCsv(path.join(DATA_DIR, 'questions.csv'));
  for (const row of rows) {
    await client.query(
      `INSERT INTO questions (question_id, case_id, skill, type, kc_id, correct_answer, hint_type, choice_a, choice_b, choice_c, choice_d, difficulty)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       ON CONFLICT (question_id) DO UPDATE SET
         case_id = $2, skill = $3, type = $4, kc_id = $5, correct_answer = $6, hint_type = $7,
         choice_a = $8, choice_b = $9, choice_c = $10, choice_d = $11, difficulty = $12`,
      [row.question_id, row.case_id, row.skill, row.type, row.kc_id, row.correct_answer, row.hint_type, row.choice_a, row.choice_b, row.choice_c, row.choice_d, row.difficulty]
    );
  }
  console.log(`✓ Imported ${rows.length} rows into questions`);
}

async function importStudentInteractions() {
  const rows = parseCsv(path.join(DATA_DIR, 'user_interactions.csv'));
  for (const row of rows) {
    await client.query(
      `INSERT INTO student_interactions
         (student_id, session_id, sequence, case_id, question_id, kc_id, student_response,
          correct, time_sec, hint_used, time_before_first_hint, attempts, answer_change_count,
          iou_score, timestamp)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
      [
          row.user_id, row.session_id, toNumberOrNull(row.sequence), row.case_id, row.question_id,
        row.kc_id, row.student_response, toBool(row.correct), toNumberOrNull(row.time_sec),
        toBool(row.hint_used), toNumberOrNull(row.time_before_first_hint), toNumberOrNull(row.attempts),
        toNumberOrNull(row.answer_change_count), toNumberOrNull(row.iou_score), toTimestampOrNull(row.timestamp)
      ]
    );
  }
  console.log(`✓ Imported ${rows.length} rows into student_interactions`);
}

async function importBktMasteryReference() {
  const rows = parseCsv(path.join(DATA_DIR, 'bkt-mastery.csv'));
  for (const row of rows) {
    await client.query(
      `INSERT INTO bkt_mastery_reference (student_id, skill, kc_id, mastery_probability, observations, last_updated)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [row.student_id, row.skill, row.kc_id, toNumberOrNull(row.mastery_probability), toNumberOrNull(row.observations), toTimestampOrNull(row.last_updated)]
    );
  }
  console.log(`✓ Imported ${rows.length} rows into bkt_mastery_reference`);
}

async function importUnitTestAttempts() {
  const rows = parseCsv(path.join(DATA_DIR, 'unit-tests.csv'));
  for (const row of rows) {
    await client.query(
      `INSERT INTO unit_test_attempts (student_id, unit, skill, case_id, passed, completed_at)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [row.student_id, toNumberOrNull(row.unit), row.skill, row.case_id, toBool(row.passed), toTimestampOrNull(row.completed_at)]
    );
  }
  console.log(`✓ Imported ${rows.length} rows into unit_test_attempts`);
}

async function run() {
  try {
    await client.connect();
    console.log('Connected to PostgreSQL database');

    await client.query('TRUNCATE student_interactions, bkt_mastery_reference, unit_test_attempts');
    await client.query('DELETE FROM questions');
    await client.query('DELETE FROM cases');

    await importCases();
    await importQuestions();
    await importStudentInteractions();
    await importBktMasteryReference();
    await importUnitTestAttempts();

    console.log('\n✓ CSV import complete');
  } catch (err) {
    console.error('✗ CSV import failed:', err.code || 'unknown error', err.message || err);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
}

run();
