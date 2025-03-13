document.addEventListener("DOMContentLoaded", function () {
  // Global Variables
  let questions = [];
  let quizQuestions = [];
  let currentQuestionIndex = 0;
  let userAnswers = [];
  let quizLength = 0; // Number of questions selected by the user

  // DOM Elements
  const quizContainer = document.getElementById("quiz-container");
  const questionContainer = document.getElementById("question-container");
  const answersListEl = document.getElementById("answers-list");
  const nextBtn = document.getElementById("next-btn");
  const resetBtn = document.getElementById("reset-btn");

  // Create and insert quiz setup panel (for selecting question count)
  let quizSetupDiv = document.createElement("div");
  quizSetupDiv.id = "quiz-setup";
  quizSetupDiv.style.marginBottom = "20px";
  quizSetupDiv.innerHTML = `
    <label for="quiz-length">Select number of questions (max 15): </label>
    <input type="number" id="quiz-length" min="1" max="15" value="15" style="width:50px;" />
    <button id="start-btn" class="btn">Start Quiz</button>
  `;
  quizContainer.insertBefore(quizSetupDiv, quizContainer.firstChild);

  // Create a progress indicator element
  let progressIndicator = document.createElement("div");
  progressIndicator.id = "progress-indicator";
  progressIndicator.style.marginTop = "10px";
  progressIndicator.style.fontWeight = "bold";
  quizContainer.appendChild(progressIndicator);

  // Get references for the quiz setup input & start button
  let startBtn = document.getElementById("start-btn");
  let quizLengthInput = document.getElementById("quiz-length");

  // Load quiz questions from the JSON file
  fetch("data/questions.json")
    .then((response) => response.json())
    .then((data) => {
      questions = data.questions;
    })
    .catch((error) => {
      console.error("Error loading questions:", error);
      questionContainer.innerHTML =
        "Failed to load questions. Please try again later.";
    });

  // Function to start the quiz
  startBtn.addEventListener("click", function () {
    quizLength = parseInt(quizLengthInput.value);
    if (isNaN(quizLength) || quizLength < 1 || quizLength > 15) {
      alert("Please select a valid number between 1 and 15.");
      return;
    }
    quizQuestions = questions.slice(0, quizLength);
    userAnswers = new Array(quizQuestions.length).fill(null);
    currentQuestionIndex = 0;

    quizSetupDiv.style.display = "none"; // Hide setup panel
    showQuestion();
    updateProgress();
  });

  // Display the current question and answer options
  function showQuestion() {
    if (currentQuestionIndex >= quizQuestions.length) {
      showSummary();
      return;
    }
    questionContainer.innerHTML = "";
    answersListEl.innerHTML = "";

    const currentQuestion = quizQuestions[currentQuestionIndex];
    let questionText = document.createElement("h3");
    questionText.textContent = currentQuestion.question;
    questionContainer.appendChild(questionText);

    currentQuestion.answers.forEach((answer, index) => {
      let answerOption = document.createElement("li");
      answerOption.textContent = answer;
      answerOption.className = "answer-option";
      answerOption.addEventListener("click", function () {
        if (userAnswers[currentQuestionIndex] === null) {
          userAnswers[currentQuestionIndex] = index;
          highlightSelection(index);
        }
      });
      answersListEl.appendChild(answerOption);
    });
  }

  // Highlight the selected answer option
  function highlightSelection(selectedIndex) {
    const allOptions = document.querySelectorAll(".answer-option");
    allOptions.forEach((option, idx) => {
      option.style.backgroundColor = idx === selectedIndex ? "#d4edda" : "";
      option.style.pointerEvents = "none"; // Prevent further changes
    });
  }

  // Update progress indicator
  function updateProgress() {
    progressIndicator.textContent = `Question ${
      currentQuestionIndex + 1
    } of ${quizQuestions.length}`;
  }

  // Handle "Next" button click
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

  // Reset quiz
  resetBtn.addEventListener("click", function () {
    if (confirm("Are you sure you want to reset the quiz?")) {
      currentQuestionIndex = 0;
      userAnswers = [];
      quizSetupDiv.style.display = "block";
      questionContainer.innerHTML = "";
      answersListEl.innerHTML = "";
      progressIndicator.textContent = "";
      nextBtn.style.display = "inline-block";
    }
  });

  // Show quiz summary
  function showSummary() {
    questionContainer.innerHTML = "";
    answersListEl.innerHTML = "";
    progressIndicator.textContent = "";
    nextBtn.style.display = "none";

    let correctAnswers = 0;
    let summaryHTML = "<h3>Quiz Summary</h3>";

    quizQuestions.forEach((q, index) => {
      let isCorrect = userAnswers[index] === q.correct;
      if (isCorrect) correctAnswers++;

      summaryHTML += `
        <div style="margin-bottom: 10px;">
          <p><strong>Question ${index + 1}:</strong> ${q.question}</p>
          <p><strong>Your Answer:</strong> ${
            q.answers[userAnswers[index]] || "No answer selected"
          }</p>
          <p><strong>Correct Answer:</strong> ${q.answers[q.correct]}</p>
          <p><strong>Explanation:</strong> ${q.explanation}</p>
        </div>
      `;
    });

    summaryHTML += `<h4>Your Score: ${correctAnswers} / ${quizQuestions.length}</h4>`;
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
