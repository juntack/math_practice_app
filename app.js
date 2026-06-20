const problemElement = document.querySelector("#problem");
const answerInput = document.querySelector("#answer");
const feedbackElement = document.querySelector("#feedback");
const nextButton = document.querySelector("#next-button");
const checkButton = document.querySelector("#check-button");
const resetButton = document.querySelector("#reset-button");
const startButton = document.querySelector("#start-button");
const correctCountElement = document.querySelector("#correct-count");
const questionCountElement = document.querySelector("#question-count");
const modeInputs = document.querySelectorAll('input[name="mode"]');
const questionTotalInput = document.querySelector("#question-total");
const timeResultElement = document.querySelector("#time-result");
const timerEnabledInput = document.querySelector("#timer-enabled");
const numberPadButtons = document.querySelectorAll("#number-pad button");

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
let audioContext = null;

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

function updateAnswerControls() {
  const canAnswer = isRunning && !answered;
  checkButton.disabled = !canAnswer || answerInput.value.length === 0;
  numberPadButtons.forEach((button) => { button.disabled = !canAnswer; });
}

function addAnswerDigit(digit) {
  if (!isRunning || answered || answerInput.value.length >= 2) return;
  answerInput.value += digit;
  updateAnswerControls();
}

function deleteAnswerDigit() {
  if (!isRunning || answered) return;
  answerInput.value = answerInput.value.slice(0, -1);
  updateAnswerControls();
}

function getAudioContext() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return null;
  if (!audioContext) audioContext = new AudioContextClass();
  return audioContext;
}

function playTone(context, frequency, startTime, duration, type) {
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, startTime);
  gain.gain.setValueAtTime(0.001, startTime);
  gain.gain.exponentialRampToValueAtTime(0.18, startTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(startTime);
  oscillator.stop(startTime + duration + 0.02);
}

function playResultSound(isCorrect) {
  const context = getAudioContext();
  if (!context) return;

  const play = () => {
    const now = context.currentTime;
    if (isCorrect) {
      playTone(context, 1046.5, now, 0.12, "sine");
      playTone(context, 1318.5, now + 0.14, 0.25, "sine");
    } else {
      playTone(context, 170, now, 0.2, "sawtooth");
      playTone(context, 120, now + 0.18, 0.32, "sawtooth");
    }
  };

  if (context.state === "suspended") {
    context.resume().then(play).catch(() => {});
  } else {
    play();
  }
}

function showResult(isCorrect) {
  answered = true;
  questionCount += 1;
  if (isCorrect) correctCount += 1;

  feedbackElement.textContent = isCorrect ? "○" : "×";
  feedbackElement.className = `feedback ${isCorrect ? "correct" : "incorrect"}`;
  playResultSound(isCorrect);
  correctCountElement.textContent = correctCount;
  questionCountElement.textContent = questionCount;
  answerInput.disabled = true;
  updateAnswerControls();

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
  answered = false;
  answerInput.value = "";
  answerInput.disabled = false;
  updateAnswerControls();
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
  updateAnswerControls();
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
  updateAnswerControls();
});

numberPadButtons.forEach((button) => button.addEventListener("click", () => {
  if (button.dataset.action === "delete") {
    deleteAnswerDigit();
  } else {
    addAnswerDigit(button.dataset.digit);
  }
}));

checkButton.addEventListener("click", () => {
  if (isRunning && !answered && answerInput.value.length > 0) {
    showResult(Number(answerInput.value) === answer);
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
  if (isRunning && !answered && /^[0-9]$/.test(event.key)) {
    event.preventDefault();
    addAnswerDigit(event.key);
    return;
  }

  if (isRunning && !answered && event.key === "Backspace") {
    event.preventDefault();
    deleteAnswerDigit();
    return;
  }

  if (event.key.toLowerCase() === "n" && isRunning) {
    event.preventDefault();
    if (answered) {
      newQuestion();
    } else if (!checkButton.disabled) {
      checkButton.click();
    }
    return;
  }

  if (event.key === "Enter" && isRunning && answered) newQuestion();
});

prepareQuestionSet();
makeQuestion();
answerInput.disabled = true;
updateAnswerControls();
