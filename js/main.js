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
      // (Optional: shuffle questions here if desired)
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
    // For simplicity, take the first quizLength questions.
    quizQuestions = questions.slice(0, quizLength);
    // Set up userAnswers array (one null value per question)
    userAnswers = new Array(quizQuestions.length).fill(null);
    currentQuestionIndex = 0;

    // Hide the quiz setup panel after starting the quiz
    quizSetupDiv.style.display = "none";

    // Display the first question and update progress
    showQuestion();
    updateProgress();
  });

  // Function to display the current question and its answer options
  function showQuestion() {
    // If we've gone through all questions, show summary
    if (currentQuestionIndex >= quizQuestions.length) {
      showSummary();
      return;
    }
    // Clear existing question and answer content
    questionContainer.innerHTML = "";
    answersListEl.innerHTML = "";

    let currentQuestion = quizQuestions[currentQuestionIndex];

    // Create and append the question element
    let questionElem = document.createElement("h3");
    questionElem.textContent = currentQuestion.question;
    questionContainer.appendChild(questionElem);

    // Loop over answer choices and create clickable list items
    currentQuestion.answers.forEach((answer, index) => {
      let answerOption = document.createElement("li");
      answerOption.textContent = answer;
      answerOption.className = "answer-option";
      // When an answer is clicked, record the answer and highlight it
      answerOption.addEventListener("click", function () {
        // Record answer only if not already answered
        if (userAnswers[currentQuestionIndex] === null) {
          userAnswers[currentQuestionIndex] = index;
          highlightSelection(index);
        }
      });
      answersListEl.appendChild(answerOption);
    });
  }

  // Function to highlight the selected answer option and disable further changes
  function highlightSelection(selectedIndex) {
    const allOptions = document.querySelectorAll(".answer-option");
    allOptions.forEach((option, idx) => {
      if (idx === selectedIndex) {
        option.style.backgroundColor = "#d4edda"; // light green to indicate selection
      }
      // Disable clicking on all options once an answer is selected
      option.style.pointerEvents = "none";
    });
  }

  // Update the progress indicator (e.g., "Question 1 of 10")
  function updateProgress() {
    progressIndicator.textContent = `Question ${currentQuestionIndex + 1} of ${quizQuestions.length}`;
  }

  // "Next Question" button event: validate answer selection, move to next question or show summary if done
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

  // "Reset Progress" button: Allow the student to restart the quiz
  resetBtn.addEventListener("click", function () {
    if (confirm("Reset your quiz progress?")) {
      // Restore the quiz setup panel and clear current data
      quizSetupDiv.style.display = "block";
      questionContainer.innerHTML = "";
      answersListEl.innerHTML = "";
      progressIndicator.textContent = "";
      nextBtn.style.display = "inline-block";
      // Reset advanced quiz variables
      currentQuestionIndex = 0;
      userAnswers = [];
    }
  });

  // Display the final summary after all questions are answered
  function showSummary() {
    // Clear the quiz area
    questionContainer.innerHTML = "";
    answersListEl.innerHTML = "";
    progressIndicator.textContent = "";
    nextBtn.style.display = "none";

    // Compute overall score and generate summary details
    let correctCount = 0;
    let summaryHTML = "<h3>Quiz Summary</h3>";
    summaryHTML += `<p>Total Questions: ${quizQuestions.length}</p>`;

    // Loop through each question and display details
    quizQuestions.forEach((q, idx) => {
      let correctAnsIndex = q.correct;
      let userAnsIndex = userAnswers[idx];
      let isCorrect = userAnsIndex === correctAnsIndex;
      if (isCorrect) correctCount++;

      summaryHTML += `<div style="margin-bottom: 15px; border-bottom: 1px solid #ccc; padding-bottom: 10px;">`;
      summaryHTML += `<p><strong>Question ${idx + 1}:</strong> ${q.question}</p>`;
      summaryHTML += `<p><strong>Your Answer:</strong> ${typeof userAnsIndex === "number" ? q.answers[userAnsIndex] : "No answer selected"}</p>`;
      summaryHTML += `<p><strong>Correct Answer:</strong> ${q.answers[correctAnsIndex]}</p>`;
      summaryHTML += `<p><strong>Explanation:</strong> ${q.explanation}</p>`;
      summaryHTML += `</div>`;
    });

    summaryHTML += `<h4>Your Score: ${correctCount} out of ${quizQuestions.length}</h4>`;

    // Display the generated summary HTML
    questionContainer.innerHTML = summaryHTML;

    // Create and append a restart button so that the student can try the quiz again
    let restartBtn = document.createElement("button");
    restartBtn.textContent = "Restart Quiz";
    restartBtn.classList.add("btn");
    restartBtn.addEventListener("click", function () {
      // Reset quiz variables and restore the initial quiz setup view
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
