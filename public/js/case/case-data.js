// Loads cases and questions from the API.
let cases = [];

const DEFAULT_CORRECT_REGION = {x: 50, y: 50, width: 25, height: 25};

function severityToDifficulty(severity) {
  const level = Number(severity);
  if (level >= 3) return "Difficult";
  if (level === 2) return "Intermediate";
  return "Beginner";
}

function parseCorrectRegion(localization) {
  if (!localization) return DEFAULT_CORRECT_REGION;

  try {
    const parsed = JSON.parse(localization);
    if (parsed && typeof parsed.x === "number" && typeof parsed.y === "number" &&
        typeof parsed.width === "number" && typeof parsed.height === "number") {
      return parsed;
    }
  } catch (err) {
  }

  return DEFAULT_CORRECT_REGION;
}

function buildCaseFromApiData(caseRow, questionRows) {
  const primaryQuestion = questionRows[0] || null;
  const choiceLetters = {A: "choice_a", B: "choice_b", C: "choice_c", D: "choice_d"};

  const choices = primaryQuestion
    ? [primaryQuestion.choice_a, primaryQuestion.choice_b, primaryQuestion.choice_c, primaryQuestion.choice_d].filter(Boolean)
    : [];

  const correctAnswer = primaryQuestion
    ? primaryQuestion[choiceLetters[primaryQuestion.correct_answer]] || null
    : null;

  const hints = questionRows.map(q => q.hint_type).filter(Boolean);

  return {
    caseId: caseRow.case_id,
    name: caseRow.case_id,
    category: caseRow.category,
    questionNumber: null,
    diagnosis: caseRow.diagnosis,
    difficulty: severityToDifficulty(caseRow.severity),
    imageUrl: caseRow.image_path,
    correctRegion: parseCorrectRegion(caseRow.localization),
    correctAnswer: correctAnswer,
    choices: choices,
    hints: hints
  };
}

async function loadCasesFromApi() {
  try {
    const response = await fetch("/api/cases");
    const caseRows = await response.json();

    if (!response.ok || !Array.isArray(caseRows)) {
      throw new Error("Failed to load cases");
    }

    const loadedCases = [];
    for (const caseRow of caseRows) {
      const questionsResponse = await fetch(`/api/questions/${caseRow.case_id}`);
      const questionRows = questionsResponse.ok ? await questionsResponse.json() : [];
      if (questionRows.length > 0) {
        loadedCases.push(buildCaseFromApiData(caseRow, questionRows));
      }
    }

    const countByCategory = {};
    loadedCases.forEach(function (caseItem) {
      countByCategory[caseItem.category] = (countByCategory[caseItem.category] || 0) + 1;
      caseItem.questionNumber = countByCategory[caseItem.category];
    });

    return loadedCases;
  } catch (error) {
    console.error("Error loading cases from API:", error);
    return [];
  }
}

async function loadSingleCaseFromApi(caseId) {
  try {
    const caseResponse = await fetch(`/api/cases/${encodeURIComponent(caseId)}`);
    if (!caseResponse.ok) return null;
    const caseRow = await caseResponse.json();

    const questionsResponse = await fetch(`/api/questions/${encodeURIComponent(caseId)}`);
    const questionRows = questionsResponse.ok ? await questionsResponse.json() : [];
    if (questionRows.length === 0) return null;

    return buildCaseFromApiData(caseRow, questionRows);
  } catch (error) {
    console.error("Error loading case from API:", error);
    return null;
  }
}
