const problemElement = document.querySelector("#problem");
const answerInput = document.querySelector("#answer");
const feedbackElement = document.querySelector("#feedback");
const nextButton = document.querySelector("#next-button");
const resetButton = document.querySelector("#reset-button");
const startButton = document.querySelector("#start-button");
const correctCountElement = document.querySelector("#correct-count");
const questionCountElement = document.querySelector("#question-count");
const modeInputs = document.querySelectorAll('input[name="mode"]');
const questionTotalInput = document.querySelector("#question-total");
const timeResultElement = document.querySelector("#time-result");
const timerEnabledInput = document.querySelector("#timer-enabled");

let answer = 0;
let correctCount = 0;
let questionCount = 0;
let answered = false;
let isRunning = false;
let targetQuestionCount = 10;
let startedAt = 0;
let isTimingEnabled = true;
let availableQuestions = [];
let lastQuestionKey = null;
let answerCheckTimer = null;

function randomInt(max) {
  return Math.floor(Math.random() * (max + 1));
}

function shuffle(items) {
  for (let index = items.length - 1; index > 0; index -= 1) {
    const swapIndex = randomInt(index);
    [items[index], items[swapIndex]] = [items[swapIndex], items[index]];
  }
  return items;
}

function createQuestionSet() {
  const selectedMode = document.querySelector('input[name="mode"]:checked').value;
  const questions = [];

  if (selectedMode !== "subtraction") {
    for (let left = 0; left <= 10; left += 1) {
      for (let right = 0; left + right <= 10; right += 1) {
        questions.push({
          key: `addition-${left}-${right}`,
          left,
          right,
          operation: "＋",
          answer: left + right,
        });
      }
    }
  }

  if (selectedMode !== "addition") {
    for (let left = 0; left <= 10; left += 1) {
      for (let right = 0; right <= left; right += 1) {
        questions.push({
          key: `subtraction-${left}-${right}`,
          left,
          right,
          operation: "−",
          answer: left - right,
        });
      }
    }
  }

  return questions;
}

function prepareQuestionSet() {
  availableQuestions = shuffle(createQuestionSet());
}

function makeQuestion() {
  if (availableQuestions.length === 0) prepareQuestionSet();

  let nextQuestion = availableQuestions.pop();
  if (nextQuestion.key === lastQuestionKey && availableQuestions.length > 0) {
    availableQuestions.unshift(nextQuestion);
    nextQuestion = availableQuestions.pop();
  }

  answer = nextQuestion.answer;
  lastQuestionKey = nextQuestion.key;
  problemElement.textContent = `${nextQuestion.left} ${nextQuestion.operation} ${nextQuestion.right} ＝`;
}

function showResult(isCorrect) {
  clearTimeout(answerCheckTimer);
  answered = true;
  questionCount += 1;
  if (isCorrect) correctCount += 1;

  feedbackElement.textContent = isCorrect ? "○" : "×";
  feedbackElement.className = `feedback ${isCorrect ? "correct" : "incorrect"}`;
  correctCountElement.textContent = correctCount;
  questionCountElement.textContent = questionCount;
  answerInput.disabled = true;

  if (questionCount === targetQuestionCount) {
    finishPractice();
  } else {
    nextButton.hidden = false;
    nextButton.focus();
  }
}

function finishPractice() {
  isRunning = false;
  if (isTimingEnabled) {
    const elapsedSeconds = (performance.now() - startedAt) / 1000;
    const minutes = Math.floor(elapsedSeconds / 60);
    const seconds = (elapsedSeconds % 60).toFixed(1);
    timeResultElement.textContent = `おわり！ かかった じかんは ${minutes}ふん ${seconds}びょう`;
  }
  startButton.disabled = false;
  questionTotalInput.disabled = false;
  timerEnabledInput.disabled = false;
  modeInputs.forEach((input) => { input.disabled = false; });
}

function newQuestion() {
  clearTimeout(answerCheckTimer);
  answered = false;
  answerInput.value = "";
  answerInput.disabled = false;
  feedbackElement.textContent = "";
  feedbackElement.className = "feedback";
  nextButton.hidden = true;
  makeQuestion();
  if (isRunning) answerInput.focus();
}

function resetScore() {
  clearTimeout(answerCheckTimer);
  correctCount = 0;
  questionCount = 0;
  answered = false;
  isRunning = false;
  correctCountElement.textContent = correctCount;
  questionCountElement.textContent = questionCount;
  answerInput.value = "";
  answerInput.disabled = true;
  feedbackElement.textContent = "";
  feedbackElement.className = "feedback";
  nextButton.hidden = true;
  timeResultElement.textContent = "";
  startButton.disabled = false;
  questionTotalInput.disabled = false;
  timerEnabledInput.disabled = false;
  modeInputs.forEach((input) => { input.disabled = false; });
}

function startPractice() {
  const requestedCount = Number(questionTotalInput.value);
  targetQuestionCount = Math.min(100, Math.max(1, Math.floor(requestedCount) || 1));
  questionTotalInput.value = targetQuestionCount;
  correctCount = 0;
  questionCount = 0;
  correctCountElement.textContent = correctCount;
  questionCountElement.textContent = questionCount;
  timeResultElement.textContent = "";
  isRunning = true;
  isTimingEnabled = timerEnabledInput.checked;
  startedAt = performance.now();
  lastQuestionKey = null;
  prepareQuestionSet();
  startButton.disabled = true;
  questionTotalInput.disabled = true;
  timerEnabledInput.disabled = true;
  modeInputs.forEach((input) => { input.disabled = true; });
  newQuestion();
}

answerInput.addEventListener("input", () => {
  answerInput.value = answerInput.value.replace(/[^0-9]/g, "");
  clearTimeout(answerCheckTimer);
  if (!isRunning || answered || answerInput.value.length === 0) return;

  if (answerInput.value.length === 2) {
    showResult(Number(answerInput.value) === answer);
  } else {
    answerCheckTimer = setTimeout(() => {
      if (isRunning && !answered && answerInput.value.length === 1) {
        showResult(Number(answerInput.value) === answer);
      }
    }, 450);
  }
});

nextButton.addEventListener("click", newQuestion);
modeInputs.forEach((input) => input.addEventListener("change", () => {
  lastQuestionKey = null;
  prepareQuestionSet();
  makeQuestion();
}));
startButton.addEventListener("click", startPractice);
resetButton.addEventListener("click", resetScore);
document.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && isRunning && answered) newQuestion();
});

prepareQuestionSet();
makeQuestion();
answerInput.disabled = true;
