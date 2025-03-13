document.addEventListener("DOMContentLoaded", function () {
  // Global Variables
  let questions = [];
  let quizQuestions = [];
  let currentQuestionIndex = 0;
  let userAnswers = [];
  let quizLength = 0; // number of questions the user will answer

  // DOM Elements
  const quizContainer = document.getElementById("quiz-container");
  const questionContainer = document.getElementById("question-container");
  const answersListEl = document.getElementById("answers-list");
  const nextBtn = document.getElementById("next-btn");
  const resetBtn = document.getElementById("reset-btn");

  // Create and insert quiz setup panel for selecting the number of questions
  let quizSetupDiv = document.createElement("div");
  quizSetupDiv.id = "quiz-setup";
  quizSetupDiv.style.marginBottom = "20px";
  quizSetupDiv.innerHTML = `
    <label for="quiz-length">Select number of questions (max 15): </label>
    <input type="number" id="quiz-length" min="1" max="15" value="15" style="width:50px;" />
    <button id="start-btn" class="btn">Start Quiz</button>
  `;
  quizContainer.insertBefore(quizSetupDiv, quizContainer.firstChild);

  // Create progress indicator element and append it
  let progressIndicator = document.createElement("div");
  progressIndicator.id = "progress-indicator";
  progressIndicator.style.marginTop = "10px";
  progressIndicator.style.fontWeight = "bold";
  quizContainer.appendChild(progressIndicator);

  let startBtn = document.getElementById("start-btn");
  let quizLengthInput = document.getElementById("quiz-length");

  // Utility: Shuffle an array in place
  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  // For each question, randomize its answer order and update the 'correct' index
  function randomizeQuestionAnswers(q) {
    let originalCorrect = q.answers[q.correct];
    let shuffled = shuffleArray(q.answers.slice());
    q.answers = shuffled;
    q.correct = shuffled.indexOf(originalCorrect);
  }

  // Load questions from the JSON database
  fetch("data/questions.json")
    .then((response) => response.json())
    .then((data) => {
      questions = data.questions;
    })
    .catch((error) => {
      console.error("Error loading questions:", error);
      questionContainer.innerHTML = "Failed to load questions. Please try again later.";
    });

  // Start Quiz event handler
  startBtn.addEventListener("click", function () {
    quizLength = parseInt(quizLengthInput.value);
    if (isNaN(quizLength) || quizLength < 1 || quizLength > 15) {
      alert("Please select a valid number between 1 and 15.");
      return;
    }
    // Randomize the order of questions and then select quizLength questions
    let randomizedQuestions = shuffleArray([...questions]);
    quizQuestions = randomizedQuestions.slice(0, quizLength);
    // For each selected question, randomize the answer order
    quizQuestions.forEach(q => randomizeQuestionAnswers(q));
    userAnswers = new Array(quizQuestions.length).fill(null);
    currentQuestionIndex = 0;
    quizSetupDiv.style.display = "none";
    showQuestion();
    updateProgress();
  });

  // Display the current question and its answer options
  function showQuestion() {
    if (currentQuestionIndex >= quizQuestions.length) {
      showSummary();
      return;
    }
    questionContainer.innerHTML = "";
    answersListEl.innerHTML = "";

    let currentQuestion = quizQuestions[currentQuestionIndex];
    let questionElem = document.createElement("h3");
    questionElem.textContent = currentQuestion.question;
    questionContainer.appendChild(questionElem);

    // Render answer options as clickable list items
    currentQuestion.answers.forEach((answer, index) => {
      let answerOption = document.createElement("li");
      answerOption.textContent = answer;
      answerOption.className = "answer-option";
      answerOption.style.display = "block";
      answerOption.style.margin = "8px 0";
      answerOption.style.padding = "10px";
      answerOption.style.border = "1px solid #ccc";
      answerOption.style.borderRadius = "3px";
      answerOption.style.backgroundColor = "#e9ecef";
      answerOption.style.cursor = "pointer";

      answerOption.addEventListener("click", function () {
        if (userAnswers[currentQuestionIndex] === null) {
          userAnswers[currentQuestionIndex] = index;
          highlightSelection(index);
        }
      });
      answersListEl.appendChild(answerOption);
    });
  }

  // Highlight the selected answer and disable further selection changes
  function highlightSelection(selectedIndex) {
    const options = answersListEl.getElementsByTagName("li");
    for (let i = 0; i < options.length; i++) {
      if (i === selectedIndex) {
        options[i].style.backgroundColor = "#d4edda";
      }
      options[i].style.pointerEvents = "none";
    }
  }

  // Update progress indicator text
  function updateProgress() {
    progressIndicator.textContent = `Question ${currentQuestionIndex + 1} of ${quizQuestions.length}`;
  }

  // Next button click: ensure an answer has been selected, then proceed to next question or summary
  nextBtn.addEventListener("click", function () {
    if (userAnswers[currentQuestionIndex] === null) {
      alert("Please select an answer before proceeding.");
      return;
    }
    currentQuestionIndex++;
    if (currentQuestionIndex < quizQuestions.length) {
      showQuestion();
      updateProgress();
    } else {
      showSummary();
    }
  });

  // Reset button: allow the student to restart the quiz
  resetBtn.addEventListener("click", function () {
    if (confirm("Reset your quiz progress?")) {
      quizSetupDiv.style.display = "block";
      questionContainer.innerHTML = "";
      answersListEl.innerHTML = "";
      progressIndicator.textContent = "";
      nextBtn.style.display = "inline-block";
      currentQuestionIndex = 0;
      userAnswers = [];
    }
  });

  // Show final summary with overall score at the start and color-coded responses
  function showSummary() {
    questionContainer.innerHTML = "";
    answersListEl.innerHTML = "";
    progressIndicator.textContent = "";
    nextBtn.style.display = "none";

    let correctCount = 0;
    quizQuestions.forEach((q, idx) => {
      if (userAnswers[idx] === q.correct) {
        correctCount++;
      }
    });

    // Build summary HTML with overall score and then each question review
    let summaryHTML = `<h3>Quiz Summary</h3>`;
    summaryHTML += `<h4 style="font-weight:bold;">Your Score: ${correctCount} out of ${quizQuestions.length}</h4>`;
    summaryHTML += `<p>Total Questions: ${quizQuestions.length}</p>`;
    
    quizQuestions.forEach((q, idx) => {
      let userAnsIndex = userAnswers[idx];
      let isCorrect = userAnsIndex === q.correct;
      let answerColor = isCorrect ? "green" : "red";
      summaryHTML += `<div style="margin-bottom: 15px; border-bottom: 1px solid #ccc; padding-bottom: 10px;">`;
      summaryHTML += `<p><strong>Question ${idx + 1}:</strong> ${q.question}</p>`;
      summaryHTML += `<p><strong>Your Answer:</strong> <span style="font-weight:bold; color:${answerColor};">` +
                     (typeof userAnsIndex === "number" ? q.answers[userAnsIndex] : "No answer selected") +
                     `</span></p>`;
      summaryHTML += `<p><strong>Correct Answer:</strong> <span style="font-weight:bold;">${q.answers[q.correct]}</span></p>`;
      summaryHTML += `<p><strong>Explanation:</strong> ${q.explanation}</p>`;
      summaryHTML += `</div>`;
    });

    questionContainer.innerHTML = summaryHTML;

    let restartBtn = document.createElement("button");
    restartBtn.textContent = "Restart Quiz";
    restartBtn.className = "btn";
    restartBtn.addEventListener("click", function () {
      currentQuestionIndex = 0;
      userAnswers = [];
      quizSetupDiv.style.display = "block";
      questionContainer.innerHTML = "";
      answersListEl.innerHTML = "";
      progressIndicator.textContent = "";
      nextBtn.style.display = "inline-block";
    });
    quizContainer.appendChild(restartBtn);
  }
});
