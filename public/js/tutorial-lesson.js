// Plays tutorial lessons and their questions.
const lessons = {
  introduction: {
    title: "Introduction",
    description: "Learn the overall workflow for identifying and diagnosing a dental lesion.",
    videoId: "VIDEO_ID_INTRODUCTION",
    question: "What is the first step in a training case?",
    options: [
      "Submit a diagnosis immediately",
      "Locate the suspected lesion on the x-ray",
      "Ask the AI for the answer",
      "Skip to the summary"
    ],
    answer: 1
  },
  tools: {
    title: "Tools",
    description: "Learn how the highlighting, ruler, and hint tools support your assessment.",
    videoId: "VIDEO_ID_TOOLS",
    question: "Which tool lets you mark the suspected lesion area?",
    options: ["Highlight tool", "Summary tool", "Login tool", "Resource tool"],
    answer: 0
  },
  practice: {
    title: "Practice",
    description: "Practice the complete case workflow before working independently.",
    videoId: "VIDEO_ID_PRACTICE",
    question: "What happens after you check your lesion highlight?",
    options: [
      "The case is deleted",
      "Feedback is shown and the next step can unlock",
      "Your account is logged out",
      "The page returns to Home"
    ],
    answer: 1
  },
  "ai-assistance": {
    title: "AI Assistance",
    description: "See how to use the AI panel as a learning aid while preserving your own reasoning.",
    videoId: "VIDEO_ID_AI_ASSISTANCE",
    question: "How should the AI panel be used?",
    options: [
      "As a replacement for every diagnosis",
      "As a learning aid after considering the case evidence",
      "Only to skip the video",
      "To change another student's score"
    ],
    answer: 1
  },
  summary: {
    title: "Summary",
    description: "Review the key steps and prepare to begin the available cases.",
    videoId: "VIDEO_ID_SUMMARY",
    question: "What should you do after choosing an answer?",
    options: [
      "Submit it and review the feedback",
      "Close the browser",
      "Erase the case",
      "Restart the tutorial"
    ],
    answer: 0
  }
};

const lessonKey = new URLSearchParams(window.location.search).get("lesson") || "introduction";
const lesson = lessons[lessonKey] || lessons.introduction;
const lessonTitle = document.getElementById("lessonTitle");
const lessonDescription = document.getElementById("lessonDescription");
const videoStatus = document.getElementById("videoStatus");
const lessonQuestion = document.getElementById("lessonQuestion");
const questionPrompt = document.getElementById("questionPrompt");
const lessonOptions = document.getElementById("lessonOptions");
const questionForm = document.getElementById("questionForm");
const lessonFeedback = document.getElementById("lessonFeedback");

lessonTitle.textContent = lesson.title;
lessonDescription.textContent = lesson.description;
questionPrompt.textContent = lesson.question;

document.title = `${lesson.title} | IDentiFind`;
lesson.options.forEach((option, index) => {
  const label = document.createElement("label");
  label.className = "lesson-option";
  label.innerHTML = `<input type="radio" name="lessonAnswer" value="${index}"> <span>${option}</span>`;
  lessonOptions.appendChild(label);
});

function revealQuestion() {
  lessonQuestion.hidden = false;
  videoStatus.textContent = "Video complete. Answer the question below.";
  lessonQuestion.scrollIntoView({behavior: "smooth", block: "start"});
}

function loadYouTubeApi() {
  window.onYouTubeIframeAPIReady = function () {
    new YT.Player("lessonVideo", {
      width: "100%",
      height: "100%",
      videoId: lesson.videoId,
      playerVars: {rel: 0, modestbranding: 1},
      events: {
        onStateChange: function (event) {
          if (event.data === YT.PlayerState.ENDED) {
            revealQuestion();
          }
        },
        onError: function () {
          videoStatus.textContent = "Add this lesson's YouTube video ID in js/tutorial-lesson.js to enable playback.";
        }
      }
    });
  };

  const script = document.createElement("script");
  script.src = "https://www.youtube.com/iframe_api";
  document.head.appendChild(script);
}

questionForm.addEventListener("submit", function (event) {
  event.preventDefault();
  const selected = document.querySelector("input[name=lessonAnswer]:checked");

  if (!selected) {
    lessonFeedback.className = "lesson-feedback incorrect";
    lessonFeedback.textContent = "Choose an answer first.";
    return;
  }

  lessonFeedback.className = "lesson-feedback";
  lessonFeedback.textContent = "";

  const isCorrect = Number(selected.value) === lesson.answer;
  if (isCorrect) {
    showResultPopup({
      correct: true,
      answer: lesson.options[lesson.answer],
      message: "You're ready for the next tutorial lesson or a training case."
    });
  } else {
    showResultPopup({
      correct: false,
      message: "Review the lesson and try again."
    });
  }
});

loadYouTubeApi();
