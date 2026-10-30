-- PostgreSQL database schema.
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cases (
  case_id VARCHAR(50) PRIMARY KEY,
  category VARCHAR(100),
  image_path VARCHAR(255),
  localization TEXT,
  diagnosis VARCHAR(255),
  features TEXT,
  treatment TEXT,
  severity VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS questions (
  question_id VARCHAR(50) PRIMARY KEY,
  case_id VARCHAR(50) NOT NULL REFERENCES cases(case_id) ON DELETE CASCADE,
  skill VARCHAR(100),
  type VARCHAR(50),
  kc_id VARCHAR(50),
  correct_answer VARCHAR(10),
  hint_type TEXT,
  choice_a TEXT,
  choice_b TEXT,
  choice_c TEXT,
  choice_d TEXT,
  difficulty VARCHAR(20)
);

CREATE TABLE IF NOT EXISTS progress (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  case_id VARCHAR(50) NOT NULL,
  part_one_correct BOOLEAN DEFAULT FALSE,
  part_two_correct BOOLEAN DEFAULT FALSE,
  hints_used INTEGER DEFAULT 0,
  completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, case_id)
);

CREATE TABLE IF NOT EXISTS attempts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  case_id VARCHAR(50) NOT NULL,
  skill_name VARCHAR(100) NOT NULL,
  part_one_correct BOOLEAN NOT NULL,
  part_two_correct BOOLEAN NOT NULL,
  hints_used INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS skill_state (
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  skill_name VARCHAR(100) NOT NULL,
  p_know REAL NOT NULL DEFAULT 0.3,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, skill_name)
);

CREATE TABLE IF NOT EXISTS student_interactions (
  student_id VARCHAR(50),
  session_id VARCHAR(50),
  sequence INTEGER,
  case_id VARCHAR(50),
  question_id VARCHAR(50),
  kc_id VARCHAR(50),
  student_response TEXT,
  correct BOOLEAN,
  time_sec REAL,
  hint_used BOOLEAN,
  time_before_first_hint REAL,
  attempts INTEGER,
  answer_change_count INTEGER,
  iou_score REAL,
  timestamp TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bkt_mastery_reference (
  student_id VARCHAR(50),
  skill VARCHAR(100),
  kc_id VARCHAR(50),
  mastery_probability REAL,
  observations INTEGER,
  last_updated TIMESTAMP
);

CREATE TABLE IF NOT EXISTS unit_test_attempts (
  student_id VARCHAR(50),
  unit INTEGER,
  skill VARCHAR(100),
  case_id VARCHAR(50),
  passed BOOLEAN,
  completed_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_questions_case_id ON questions(case_id);
CREATE INDEX IF NOT EXISTS idx_progress_user_id ON progress(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_case_id ON progress(case_id);
CREATE INDEX IF NOT EXISTS idx_attempts_user_id ON attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_attempts_skill_name ON attempts(skill_name);
CREATE INDEX IF NOT EXISTS idx_skill_state_user_id ON skill_state(user_id);
