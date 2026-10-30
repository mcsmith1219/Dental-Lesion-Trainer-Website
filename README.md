# IDentiFind

A prototype web application built for ECU's Dental School to help dental students practice identifying lesions in dental x-rays. Students are shown real-world x-ray images and work through a two-part exercise: first locating the lesion on the image, then identifying what type of lesion it is.

## Current status

This is an early-stage prototype with a working front end (HTML/CSS/JS) and an Express backend. Accounts, progress and skill mastery are stored in CSV files in `data/`, and a Bayesian Knowledge Tracing model estimates each student's mastery of each lesion type over time. Optional scripts can also load the CSV data into PostgreSQL, but the running app does not need a database.

## Project structure

```
Dental-Lesion-Trainer-Website/
├── server/
│   ├── server.js                 # Entry point: middleware, mounts the routers, starts listening
│   ├── config.js                 # Port, data file paths, unit -> lesion category map
│   ├── routes/                   # One Express router per API area (auth, users, cases, practice,
│   │                             #   tests, progress, skills, slideshow)
│   ├── services/
│   │   ├── bkt.js                # Bayesian Knowledge Tracing model
│   │   ├── mastery.js            # Applies a BKT update to a student's stored mastery
│   │   ├── units.js              # Unit test status and the unit unlock rule
│   │   └── case-selection.js     # Mastery-driven case pick for practice and tests
│   ├── store/                    # All reading/writing of the CSV files in data/ (csv.js = shared parser)
│   └── db/                       # Optional PostgreSQL scripts (not used by the running app)
│       ├── database.sql          # Table definitions
│       ├── init-db.js            # Creates the database and runs database.sql
│       ├── import-csv.js         # Loads the CSV files in data/ into the database
│       └── view-tables.js        # Prints the database tables to the console
├── public/
│   ├── index.html                # Home page (served at /)
│   ├── dashboard.html            # Cases, unit practice and unit tests, browsable by unit
│   ├── case.html                 # Training exercise (opened from the dashboard with ?caseId=...)
│   ├── tutorial.html             # Tutorial lessons
│   ├── resources.html            # Reference resources
│   ├── login.html                # Login page
│   ├── signup.html               # Sign-up page
│   ├── password-reset.html       # Password reset page
│   ├── css/                      # Each page loads base.css, then components.css if needed, then its own file
│   │   ├── base.css              # Reset, colours, top bar and nav, cards, buttons, page shells
│   │   ├── components.css        # X-ray marking boxes and the result pop-up
│   │   ├── auth.css              # login.html, signup.html, password-reset.html
│   │   ├── case.css              # case.html
│   │   ├── dashboard.css         # dashboard.html
│   │   ├── home.css              # index.html
│   │   ├── resources.css         # resources.html
│   │   └── tutorial.css          # tutorial.html
│   ├── js/
│   │   ├── shared/
│   │   │   ├── auth.js           # Login/sign-up/logout and top-bar login state
│   │   │   ├── progress.js       # Client for the progress, skills and unit test API
│   │   │   ├── result-popup.js   # Shared "You got it right / wrong" pop-up
│   │   │   └── tooltip.js        # "?" info tooltips on the login and sign-up forms
│   │   ├── case/                 # case.html, as plain scripts sharing globals; load order is set in case.html
│   │   │   ├── case-data.js      # Loads cases and questions from the API
│   │   │   ├── case-state.js     # Shared page state and element lookups
│   │   │   ├── xray-tools.js     # Selection box and ruler
│   │   │   ├── zoom.js           # Enlarge/shrink the x-ray
│   │   │   ├── case-flow.js      # Part 1/Part 2, hints, next case, practice and tests
│   │   │   ├── chat.js           # AI assistant chat panel (placeholder)
│   │   │   └── main.js           # Startup; must load last
│   │   ├── dashboard.js          # Dashboard case list, badges, practice, tests and mastery
│   │   ├── slideshow.js          # Home page slideshow
│   │   ├── tutorial-lesson.js    # Tutorial lessons and questions
│   │   ├── login.js              # Login form
│   │   ├── signup.js             # Sign-up form and password checks
│   │   └── password-reset.js     # Password reset form
│   └── images/
│       ├── train_0.png           # Sample x-ray used by the cases and as the slideshow fallback
│       ├── icons/                # UI icons (viewer tools, result pop-up, badges)
│       └── slide-show-images/    # Images for the home page slideshow
├── data/                         # CSV files the server reads and writes (see "Data files" below)
├── package.json
├── start-server.bat              # Starts the server on Windows
├── .env.example                  # Template for .env
├── .env                          # Local settings (not committed — see .gitignore)
└── .gitignore
```

## Features

- **Units** — cases are grouped into five units, one per lesion type: Periapical, Carious, Periodontal, Cystic and Traumatic. The case bank has 20 cases per unit; the 10 per unit that have questions in `data/questions.csv` are listed on the dashboard
- **Case-based training** — each case presents an x-ray image with a known lesion, difficulty level, and diagnosis
- **Region selection** — drag to draw a bounding box around the suspected lesion location, then check it against the correct region
- **Diagnosis step** — after locating the lesion, choose the correct diagnosis from multiple-choice options, with hints available
- **Ruler tool** — measure distances/sizes directly on the x-ray (in the x-ray image's own pixels, so readings match at any zoom). Turning the ruler off keeps the measurement on screen so a box can be drawn next to it; Clear (in the enlarged view), a new measurement, or the next case removes it
- **Zoom** — the enlarge button in the x-ray's top-right corner opens it larger over a blurred page, with Check, Clear and Ruler buttons under the shrink button
- **Result pop-up** — every graded answer (region, diagnosis, tutorial questions) is reported through a "You got it right! / You got it wrong" pop-up that shows the answer and a Continue button
- **Dashboard** — browse cases by unit; each case shows a check or cross for the student's most recent answer, and each unit shows the student's mastery
- **Unit practice** — picks a case from the unit at a difficulty matched to the student's current mastery, preferring cases they haven't done yet
- **Unit tests** — one question per unit; passing a unit's test unlocks the next unit for Practice All. Passed tests and mastered units get a crown badge
- **Practice All** — picks cases from every unlocked unit, favouring the lesion types the student is weakest at (requires login)
- **Bayesian Knowledge Tracing (BKT)** — after each diagnosis answer, the server updates a running mastery estimate (0–1) per student per lesion type. See [Bayesian Knowledge Tracing](#bayesian-knowledge-tracing) below
- **Tutorial** — five short lessons (Introduction, Tools, Practice, AI Assistance, Summary), each with a video and a question
- **Home slideshow** — cycles through every image in `public/images/slide-show-images/` in filename order (use `01-`, `02-`… prefixes to set the order); falls back to `train_0.png` if the folder is empty
- **Resources page** — supplementary reference material
- **Accounts** — sign up (with an instructor access code), log in and log out. The top-right nav shows "Login | Sign Up" when signed out, and the username and a "Sign Out" link when signed in

## WIP

- **Instructor dashboard** — for reviewing student progress, resetting attempts, and adding new lectures/cases
- **AI chatbot** — currently a placeholder reply in `public/js/case/chat.js`; not yet backed by a real model
- **Tutorial videos** — lessons still use placeholder video IDs (`VIDEO_ID_...` in `public/js/tutorial-lesson.js`)
- **Password reset** — the form exists, but sending a reset email is not implemented
- **Security** — passwords are stored in plain text in `data/users.csv` and the sign-up access code is hard-coded in `public/js/signup.js`; both need replacing before real use

## Setup

### Prerequisites

- Node.js and npm — <https://nodejs.org/en/download/>

### 1. Clone the repository

```bash
git clone https://github.com/mcsmith1219/Dental-Lesion-Trainer-Website.git
cd Dental-Lesion-Trainer-Website
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start the server

```bash
npm start
```

On Windows you can also double-click `start-server.bat`. You should see:

```
Server running on http://localhost:3000
```

Then open <http://localhost:3000> in your browser. To use a different port, set `PORT` in `.env` (see below).

## Demo data

The CSV files in `data/` ship with demo data so the app works straight away:

| Username | Password | Role |
|---|---|---|
| `demo0` | `password` | admin |
| `demo1` | `password` | teacher |
| `demo2`–`demo5` | `password` | student |

- New accounts need the sign-up access code `accesscodedemo`
- `data/user_interactions.csv` contains 19 sample case submissions for `demo1`

These are demo values only. Replace them before any real use.

## Data files

| File | Contents | Written by the app? |
|---|---|---|
| `data/cases.csv` | Every case: lesion category, image, correct region, diagnosis, severity | No |
| `data/questions.csv` | Questions, answer choices and hints for each case | No |
| `data/users.csv` | User accounts | Yes, on sign-up |
| `data/user_interactions.csv` | One row per completed case submission | Yes |
| `data/bkt-mastery.csv` | Current mastery estimate per (student, lesion type) | Yes |
| `data/unit-tests.csv` | One row per unit test attempt | Yes |

## Optional: PostgreSQL

The scripts in `server/db/` can copy the CSV data into a PostgreSQL database for analysis. The running app does not use them. You will need PostgreSQL running and reachable.

1. Copy the template and fill in your database credentials (`.env` is git-ignored — never commit real credentials):

   ```bash
   cp .env.example .env
   ```

   ```
   PGUSER=postgres
   PGPASSWORD=your_password_here
   PGHOST=localhost
   PGPORT=5432
   PGDATABASE=mydb
   ```

2. Create the database and tables from `server/db/database.sql`:

   ```bash
   npm run init-db
   ```

3. Load the CSV files into the tables:

   ```bash
   npm run import-data
   ```

4. Print the tables to check them:

   ```bash
   npm run view-tables
   ```
