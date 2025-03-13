document.addEventListener("DOMContentLoaded", function () {
  // Global Variables
  let questions = [];
  let quizQuestions = [];
  let currentQuestionIndex = 0;
  let userAnswers = [];
  let quizLength = 0; // Number of questions the user will answer

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

  // Create a progress indicator element and append it to the quiz container
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

  // Start Quiz button event
  startBtn.addEventListener("click", function () {
    quizLength = parseInt(quizLengthInput.value);
    if (isNaN(quizLength) || quizLength < 1 || quizLength > 15) {
      alert("Please select a valid number between 1 and 15.");
      return;
    }
    // For simplicity, select the first N questions.
    quizQuestions = questions.slice(0, quizLength);
    userAnswers = new Array(quizQuestions.length).fill(null);
    currentQuestionIndex = 0;

    // Hide the quiz setup panel
    quizSetupDiv.style.display = "none";

    // Display the first question and update progress
    showQuestion();
    updateProgress();
  });

  // Display the current question and answer options
  function showQuestion() {
    if (currentQuestionIndex >= quizQuestions.length) {
      showSummary();
      return;
    }
    // Clear any existing content
    questionContainer.innerHTML = "";
    answersListEl.innerHTML = "";

    let currentQuestion = quizQuestions[currentQuestionIndex];

    // Create and append the question element
    let questionElem = document.createElement("h3");
    questionElem.textContent = currentQuestion.question;
    questionContainer.appendChild(questionElem);

    // Create clickable answer options
    currentQuestion.answers.forEach((answer, index) => {
      let answerOption = document.createElement("li");
      answerOption.textContent = answer;
      answerOption.className = "answer-option";
      // Inline styles for clarity (can be overridden by CSS)
      answerOption.style.display = "block";
      answerOption.style.margin = "8px 0";
      answerOption.style.padding = "10px";
      answerOption.style.border = "1px solid #ccc";
      answerOption.style.borderRadius = "3px";
      answerOption.style.backgroundColor = "#e9ecef";
      answerOption.style.cursor = "pointer";

      answerOption.addEventListener("click", function () {
        // Only record an answer if one hasn't been selected yet
        if (userAnswers[currentQuestionIndex] === null) {
          userAnswers[currentQuestionIndex] = index;
          highlightSelection(index);
        }
      });
      answersListEl.appendChild(answerOption);
    });
  }

  // Highlight the selected answer option and disable further changes
  function highlightSelection(selectedIndex) {
    const allOptions = answersListEl.getElementsByTagName("li");
    for (let i = 0; i < allOptions.length; i++) {
      if (i === selectedIndex) {
        allOptions[i].style.backgroundColor = "#d4edda"; // Light green indicates selection
      }
      // Disable further clicking on all options
      allOptions[i].style.pointerEvents = "none";
    }
  }

  // Update the progress indicator text
  function updateProgress() {
    progressIndicator.textContent = `Question ${currentQuestionIndex + 1} of ${quizQuestions.length}`;
  }

  // Next button click: ensure an answer is selected, then move to the next question
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

  // Reset button click: allow the student to restart the quiz
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

  // Display the final summary with the overall score at the top and color-coded results
  function showSummary() {
    // Clear the quiz area
    questionContainer.innerHTML = "";
    answersListEl.innerHTML = "";
    progressIndicator.textContent = "";
    nextBtn.style.display = "none";

    // Calculate the overall score
    let correctCount = 0;
    quizQuestions.forEach((q, idx) => {
      if (userAnswers[idx] === q.correct) {
        correctCount++;
      }
    });

    // Build the summary HTML with the overall score at the beginning
    let summaryHTML = `<h3>Quiz Summary</h3>`;
    summaryHTML += `<h4>Your Score: ${correctCount} out of ${quizQuestions.length}</h4>`;
    summaryHTML += `<p>Total Questions: ${quizQuestions.length}</p>`;

    // For each question, show the question with color coding indicating correctness
    quizQuestions.forEach((q, idx) => {
      const userAnsIndex = userAnswers[idx];
      const isCorrect = userAnsIndex === q.correct;
      // Color-code the answer: green if correct, red if incorrect.
      let yourAnswerColor = isCorrect ? "green" : "red";

      summaryHTML += `<div style="margin-bottom: 15px; border-bottom: 1px solid #ccc; padding-bottom: 10px;">`;
      summaryHTML += `<p><strong>Question ${idx + 1}:</strong> ${q.question}</p>`;
      summaryHTML += `<p><strong>Your Answer:</strong> <span style="color: ${yourAnswerColor};">` +
                     (typeof userAnsIndex === "number" ? q.answers[userAnsIndex] : "No answer selected") +
                     `</span></p>`;
      summaryHTML += `<p><strong>Correct Answer:</strong> ${q.answers[q.correct]}</p>`;
      summaryHTML += `<p><strong>Explanation:</strong> ${q.explanation}</p>`;
      summaryHTML += `</div>`;
    });

    // Replace the quiz area with the summary
    questionContainer.innerHTML = summaryHTML;

    // Add a restart button to allow re-taking the quiz
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
