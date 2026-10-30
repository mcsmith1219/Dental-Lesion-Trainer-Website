// Right/wrong result pop-up.
(function () {
  const ICONS = {
    correct: "images/icons/check-icon.png",
    incorrect: "images/icons/wrong-icon.png"
  };

  let overlay = null;
  let dialog = null;
  let iconEl = null;
  let titleEl = null;
  let messageEl = null;
  let xrayFigure = null;
  let answerList = null;
  let continueBtn = null;
  let pendingContinue = null;
  let returnFocusTo = null;

  function build() {
    overlay = document.createElement("div");
    overlay.className = "result-overlay";
    overlay.hidden = true;

    overlay.innerHTML = `
      <div class="result-dialog" role="dialog" aria-modal="true" aria-labelledby="resultTitle" aria-describedby="resultMessage">
        <div class="result-header">
          <img class="result-icon" alt="" />
          <h2 class="result-title" id="resultTitle"></h2>
        </div>
        <p class="result-message" id="resultMessage"></p>
        <figure class="result-xray">
          <div class="result-xray-frame"></div>
          <figcaption class="result-legend"></figcaption>
        </figure>
        <dl class="result-answers"></dl>
        <button class="primary result-continue" type="button">Continue</button>
      </div>
    `;

    dialog = overlay.querySelector(".result-dialog");
    iconEl = overlay.querySelector(".result-icon");
    titleEl = overlay.querySelector(".result-title");
    messageEl = overlay.querySelector(".result-message");
    xrayFigure = overlay.querySelector(".result-xray");
    answerList = overlay.querySelector(".result-answers");
    continueBtn = overlay.querySelector(".result-continue");

    continueBtn.addEventListener("click", close);

    overlay.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        close();
      } else if (event.key === "Tab") {
        event.preventDefault();
        continueBtn.focus();
      }
    });

    document.body.appendChild(overlay);
  }

  function placeBox(frame, className, region) {
    const box = document.createElement("div");
    box.className = className;
    box.style.left = `${region.x}%`;
    box.style.top = `${region.y}%`;
    box.style.width = `${region.width}%`;
    box.style.height = `${region.height}%`;
    box.style.display = "block";
    frame.appendChild(box);
  }

  function renderXray(xray) {
    const frame = xrayFigure.querySelector(".result-xray-frame");
    const legend = xrayFigure.querySelector(".result-legend");
    frame.innerHTML = "";
    legend.innerHTML = "";

    if (!xray || !xray.src) {
      xrayFigure.hidden = true;
      return;
    }

    xrayFigure.hidden = false;
    const img = document.createElement("img");
    img.src = xray.src;
    img.alt = "X-ray with the lesion location outlined";
    frame.appendChild(img);

    if (xray.selection) {
      placeBox(frame, "selection-box", xray.selection);
    }
    if (xray.region) {
      placeBox(frame, "correct-box", xray.region);
    }

    legend.innerHTML = '<span class="legend-item"><span class="legend-swatch is-correct"></span>Lesion location</span>';
    if (xray.selection) {
      legend.innerHTML += '<span class="legend-item"><span class="legend-swatch is-selection"></span>Your box</span>';
    }
  }

  function addAnswerRow(label, value, className) {
    const row = document.createElement("div");
    row.className = `result-answer ${className}`;
    const term = document.createElement("dt");
    term.textContent = label;
    const detail = document.createElement("dd");
    detail.textContent = value;
    row.append(term, detail);
    answerList.appendChild(row);
  }

  function renderAnswers(options) {
    answerList.innerHTML = "";

    if (options.answer) {
      addAnswerRow(options.correct ? "Answer" : "Correct answer", options.answer, "is-correct");
    }
    if (!options.correct && options.yourAnswer) {
      addAnswerRow("Your answer", options.yourAnswer, "is-incorrect");
    }

    answerList.hidden = answerList.children.length === 0;
  }

  function open(options) {
    if (!overlay) {
      build();
    }

    const correct = Boolean(options.correct);
    pendingContinue = typeof options.onContinue === "function" ? options.onContinue : null;
    returnFocusTo = document.activeElement;

    dialog.classList.toggle("is-correct", correct);
    dialog.classList.toggle("is-incorrect", !correct);
    iconEl.src = correct ? ICONS.correct : ICONS.incorrect;
    titleEl.textContent = correct ? "You got it right!" : "You got it wrong";

    messageEl.textContent = options.message || "";
    messageEl.hidden = !options.message;

    renderXray(options.xray);
    renderAnswers(options);

    overlay.hidden = false;
    window.requestAnimationFrame(function () {
      overlay.classList.add("is-open");
    });
    continueBtn.focus();
  }

  function close() {
    if (!overlay || overlay.hidden) {
      return;
    }

    overlay.classList.remove("is-open");
    overlay.hidden = true;

    const callback = pendingContinue;
    pendingContinue = null;

    if (returnFocusTo && typeof returnFocusTo.focus === "function" && document.contains(returnFocusTo)) {
      returnFocusTo.focus();
    }
    returnFocusTo = null;

    if (callback) {
      callback();
    }
  }

  window.showResultPopup = open;
  window.isResultPopupOpen = function () {
    return Boolean(overlay && !overlay.hidden);
  };
})();
