// Prints the PostgreSQL tables.
require('dotenv').config({quiet: true});
const {Client} = require('pg');

const client = new Client({
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  database: process.env.PGDATABASE
});

async function viewTables() {
  try {
    await client.connect();
    console.log('\n=== USERS TABLE ===');
    const users = await client.query('SELECT * FROM users');
    console.table(users.rows);

    console.log('\n=== PROGRESS TABLE ===');
    const progress = await client.query('SELECT * FROM progress');
    console.table(progress.rows);

    console.log('\n=== ATTEMPTS TABLE ===');
    const attempts = await client.query('SELECT * FROM attempts ORDER BY created_at DESC');
    console.table(attempts.rows);

    console.log('\n=== SKILL_STATE TABLE (BKT mastery) ===');
    const skillState = await client.query('SELECT * FROM skill_state ORDER BY user_id, skill_name');
    console.table(skillState.rows);

    await client.end();
  } catch (err) {
    console.error('Error:', err.message);
  }
}

viewTables();
