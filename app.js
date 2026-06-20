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

let answer = 0;
let correctCount = 0;
let questionCount = 0;
let answered = false;
let isRunning = false;
let targetQuestionCount = 10;
let startedAt = 0;

function randomInt(max) {
  return Math.floor(Math.random() * (max + 1));
}

function makeQuestion() {
  const selectedMode = document.querySelector('input[name="mode"]:checked').value;
  const isAddition = selectedMode === "addition" || (selectedMode === "mixed" && Math.random() < 0.5);
  let left;
  let right;

  if (isAddition) {
    left = randomInt(9);
    right = randomInt(9 - left);
    answer = left + right;
    problemElement.textContent = `${left} ＋ ${right} ＝`;
  } else {
    left = randomInt(9);
    right = randomInt(left);
    answer = left - right;
    problemElement.textContent = `${left} − ${right} ＝`;
  }
}

function showResult(isCorrect) {
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
  const elapsedSeconds = (performance.now() - startedAt) / 1000;
  const minutes = Math.floor(elapsedSeconds / 60);
  const seconds = (elapsedSeconds % 60).toFixed(1);
  timeResultElement.textContent = `おわり！ かかった じかんは ${minutes}ふん ${seconds}びょう`;
  startButton.disabled = false;
  questionTotalInput.disabled = false;
  modeInputs.forEach((input) => { input.disabled = false; });
}

function newQuestion() {
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
  startedAt = performance.now();
  startButton.disabled = true;
  questionTotalInput.disabled = true;
  modeInputs.forEach((input) => { input.disabled = true; });
  newQuestion();
}

answerInput.addEventListener("input", () => {
  answerInput.value = answerInput.value.replace(/[^0-9]/g, "");
  if (isRunning && !answered && answerInput.value.length === 1) {
    showResult(Number(answerInput.value) === answer);
  }
});

nextButton.addEventListener("click", newQuestion);
modeInputs.forEach((input) => input.addEventListener("change", makeQuestion));
startButton.addEventListener("click", startPractice);
resetButton.addEventListener("click", resetScore);
document.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && isRunning && answered) newQuestion();
});

makeQuestion();
answerInput.disabled = true;
