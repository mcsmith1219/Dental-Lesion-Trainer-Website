// Creates the PostgreSQL database and tables.
require('dotenv').config({quiet: true});
const {Client} = require('pg');
const fs = require('fs');
const path = require('path');

const adminClient = new Client({
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  database: 'postgres'
});

const appClient = new Client({
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  database: process.env.PGDATABASE
});

async function initializeDatabase() {
  try {
    console.log('Connecting to PostgreSQL admin...');
    await adminClient.connect();
    console.log('✓ Connected to admin database');

    console.log(`\nChecking if database "${process.env.PGDATABASE}" exists...`);
    const dbCheck = await adminClient.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [process.env.PGDATABASE]
    );

    if (dbCheck.rows.length === 0) {
      console.log(`Database "${process.env.PGDATABASE}" not found, creating...`);
      await adminClient.query(`CREATE DATABASE ${process.env.PGDATABASE}`);
      console.log(`✓ Database "${process.env.PGDATABASE}" created`);
    } else {
      console.log(`✓ Database "${process.env.PGDATABASE}" already exists`);
    }

    await adminClient.end();

    console.log(`\nConnecting to "${process.env.PGDATABASE}" database...`);
    await appClient.connect();
    console.log('✓ Connected successfully');

    const schemaPath = path.join(__dirname, 'database.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    console.log('\nExecuting database schema...');
    await appClient.query(schema);
    console.log('✓ Database schema initialized successfully');

    console.log('\nVerifying tables...');

    const usersCheck = await appClient.query(
      "SELECT to_regclass('public.users');"
    );
    if (usersCheck.rows[0].to_regclass) {
      console.log('✓ users table created');
    }

    const casesCheck = await appClient.query(
      "SELECT to_regclass('public.cases');"
    );
    if (casesCheck.rows[0].to_regclass) {
      console.log('✓ cases table created');
    }

    const questionsCheck = await appClient.query(
      "SELECT to_regclass('public.questions');"
    );
    if (questionsCheck.rows[0].to_regclass) {
      console.log('✓ questions table created');
    }

    const progressCheck = await appClient.query(
      "SELECT to_regclass('public.progress');"
    );
    if (progressCheck.rows[0].to_regclass) {
      console.log('✓ progress table created');
    }

    const attemptsCheck = await appClient.query(
      "SELECT to_regclass('public.attempts');"
    );
    if (attemptsCheck.rows[0].to_regclass) {
      console.log('✓ attempts table created');
    }

    const skillStateCheck = await appClient.query(
      "SELECT to_regclass('public.skill_state');"
    );
    if (skillStateCheck.rows[0].to_regclass) {
      console.log('✓ skill_state table created');
    }

    console.log('\n✓ Database initialization complete!');
    console.log('\nNext: run "npm run import-data" to load the CSVs into cases/questions, then "node server/server.js" to start the server.');

  } catch (err) {
    console.error('✗ Database initialization failed:', err.message);
    process.exit(1);
  } finally {
    await appClient.end();
  }
}

initializeDatabase();
