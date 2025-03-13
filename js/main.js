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
  // Insert the quiz setup at the top of the quiz container
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

  // Set up event listener for the Start Quiz button
  startBtn.addEventListener("click", startQuiz);

  // Load quiz questions from the JSON file
  fetch("data/questions.json")
    .then((response) => response.json())
    .then((data) => {
      questions = data.questions;
      // (Optionally, you may shuffle the questions here.)
    })
    .catch((error) => {
      console.error("Error loading questions:", error);
      questionContainer.innerHTML =
        "Failed to load questions. Please try again later.";
    });

  // Function to start the quiz
  function startQuiz() {
    quizLength = parseInt(quizLengthInput.value);
    if (isNaN(quizLength) || quizLength < 1 || quizLength > 15) {
      alert("Please enter a valid number between 1 and 15.");
      return;
    }
    // For simplicity, take the first quizLength questions. (You could randomize if desired.)
    quizQuestions = questions.slice(0, quizLength);
    userAnswers = new Array(quizQuestions.length).fill(null);
    currentQuestionIndex = 0;

    // Hide the quiz setup panel when the quiz starts
    quizSetupDiv.style.display = "none";

    // Display the first question and update the progress indicator
    showQuestion();
    updateProgress();
  }

  // Display the current question and its answer options
  function showQuestion() {
    if (currentQuestionIndex >= quizQuestions.length) {
      showSummary();
      return;
    }
    // Clear existing question and answer content
    questionContainer.innerHTML = "";
    answersListEl.innerHTML = "";

    let currentQuestion = quizQuestions[currentQuestionIndex];

    // Create and append the question element (Heading 3)
    let questionElem = document.createElement("h3");
    questionElem.textContent = currentQuestion.question;
    questionContainer.appendChild(questionElem);

    // Render answer choices as list items
    currentQuestion.answers.forEach((answer, index) => {
      let li = document.createElement("li");
      li.textContent = answer;
      li.style.cursor = "pointer";
      // When an answer is clicked...
      li.addEventListener("click", function () {
        // Only record an answer if none has been recorded yet
        if (userAnswers[currentQuestionIndex] === null) {
          userAnswers[currentQuestionIndex] = index;
          // Highlight the selected answer (for visual confirmation)
          li.classList.add("selected");
          // Disable further answer changes
          disableAnswerSelection();
        }
      });
      answersListEl.appendChild(li);
    });
  }

  // Disable clicking on answers once one is selected
  function disableAnswerSelection() {
    let items = answersListEl.getElementsByTagName("li");
    for (let item of items) {
      item.style.pointerEvents = "none";
      // Optionally, you can change the background color of non-selected items here.
    }
  }

  // Update the progress indicator (e.g., "Question 2 of 10. X remaining")
  function updateProgress() {
    let remaining = quizQuestions.length - currentQuestionIndex;
    progressIndicator.textContent = `Question ${
      currentQuestionIndex + 1
    } of ${quizQuestions.length}. ${remaining} question(s) remaining.`;
  }

  // Event listener for the Next button: move to the next question or summary
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

  // Reset quiz button to start over
  resetBtn.addEventListener("click", function () {
    if (confirm("Reset your quiz progress?")) {
      // Show the quiz setup panel and reset everything
      quizSetupDiv.style.display = "block";
      questionContainer.innerHTML = "";
      answersListEl.innerHTML = "";
      progressIndicator.textContent = "";
      nextBtn.style.display = "inline-block";
      // Clear advanced variables
      currentQuestionIndex = 0;
      userAnswers = [];
    }
  });

  // Display the final summary after the quiz is completed
  function showSummary() {
    // Clear the quiz area
    questionContainer.innerHTML = "";
    answersListEl.innerHTML = "";
    progressIndicator.textContent = "";
    nextBtn.style.display = "none";

    // Calculate the number of correct answers
    let correctCount = 0;
    let summaryHTML = "<h3>Quiz Summary</h3>";
    summaryHTML += `<p>Total Questions: ${quizQuestions.length}</p>`;

    // For each question, list the question, the student's answer, the correct answer, and the explanation.
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

    // Update the quiz container with the summary
    quizContainer.innerHTML = summaryHTML;

    // Add a restart button at the end of the summary
    let restartBtn = document.createElement("button");
    restartBtn.textContent = "Restart Quiz";
    restartBtn.classList.add("btn");
    restartBtn.addEventListener("click", function () {
      // Reset quiz variables and restore initial quiz setup view
      currentQuestionIndex = 0;
      userAnswers = [];

      // Clear quiz container and reinsert the quiz setup components
      quizContainer.innerHTML = "";
      quizContainer.appendChild(quizSetupDiv);
      // Create new placeholders for question container, answers list, and progress indicator
      let newQuestionContainer = document.createElement("div");
      newQuestionContainer.id = "question-container";
      quizContainer.appendChild(newQuestionContainer);
      let newAnswersList = document.createElement("ul");
      newAnswersList.id = "answers-list";
      quizContainer.appendChild(newAnswersList);
      quizContainer.appendChild(progressIndicator);
      nextBtn.style.display = "inline-block";

      // Show the quiz setup panel for fresh selection
      quizSetupDiv.style.display = "block";
    });
    // Append restart button to the quiz container
    quizContainer.appendChild(restartBtn);
  }
});
