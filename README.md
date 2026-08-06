# Dental Lesion Trainer Website

A prototype web application built for ECU's Dental School to help dental students practice identifying lesions in dental x-rays. Students are shown real-world x-ray images and work through a two-part exercise: first locating the lesion on the image, then identifying what type of lesion it is.

## Current status

This is an early-stage front-end prototype. The pages, styling, and interactive exercise flow are built with plain HTML, CSS, and JavaScript.

## Project structure

```
dental-website/
├── index.html            # Landing page / first training exercise
├── home.html              # Home page
├── cases.html              # Case library, browsable by unit
├── resources.html          # Reference resources
├── login.html               # Login page
├── signup.html               # Sign-up page
├── password-reset.html        # Password reset page
├── script.js               # Case data, exercise logic, ruler/region tools
├── auth.js                  # Mock user lookup for login/signup
├── styles.css                # Site-wide styling
└── images/
    └── train_0.png            # Sample training x-ray image
```

## Current Features

- **Case-based training** - each case presents an x-ray image with a known lesion, difficulty level, and diagnosis
- **Region selection** - drag to draw a bounding box around the suspected lesion location, then check it against the correct region
- **Ruler tool** - measure distances/sizes directly on the x-ray
- **Diagnosis step** - after locating the lesion, choose the correct diagnosis from multiple-choice options, with hints available
- **Case library** - browse cases organized by unit (`cases.html`)
- **Resources page** - supplementary reference material (`resources.html`)
- **Auth pages** - login, sign up, and password reset screens (`login.html`, `signup.html`, `password-reset.html`), currently wired to a mock in-memory user list

## WIP

- **Account management** - user accounts and progress tracking, backed by a PostgreSQL database
- **Bayesian Knowledge Tracing (BKT)** - model student mastery over time
- **Instructor dashboard** - for reviewing student progress, resetting attempts, and adding new lectures/cases
- **AI chatbot** - help identify mistakes in lesion location and identification
- **Magnifying glass / Zoom tool** - on the x-ray viewer

### Currently, the application is in the early stages of development and is not yet ready for production use. To view the current prototype, follow the instructions below to set up the application locally

1. Clone the repository to your local machine using the command, preferably to Visual Studio Code, using the following command:

```bash
git clone https://github.com/mcsmith1219/Dental-Lesion-Trainer-Website.git
```

2. Download node.js and npm (Node Package Manager) from the official website: <https://nodejs.org/en/download/> and follow the installation instructions for your operating system.
3. Download and install the extension 'Live Server' at <https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer> in Visual Studio Code.
4. Right click on the `index.html` file in the root directory of the project and select 'Open with Live Server' to launch the application in your default web browser.
