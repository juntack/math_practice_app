const problemElement = document.querySelector("#problem");
const answerInput = document.querySelector("#answer");
const feedbackElement = document.querySelector("#feedback");
const nextButton = document.querySelector("#next-button");
const correctCountElement = document.querySelector("#correct-count");
const questionCountElement = document.querySelector("#question-count");

let answer = 0;
let correctCount = 0;
let questionCount = 0;
let answered = false;

function randomInt(max) {
  return Math.floor(Math.random() * (max + 1));
}

function makeQuestion() {
  const isAddition = Math.random() < 0.5;
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
  nextButton.hidden = false;
  nextButton.focus();
}

function newQuestion() {
  answered = false;
  answerInput.value = "";
  answerInput.disabled = false;
  feedbackElement.textContent = "";
  feedbackElement.className = "feedback";
  nextButton.hidden = true;
  makeQuestion();
  answerInput.focus();
}

answerInput.addEventListener("input", () => {
  answerInput.value = answerInput.value.replace(/[^0-9]/g, "");
  if (!answered && answerInput.value.length === 1) {
    showResult(Number(answerInput.value) === answer);
  }
});

nextButton.addEventListener("click", newQuestion);
document.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && answered) newQuestion();
});

newQuestion();
