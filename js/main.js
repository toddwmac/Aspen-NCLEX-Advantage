document.addEventListener("DOMContentLoaded", function () {
    const questionTextEl = document.getElementById("question-text");
    const answersListEl = document.getElementById("answers-list");
    const feedbackEl = document.getElementById("feedback");
    const nextBtn = document.getElementById("next-btn");
    const resetBtn = document.getElementById("reset-btn");
    const questionsAnsweredEl = document.getElementById("questions-answered");
    const correctAnswersEl = document.getElementById("correct-answers");
  
    let questions = [];
    let currentQuestionIndex = 0;
    let score = 0;
    let answeredQuestions = 0;
  
    // Load progress from localStorage if available
    function loadProgress() {
      const progress = JSON.parse(localStorage.getItem("quizProgress"));
      if (progress) {
        currentQuestionIndex = progress.currentQuestionIndex;
        score = progress.score;
        answeredQuestions = progress.answeredQuestions;
        updateProgressDisplay();
      }
    }
  
    // Save progress to localStorage
    function saveProgress() {
      const progress = {
        currentQuestionIndex,
        score,
        answeredQuestions,
      };
      localStorage.setItem("quizProgress", JSON.stringify(progress));
    }
  
    function updateProgressDisplay() {
      questionsAnsweredEl.textContent = answeredQuestions;
      correctAnswersEl.textContent = score;
    }
  
    // Fetch quiz questions from the local JSON file
    fetch("data/questions.json")
      .then((response) => response.json())
      .then((data) => {
        questions = data.questions;
        loadProgress();
        showQuestion();
      })
      .catch((error) => {
        console.error("Error loading questions:", error);
        questionTextEl.textContent =
          "Failed to load questions. Please try again later.";
      });
  
    // Display the current question and its answer options
    function showQuestion() {
      if (currentQuestionIndex >= questions.length) {
        questionTextEl.textContent = "Quiz Completed! Great work!";
        answersListEl.innerHTML = "";
        feedbackEl.textContent = "";
        nextBtn.style.display = "none";
        return;
      } else {
        nextBtn.style.display = "inline-block";
      }
      const currentQuestion = questions[currentQuestionIndex];
      questionTextEl.textContent = currentQuestion.question;
      answersListEl.innerHTML = "";
      feedbackEl.textContent = "";
  
      currentQuestion.answers.forEach((answer, index) => {
        const li = document.createElement("li");
        li.textContent = answer;
        li.addEventListener("click", () => selectAnswer(index));
        answersListEl.appendChild(li);
      });
    }
  
    // Handle answer selection and provide immediate feedback
    function selectAnswer(selectedIndex) {
      const currentQuestion = questions[currentQuestionIndex];
      if (selectedIndex === currentQuestion.correct) {
        feedbackEl.textContent = "Correct! " + currentQuestion.explanation;
        score++;
      } else {
        feedbackEl.textContent = "Incorrect. " + currentQuestion.explanation;
      }
      // Disable clicking on answers after a selection is made
      Array.from(answersListEl.children).forEach((li) => {
        li.style.pointerEvents = "none";
      });
      answeredQuestions++;
      updateProgressDisplay();
      saveProgress();
    }
  
    nextBtn.addEventListener("click", () => {
      currentQuestionIndex++;
      showQuestion();
      // Re-enable clicks for new question answer items (if re-rendered)
      Array.from(answersListEl.children).forEach((li) => {
        li.style.pointerEvents = "auto";
      });
    });
  
    resetBtn.addEventListener("click", () => {
      if (confirm("Reset your progress?")) {
        currentQuestionIndex = 0;
        score = 0;
        answeredQuestions = 0;
        saveProgress();
        updateProgressDisplay();
        showQuestion();
      }
    });
  });
  