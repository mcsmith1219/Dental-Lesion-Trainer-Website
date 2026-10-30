// Builds the dashboard case list, badges and mastery.
const unitCategories = {
  1: "Periapical Lesion",
  2: "Carious Lesion",
  3: "Periodontal Lesion",
  4: "Cystic Lesion",
  5: "Traumatic Lesion"
};

const casesList = document.getElementById("casesList");
const practiceAllBtn = document.getElementById("practiceAllBtn");
const unitMasteryList = document.getElementById("unitMasteryList");
const signedInUser = typeof getCurrentUser === "function" ? getCurrentUser() : null;

function createLinkItem(label, href, unit, className = "") {
  const item = document.createElement("li");
  item.dataset.unit = unit;
  item.className = className;
  const link = document.createElement("a");
  link.href = href;
  link.textContent = label;
  item.appendChild(link);
  return item;
}

function createUnitHeader(unit, category) {
  const header = createLinkItem(`Unit ${unit}: ${category}`, "#", unit, "unit-divider unit-title");
  return header;
}

const STATUS_ICONS = {
  mastered: {src: "images/icons/mastered-icon.png", alt: "Mastered"},
  correct: {src: "images/icons/check-icon.png", alt: "Answered correctly"},
  incorrect: {src: "images/icons/wrong-icon.png", alt: "Answered incorrectly"}
};

function appendStatusIcon(linkItem, status) {
  const {src, alt} = STATUS_ICONS[status];
  const icon = document.createElement("img");
  icon.src = src;
  icon.alt = alt;
  icon.title = alt;
  icon.className = "status-icon";
  const link = linkItem.querySelector("a");
  link.insertBefore(icon, link.firstChild);
}

async function loadAvailableCases() {
  const casesResponse = await fetch("/api/cases");
  const caseRows = await casesResponse.json();
  if (!casesResponse.ok || !Array.isArray(caseRows)) {
    throw new Error("Cases could not be loaded");
  }

  const availableCases = [];
  for (const caseRow of caseRows) {
    const questionsResponse = await fetch(`/api/questions/${caseRow.case_id}`);
    const questionRows = questionsResponse.ok ? await questionsResponse.json() : [];
    if (questionRows.length > 0) {
      availableCases.push(caseRow);
    }
  }
  return availableCases;
}

async function loadStudentStatus() {
  if (!signedInUser) {
    return {caseResults: new Map(), skillMastery: new Map(), skillPKnow: new Map(), testStatus: []};
  }

  const [progressRows, skillRows, testStatusRows] = await Promise.all([
    fetch(`/api/progress/${signedInUser.id}`).then(r => r.ok ? r.json() : []),
    fetch(`/api/skills/${signedInUser.id}`).then(r => r.ok ? r.json() : []),
    fetch(`/api/tests/status/${signedInUser.id}`).then(r => r.ok ? r.json() : [])
  ]);

  const caseResults = new Map();
  (progressRows || []).forEach(row => caseResults.set(row.case_id, Boolean(row.part_two_correct)));

  return {
    caseResults,
    skillMastery: new Map((skillRows || []).map(row => [row.skill_name, row.mastered])),
    skillPKnow: new Map((skillRows || []).map(row => [row.skill_name, Number(row.p_know)])),
    testStatus: testStatusRows || []
  };
}

function renderCases(caseRows, studentStatus) {
  const {caseResults, skillMastery, testStatus} = studentStatus;
  const testStatusByUnit = new Map(testStatus.map(row => [String(row.unit), row]));

  casesList.innerHTML = "";
  casesList.appendChild(createLinkItem("Tutorial", "#", 0, "unit-divider unit-title"));
  ["introduction", "tools", "practice", "ai-assistance", "summary"].forEach(lesson => {
    const item = createLinkItem(lesson.replace("-", " "), `./tutorial.html?lesson=${lesson}`, 0);
    item.querySelector("a").textContent = lesson.replace(/(^|-)([a-z])/g, (_, separator, letter) => `${separator ? " " : ""}${letter.toUpperCase()}`);
    casesList.appendChild(item);
  });

  Object.entries(unitCategories).forEach(([unit, category]) => {
    const unitCases = caseRows.filter(caseRow => caseRow.category === category);
    if (unitCases.length === 0) {
      return;
    }
    casesList.appendChild(createUnitHeader(unit, category));
    unitCases.forEach((caseRow, index) => {
      const caseItem = createLinkItem(`Case ${index + 1}`, `./case.html?caseId=${encodeURIComponent(caseRow.case_id)}`, unit);
      if (caseResults.has(caseRow.case_id)) {
        appendStatusIcon(caseItem, caseResults.get(caseRow.case_id) ? "correct" : "incorrect");
      }
      casesList.appendChild(caseItem);
    });

    const practice = createLinkItem(`Unit ${unit}: Practice`, "#", unit, "unit-divider");
    practice.querySelector("a").dataset.practiceUnit = unit;
    if (skillMastery.get(category)) {
      appendStatusIcon(practice, "mastered");
    }
    practice.querySelector("a").addEventListener("click", async event => {
      event.preventDefault();
      const userId = signedInUser ? `?userId=${encodeURIComponent(signedInUser.id)}` : "";
      const response = await fetch(`/api/practice/${unit}${userId}`);
      const result = await response.json();
      if (response.ok) {
        window.location.href = `./case.html?caseId=${encodeURIComponent(result.caseId)}&practice=${unit}`;
      } else {
        alert(result.error || "No practice case is available.");
      }
    });
    casesList.appendChild(practice);

    const test = createLinkItem(`Unit ${unit}: Test`, "#", unit, "unit-divider");
    const unitTestStatus = testStatusByUnit.get(unit);
    if (unitTestStatus && unitTestStatus.passed) {
      appendStatusIcon(test, "mastered");
    }
    test.querySelector("a").addEventListener("click", async event => {
      event.preventDefault();
      if (!signedInUser) {
        alert("Log in to take the unit test.");
        return;
      }
      const response = await fetch(`/api/tests/${unit}?userId=${encodeURIComponent(signedInUser.id)}`);
      const result = await response.json();
      if (response.ok) {
        window.location.href = `./case.html?caseId=${encodeURIComponent(result.caseId)}&testUnit=${unit}`;
      } else {
        alert(result.error || "No test case is available.");
      }
    });
    casesList.appendChild(test);
  });
}

function formatMastery(pKnow) {
  return Number.isFinite(pKnow) ? `${Math.round(pKnow * 100)}%` : "N/A";
}

function renderUnitMastery(skillPKnow) {
  unitMasteryList.innerHTML = "";
  Object.values(unitCategories).forEach(category => {
    const item = document.createElement("li");
    const value = document.createElement("span");
    value.className = "unit-mastery-value";
    value.textContent = formatMastery(skillPKnow.get(category));
    if (value.textContent === "N/A") {
      value.classList.add("is-empty");
    }
    item.append(`${category} - `, value);
    unitMasteryList.appendChild(item);
  });
}

function setupPracticeAll() {
  if (!signedInUser) {
    practiceAllBtn.disabled = true;
    practiceAllBtn.title = "Log in to unlock Practice All.";
    return;
  }

  practiceAllBtn.addEventListener("click", async () => {
    const response = await fetch(`/api/practice/all?userId=${encodeURIComponent(signedInUser.id)}`);
    const result = await response.json();
    if (response.ok) {
      window.location.href = `./case.html?caseId=${encodeURIComponent(result.caseId)}&practice=all`;
    } else {
      alert(result.error || "No practice case is available.");
    }
  });
}

const studentStatusPromise = loadStudentStatus();

studentStatusPromise
  .then(studentStatus => renderUnitMastery(studentStatus.skillPKnow))
  .catch(error => console.error("Error loading unit mastery:", error));

Promise.all([loadAvailableCases(), studentStatusPromise])
  .then(([caseRows, studentStatus]) => {
    renderCases(caseRows, studentStatus);
    setupPracticeAll();
  })
  .catch(error => {
    console.error("Error loading available cases:", error);
    casesList.innerHTML = "<li class=\"unit-divider\">Cases are unavailable.</li>";
  });

document.querySelectorAll(".unit-btn").forEach(btn => {
  btn.addEventListener("click", function () {
    document.querySelectorAll(".unit-btn").forEach(button => button.classList.remove("active"));
    btn.classList.add("active");
    const unit = btn.dataset.unit;
    document.querySelectorAll("#casesList li").forEach(item => {
      item.style.display = unit === "all" || item.dataset.unit === unit ? "" : "none";
    });
  });
});
