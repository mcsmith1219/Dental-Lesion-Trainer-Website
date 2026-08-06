const cases = [
  {
    name: "Case 1",
    diagnosis: "Interproximal caries",
    difficulty: "Beginner",
    imageUrl: "images/train_0.png",
    correctRegion: {
      x: 50,
      y: 50,
      width: 25,
      height: 25
    },
    correctAnswer: "Interproximal caries",
    choices: [
      "Interproximal caries",
      "Periapical lesion",
      "Impacted tooth",
      "Normal enamel overlap"
    ],
    hints: [
      "This lesion often appears as radiolucent, darker areas on the radiograph.",
      "This lesion is commonly found between adjacent teeth.",
      "A radiolucent area between the crowns of two adjacent teeth is a classic sign of this condition."
    ],
    aiSector: {
      partOneAccuracy: "100%",
      partTwoAccuracy: "100%",
      averageHints: "0",
      overallAccuracy: "100%"
    }
  },
  {
    name: "Case 2",
    diagnosis: "Periapical Lesion",
    difficulty: "Intermediate",
    imageUrl: "images/train_0.png",
    correctRegion: {
      x: 50,
      y: 50,
      width: 25,
      height: 25
    },
    correctAnswer: "Periapical radiolucency",
    choices: [
      "Interproximal caries",
      "Periapical radiolucency",
      "Calculus deposit",
      "Normal pulp chamber"
    ],
    hints: [
      "This lesion is usually evaluated near the root apex.",
      "A radiolucency near the apex can suggest inflammatory or infectious change.",
      "A radiolucent area at the root tip is a classic sign of this condition."
    ],
    aiSector: {
      partOneAccuracy: "100%",
      partTwoAccuracy: "100%",
      averageHints: "0",
      overallAccuracy: "100%"
    }
  }
];

let currentCaseIndex = 0;
let selectedAnswer = null;
let selectionRegion = null;
let selectionBoxElement = null;
let isDraggingSelection = false;
let dragStartPoint = null;
let revealedHintCount = 0;
let currentHints = [];
let incorrectRegionGuesses = 0;
let incorrectAnswerGuesses = 0;
let questionUnlocked = false;
let partOneWasCorrect = false;
let partTwoComplete = false;

const appShell = document.getElementById("appShell");
const questionCard = document.getElementById("questionCard");
const viewer = document.getElementById("xrayViewer");
const image = document.getElementById("xrayImage");
const correctBox = document.getElementById("correctBox");
const answersContainer = document.getElementById("answers");
const feedbackBox = document.getElementById("feedbackBox");
const hintsList = document.getElementById("hintsList");
const hintsCounter = document.getElementById("hintsCounter");
const caseTitle = document.getElementById("caseTitle");
const partOneSubtext = document.getElementById("partOneSubtext");
const questionTitle = document.getElementById("questionTitle");
const questionPrompt = document.getElementById("questionPrompt");
const difficultyBadge = document.getElementById("difficultyBadge");
const showRegionBtn = document.getElementById("showRegionBtn");
const checkRegionBtn = document.getElementById("checkRegionBtn");
const submitAnswerBtn = document.getElementById("submitAnswerBtn");
const nextCaseBtn = document.getElementById("nextCaseBtn");
const aiSector = document.getElementById("aiSector");
const chatMessages = document.getElementById("chatMessages");
const chatInput = document.getElementById("chatInput");
const chatSendBtn = document.getElementById("chatSendBtn");
const clearHighlightBtn = document.getElementById("clearHighlightBtn");
const revealHintBtn = document.getElementById("revealHintBtn");
const rulerBtn = document.getElementById("rulerBtn");

let rulerActive = false;
let rulerPoints = [];
let rulerElements = [];

viewer.addEventListener("click", function (event) {
  if (!rulerActive) {
    return;
  }

  const rect = viewer.getBoundingClientRect();
  const xPercent = ((event.clientX - rect.left) / rect.width) * 100;
  const yPercent = ((event.clientY - rect.top) / rect.height) * 100;

  addRulerPoint(xPercent, yPercent);
});

viewer.addEventListener("mousedown", function (event) {
  if (rulerActive || questionUnlocked) {
    return;
  }

  event.preventDefault();

  const rect = viewer.getBoundingClientRect();
  const xPercent = clampPercent(((event.clientX - rect.left) / rect.width) * 100);
  const yPercent = clampPercent(((event.clientY - rect.top) / rect.height) * 100);

  clearSelection();

  isDraggingSelection = true;
  dragStartPoint = { x: xPercent, y: yPercent };

  selectionBoxElement = document.createElement("div");
  selectionBoxElement.className = "selection-box";
  viewer.appendChild(selectionBoxElement);

  updateSelectionBox(xPercent, yPercent);
});

document.addEventListener("mousemove", function (event) {
  if (!isDraggingSelection) {
    return;
  }

  const rect = viewer.getBoundingClientRect();
  const xPercent = clampPercent(((event.clientX - rect.left) / rect.width) * 100);
  const yPercent = clampPercent(((event.clientY - rect.top) / rect.height) * 100);

  updateSelectionBox(xPercent, yPercent);
});

document.addEventListener("mouseup", function () {
  if (!isDraggingSelection) {
    return;
  }

  isDraggingSelection = false;

  if (!selectionRegion || selectionRegion.width < 1.5 || selectionRegion.height < 1.5) {
    clearSelection();
  }
});

function clampPercent(value) {
  return Math.min(100, Math.max(0, value));
}

function updateSelectionBox(currentX, currentY) {
  const x = Math.min(dragStartPoint.x, currentX);
  const y = Math.min(dragStartPoint.y, currentY);
  const width = Math.abs(currentX - dragStartPoint.x);
  const height = Math.abs(currentY - dragStartPoint.y);

  selectionRegion = { x: x, y: y, width: width, height: height };

  selectionBoxElement.style.left = `${x}%`;
  selectionBoxElement.style.top = `${y}%`;
  selectionBoxElement.style.width = `${width}%`;
  selectionBoxElement.style.height = `${height}%`;
}

function toggleRuler() {
  rulerActive = !rulerActive;
  rulerBtn.classList.toggle("active", rulerActive);
  clearRuler();
}

function clearRuler() {
  rulerElements.forEach(function (el) {
    el.remove();
  });
  rulerElements = [];
  rulerPoints = [];
}

function addRulerPoint(xPercent, yPercent) {
  if (rulerPoints.length >= 2) {
    clearRuler();
  }

  const point = { x: xPercent, y: yPercent };
  rulerPoints.push(point);

  const dot = document.createElement("div");
  dot.className = "ruler-point";
  dot.style.left = `${xPercent}%`;
  dot.style.top = `${yPercent}%`;
  viewer.appendChild(dot);
  rulerElements.push(dot);

  if (rulerPoints.length === 2) {
    drawRulerLine();
  }
}

function drawRulerLine() {
  const rect = viewer.getBoundingClientRect();
  const [p1, p2] = rulerPoints;
  const x1 = (p1.x / 100) * rect.width;
  const y1 = (p1.y / 100) * rect.height;
  const x2 = (p2.x / 100) * rect.width;
  const y2 = (p2.y / 100) * rect.height;

  const dx = x2 - x1;
  const dy = y2 - y1;
  const distancePx = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);

  const line = document.createElement("div");
  line.className = "ruler-line";
  line.style.left = `${x1}px`;
  line.style.top = `${y1}px`;
  line.style.width = `${distancePx}px`;
  line.style.transform = `rotate(${angle}deg)`;
  viewer.appendChild(line);
  rulerElements.push(line);

  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;
  const label = document.createElement("div");
  label.className = "ruler-label";
  label.style.left = `${midX}px`;
  label.style.top = `${midY - 14}px`;
  label.textContent = `${distancePx.toFixed(1)} px`;
  viewer.appendChild(label);
  rulerElements.push(label);
}

function loadCase() {
  const currentCase = cases[currentCaseIndex];

  caseTitle.textContent = `${currentCase.name}, Part 1: Locate Lesion`;
  partOneSubtext.textContent = "Drag to draw a box around the area on the x-ray where you think the most likely lesion is located";
  difficultyBadge.textContent = currentCase.difficulty;
  questionTitle.textContent = `${currentCase.name}, Part 2: Identify the Lesion`;
  questionPrompt.textContent = "Great! Now, identify the lesion.";

  image.src = currentCase.imageUrl;
  selectedAnswer = null;
  selectionRegion = null;
  incorrectRegionGuesses = 0;
  incorrectAnswerGuesses = 0;
  questionUnlocked = false;
  partOneWasCorrect = false;
  partTwoComplete = false;

  appShell.classList.add("region-step");
  questionCard.setAttribute("aria-hidden", "true");
  showRegionBtn.classList.remove("is-hidden");
  checkRegionBtn.disabled = false;
  clearHighlightBtn.disabled = false;
  revealHintBtn.disabled = false;
  submitAnswerBtn.disabled = false;
  nextCaseBtn.className = "danger next-btn";

  clearSelection();
  rulerActive = false;
  rulerBtn.classList.remove("active");
  clearRuler();
  hideCorrectRegion();
  hideFeedback();
  renderAnswers(currentCase.choices);
  renderHints(currentCase.hints);
}

function renderAnswers(choices) {
  answersContainer.innerHTML = "";

  choices.forEach(function (choice) {
    const button = document.createElement("button");
    button.className = "answer-btn";
    button.type = "button";
    button.textContent = choice;

    button.addEventListener("click", function () {
      if (partTwoComplete) {
        return;
      }

      selectedAnswer = choice;
      document.querySelectorAll(".answer-btn").forEach(function (btn) {
        btn.classList.remove("selected");
      });
      button.classList.add("selected");
    });

    answersContainer.appendChild(button);
  });
}

function renderHints(hints) {
  currentHints = hints;
  revealedHintCount = 0;
  hintsList.innerHTML = "";

  hints.forEach(function (hint) {
    const li = document.createElement("li");
    li.textContent = hint;
    li.style.display = "none";
    hintsList.appendChild(li);
  });

  updateHintCounter();
}

function updateHintCounter() {
  const totalHints = currentHints.length;
  const label = totalHints === 1 ? "hint" : "hints";
  hintsCounter.textContent = `${revealedHintCount} of ${totalHints} ${label} revealed`;
  revealHintBtn.disabled = totalHints === 0 || revealedHintCount >= totalHints;
}

function clearSelection() {
  if (questionUnlocked) {
    return;
  }

  if (selectionBoxElement) {
    selectionBoxElement.remove();
    selectionBoxElement = null;
  }
  selectionRegion = null;
}

function isSelectionOverlappingRegion() {
  if (!selectionRegion) {
    return false;
  }

  const region = cases[currentCaseIndex].correctRegion;

  const overlapX = Math.max(
    0,
    Math.min(selectionRegion.x + selectionRegion.width, region.x + region.width) -
      Math.max(selectionRegion.x, region.x)
  );
  const overlapY = Math.max(
    0,
    Math.min(selectionRegion.y + selectionRegion.height, region.y + region.height) -
      Math.max(selectionRegion.y, region.y)
  );
  const overlapArea = overlapX * overlapY;
  const regionArea = region.width * region.height;

  if (regionArea <= 0) {
    return false;
  }

  return overlapArea / regionArea >= 0.4;
}

function checkRegion() {
  if (!selectionRegion) {
    partOneSubtext.textContent = "Drag to draw a box around the area on the x-ray where you think the most likely lesion is located";
    return false;
  }

  if (isSelectionOverlappingRegion()) {
    incorrectRegionGuesses = 0;
    partOneWasCorrect = true;
    unlockQuestionPanel(false);
    return true;
  }

  incorrectRegionGuesses += 1;

  if (incorrectRegionGuesses >= 3) {
    partOneWasCorrect = false;
    showCorrectRegion();
    unlockQuestionPanel(true);
  } else {
    const guessesLeft = 3 - incorrectRegionGuesses;
    partOneSubtext.textContent = `Not quite. Try again. ${guessesLeft} region ${guessesLeft === 1 ? "guess" : "guesses"} left before the lesion location is revealed.`;
  }

  return false;
}

function unlockQuestionPanel(showRegion) {
  if (questionUnlocked) {
    return;
  }

  questionUnlocked = true;
  checkRegionBtn.disabled = true;
  clearHighlightBtn.disabled = true;
  showRegionBtn.classList.add("is-hidden");

  if (showRegion) {
    showCorrectRegion();
  }

  questionPrompt.textContent = partOneWasCorrect
    ? "Great! Now, identify the lesion."
    : "Not quite, the lesion's location has been revealed, now identify the lesion.";

  appShell.classList.add("transitioning");

  window.setTimeout(function () {
    appShell.classList.remove("region-step");
    questionCard.setAttribute("aria-hidden", "false");

    window.setTimeout(function () {
      appShell.classList.remove("transitioning");
      appShell.classList.add("screen-flash");

      window.setTimeout(function () {
        appShell.classList.remove("screen-flash");
      }, 520);
    }, 260);
  }, 160);
}

function submitAnswer() {
  const currentCase = cases[currentCaseIndex];

  if (!questionUnlocked || partTwoComplete) {
    return;
  }

  if (!selectedAnswer) {
    showFeedback("Choose a probable lesion before submitting.", "incorrect");
    return;
  }

  const answerCorrect = selectedAnswer === currentCase.correctAnswer;

  if (answerCorrect) {
    showCorrectRegion();
    showFeedback(`Correct. The likely finding is ${currentCase.correctAnswer}. Select 'Next Case' when you're ready to move on.`, "correct");
    completePartTwo();
    return;
  }

  incorrectAnswerGuesses += 1;

  if (incorrectAnswerGuesses >= 3) {
    showCorrectRegion();
    showFeedback(`Not quite. The correct answer is ${currentCase.correctAnswer}. Select 'Next Case' when you're ready to move on.`, "incorrect");
    completePartTwo();
  } else {
    const guessesLeft = 3 - incorrectAnswerGuesses;
    showFeedback(`Not quite. Try again. ${guessesLeft} answer ${guessesLeft === 1 ? "guess" : "guesses"} left.`, "incorrect");
  }
}

function completePartTwo() {
  partTwoComplete = true;
  submitAnswerBtn.disabled = true;
  nextCaseBtn.className = "secondary next-btn";

  document.querySelectorAll(".answer-btn").forEach(function (btn) {
    btn.disabled = true;
  });
}

function showCorrectRegion() {
  const region = cases[currentCaseIndex].correctRegion;

  correctBox.style.left = `${region.x}%`;
  correctBox.style.top = `${region.y}%`;
  correctBox.style.width = `${region.width}%`;
  correctBox.style.height = `${region.height}%`;
  correctBox.style.display = "block";
}

function hideCorrectRegion() {
  correctBox.style.display = "none";
}

function showFeedback(message, type) {
  feedbackBox.textContent = message;
  feedbackBox.className = `feedback ${type}`;
  feedbackBox.style.display = "block";
}

function hideFeedback() {
  feedbackBox.textContent = "";
  feedbackBox.className = "feedback";
  feedbackBox.style.display = "none";
}

function nextCase() {
  currentCaseIndex = (currentCaseIndex + 1) % cases.length;
  loadCase();
}

function revealHint() {
  const hintItems = hintsList.querySelectorAll("li");

  if (revealedHintCount >= hintItems.length) {
    return;
  }

  hintItems[revealedHintCount].style.display = "list-item";
  revealedHintCount += 1;
  updateHintCounter();
}

// Chatbot placeholder replies, I'll implement the actual AI reasoning later.
const CHAT_PLACEHOLDER_REPLIES = [
  "This is a placeholder for now, I'll implement the actual AI reasoning later. - Matthew"
];

let chatReplyIndex = 0;

function appendChatMessage(text, sender) {
  const message = document.createElement("div");
  message.className = `chat-message ${sender}`;
  message.textContent = text;
  chatMessages.appendChild(message);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function sendChatMessage() {
  const text = chatInput.value.trim();

  if (!text) {
    return;
  }

  appendChatMessage(text, "user");
  chatInput.value = "";

  window.setTimeout(function () {
    const reply = CHAT_PLACEHOLDER_REPLIES[chatReplyIndex % CHAT_PLACEHOLDER_REPLIES.length];
    chatReplyIndex += 1;
    appendChatMessage(reply, "ai");
  }, 400);
}

chatSendBtn.addEventListener("click", sendChatMessage);
chatInput.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    sendChatMessage();
  }
});

appendChatMessage("Hi, I'm your AI Dental assistant! If you have any questions about this case, feel free to ask!", "ai");

loadCase();
