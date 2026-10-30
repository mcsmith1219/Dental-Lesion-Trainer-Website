// Runs a case: locate, identify, hints and next case.
function practiceCountKey() {
  const user = typeof getCurrentUser === "function" ? getCurrentUser() : null;
  return `dentalLesionPracticeCount:${user ? user.id : "guest"}:${activePracticeMode}`;
}

function getCompletedPracticeCount() {
  try {
    return Number(localStorage.getItem(practiceCountKey())) || 0;
  } catch (error) {
    return 0;
  }
}

function recordCompletedPracticeQuestion() {
  try {
    localStorage.setItem(practiceCountKey(), String(getCompletedPracticeCount() + 1));
  } catch (error) {
  }
}

function questionLabel(currentCase) {
  if (activeTestUnit) {
    return `Unit ${activeTestUnit} Test`;
  }
  if (activePracticeMode) {
    return `Practice Question ${getCompletedPracticeCount() + 1}`;
  }
  return currentCase.questionNumber ? `Question ${currentCase.questionNumber}` : "Question";
}

function loadCase() {
  const currentCase = cases[currentCaseIndex];
  const label = questionLabel(currentCase);

  shrinkXray();

  caseTitle.textContent = `${label}, Part 1: Locate Lesion`;
  partOneSubtext.textContent = PART_ONE_INSTRUCTIONS;
  difficultyBadge.textContent = currentCase.difficulty;
  questionTitle.textContent = `${label}, Part 2: Identify the Lesion`;
  questionPrompt.textContent = "Now, identify the lesion.";
  nextCaseBtn.textContent = activeTestUnit ? "Finish Test" : "Next Case";

  image.src = currentCase.imageUrl;
  selectedAnswer = null;
  selectionRegion = null;
  incorrectRegionGuesses = 0;
  incorrectAnswerGuesses = 0;
  questionUnlocked = false;
  partOneWasCorrect = false;
  partTwoWasCorrect = false;
  partTwoComplete = false;
  progressSavePromise = null;

  appShell.classList.add("region-step");
  questionCard.setAttribute("aria-hidden", "true");
  showRegionBtn.classList.remove("is-hidden");
  checkRegionBtn.disabled = false;
  clearHighlightBtn.disabled = false;
  revealHintBtn.disabled = false;
  submitAnswerBtn.disabled = false;
  nextCaseBtn.className = "danger next-btn";

  clearSelection();
  setRulerActive(false);
  clearRuler();
  hideCorrectRegion();
  hideFeedback();
  updateZoomTools();
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
  if (questionUnlocked || (typeof isResultPopupOpen === "function" && isResultPopupOpen())) {
    return false;
  }

  if (cases.length === 0) {
    partOneSubtext.textContent = "Case data is unavailable. Start the server and reload the page before checking a highlight.";
    return false;
  }

  if (!selectionRegion) {
    partOneSubtext.textContent = PART_ONE_INSTRUCTIONS;
    flashZoomCaption();
    return false;
  }

  const currentCase = cases[currentCaseIndex];
  const xrayAnswer = {
    src: image.src,
    region: currentCase.correctRegion,
    selection: {...selectionRegion}
  };

  if (isSelectionOverlappingRegion()) {
    incorrectRegionGuesses = 0;
    partOneWasCorrect = true;
    showResultPopup({
      correct: true,
      message: "Here's where the lesion is.",
      xray: xrayAnswer,
      onContinue: function () {
        shrinkXray();
        unlockQuestionPanel();
      }
    });
    return true;
  }

  incorrectRegionGuesses += 1;

  if (incorrectRegionGuesses >= 3) {
    partOneWasCorrect = false;
    showResultPopup({
      correct: false,
      message: "Here's where the lesion is.",
      xray: xrayAnswer,
      onContinue: function () {
        shrinkXray();
        unlockQuestionPanel();
      }
    });
  } else {
    const guessesLeft = 3 - incorrectRegionGuesses;
    showResultPopup({
      correct: false,
      message: `${guessesLeft} ${guessesLeft === 1 ? "try" : "tries"} left before the lesion's location is shown.`,
      onContinue: shrinkXray
    });
  }

  return false;
}

function flashZoomCaption() {
  if (!isZoomed) {
    return;
  }
  updateZoomCaption();
  zoomCaption.classList.remove("is-flashing");
  void zoomCaption.offsetWidth;
  zoomCaption.classList.add("is-flashing");
}

function unlockQuestionPanel() {
  if (questionUnlocked) {
    return;
  }

  questionUnlocked = true;
  checkRegionBtn.disabled = true;
  clearHighlightBtn.disabled = true;
  showRegionBtn.classList.add("is-hidden");
  updateZoomTools();
  updateZoomCaption();

  showCorrectRegion();
  questionPrompt.textContent = "Now, identify the lesion.";

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

  if (!questionUnlocked || partTwoComplete || (typeof isResultPopupOpen === "function" && isResultPopupOpen())) {
    return;
  }

  if (!selectedAnswer) {
    showFeedback("Choose a probable lesion before submitting.");
    return;
  }

  hideFeedback();
  const answerCorrect = selectedAnswer === currentCase.correctAnswer;

  if (answerCorrect) {
    partTwoWasCorrect = true;
    completePartTwo();
    showResultPopup({
      correct: true,
      answer: currentCase.correctAnswer
    });
    return;
  }

  incorrectAnswerGuesses += 1;

  if (incorrectAnswerGuesses >= 3) {
    partTwoWasCorrect = false;
    completePartTwo();
    showResultPopup({
      correct: false,
      answer: currentCase.correctAnswer,
      yourAnswer: selectedAnswer
    });
  } else {
    const guessesLeft = 3 - incorrectAnswerGuesses;
    showResultPopup({
      correct: false,
      message: `${guessesLeft} ${guessesLeft === 1 ? "try" : "tries"} left.`
    });
  }
}

function completePartTwo() {
  partTwoComplete = true;
  submitAnswerBtn.disabled = true;
  nextCaseBtn.className = "secondary next-btn";
  showCorrectRegion();

  if (activePracticeMode && !activeTestUnit) {
    recordCompletedPracticeQuestion();
  }

  if (getCurrentUser()) {
    const currentCase = cases[currentCaseIndex];
    progressSavePromise = saveProgress(
      currentCase.caseId,
      partOneWasCorrect,
      partTwoWasCorrect,
      revealedHintCount,
      currentCase.diagnosis
    );

    if (activeTestUnit) {
      saveUnitTestResult(activeTestUnit, currentCase.caseId, partTwoWasCorrect);
    }
  }

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

function showFeedback(message) {
  feedbackBox.textContent = message;
  feedbackBox.className = "feedback";
  feedbackBox.style.display = "block";
}

function hideFeedback() {
  feedbackBox.textContent = "";
  feedbackBox.className = "feedback";
  feedbackBox.style.display = "none";
}

function nextCase() {
  if (activePracticeMode && !activeTestUnit) {
    loadNextPracticeCase();
    return;
  }

  if (activeTestUnit || currentCaseIndex >= cases.length - 1) {
    window.location.href = "./dashboard.html";
    return;
  }

  currentCaseIndex = (currentCaseIndex + 1) % cases.length;
  loadCase();
}

async function loadNextPracticeCase() {
  const currentCase = cases[currentCaseIndex];
  nextCaseBtn.disabled = true;

  try {
    if (progressSavePromise) {
      await progressSavePromise;
    }

    const query = new URLSearchParams();
    const user = getCurrentUser();
    if (user) {
      query.set("userId", user.id);
    }
    if (currentCase) {
      query.set("exclude", currentCase.caseId);
    }

    const response = await fetch(`/api/practice/${activePracticeMode}?${query}`);
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || "No practice case is available.");
    }

    let nextIndex = cases.findIndex(caseItem => caseItem.caseId === result.caseId);
    if (nextIndex < 0) {
      const resolvedCase = await loadSingleCaseFromApi(result.caseId);
      if (!resolvedCase) {
        throw new Error("The next practice case could not be loaded.");
      }
      cases.push(resolvedCase);
      nextIndex = cases.length - 1;
    }

    currentCaseIndex = nextIndex;
    window.history.replaceState(null, "", `./case.html?caseId=${encodeURIComponent(result.caseId)}&practice=${activePracticeMode}`);
    loadCase();
  } catch (error) {
    console.error("Error loading next practice case:", error);
    showFeedback(error.message);
  } finally {
    nextCaseBtn.disabled = false;
  }
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
