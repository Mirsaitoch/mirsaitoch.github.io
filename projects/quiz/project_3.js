let currentQuestionIndex = 0;
let correctAnswersCount = 0;
let isAnsweringAllowed = false;
const nextQuestionBtn = document.getElementById('nextQuestionBtn');
const questionContainer = document.getElementById('questionContainer');
const statisticDiv = document.getElementById('statistic');

const questions = [
    {
    question: "А голос у него был не такой, как у почтальона Печкина, дохленький. У Гаврюши голосище был, как у электрички. Он _____ _____ на ноги поднимал.",
    answers: ["Пол деревни, за раз", "Полдеревни, зараз", "Пол-деревни, за раз"],
    correct: 1,
    explanation: "Правильный ответ: полдеревни пишется слитно. Зараз (ударение на второй слог) — это обстоятельственное наречие, пишется слитно. Означает быстро, одним махом."
  },
  {
    question: "А эти слова как пишутся?",
    answers: ["Капуччино и эспрессо", "Каппуччино и экспресо", "Капучино и эспрессо"],
    correct: 2,
    explanation: "Конечно! По орфографическим нормам русского языка единственно верным написанием будут «капучино» и «эспрессо»."
  },
  {
    question: "Как нужно писать?",
    answers: ["Черезчур", "Черес-чур", "Чересчур"],
    correct: 2,
    explanation: "Да! Это слово появилось от соединения предлога «через» и древнего слова «чур», которое означает «граница», «край». Но слово претерпело изменения, так что правильное написание учим наизусть — «чересчур»."
  },
  {
    question: "Где допущена ошибка?",
    answers: ["Аккордеон", "Белиберда", "Эпелепсия"],
    correct: 2,
    explanation: "Верно! Это слово пишется так: «эпИлепсия»."
  }
  ];


nextQuestionBtn.addEventListener('click', () => {
  if (currentQuestionIndex < questions.length && !isAnsweringAllowed)  {
    loadQuestion();
  } if (currentQuestionIndex >= questions.length) {
    showStatistics();
  }
});

function loadQuestion() {
  if (currentQuestionIndex >= questions.length) return;

  const questionData = questions[currentQuestionIndex];
  const questionBlock = document.createElement('div');
  questionBlock.classList.add('question-block');
  questionBlock.dataset.index = currentQuestionIndex;

  const questionTitle = document.createElement('h3');
  questionTitle.textContent = `${currentQuestionIndex + 1}. ${questionData.question}`;
  questionBlock.appendChild(questionTitle);

  questionData.answers.forEach((answer, index) => {
    const answerBlock = document.createElement('div');
    answerBlock.classList.add('answer');
    answerBlock.textContent = answer;

    answerBlock.addEventListener('click', () => checkAnswer(index, questionBlock, answerBlock));
    questionBlock.appendChild(answerBlock);
  });

  questionContainer.appendChild(questionBlock);

  setTimeout(() => {
    questionBlock.classList.add('visible');
  }, 100);

  isAnsweringAllowed = true;
}

function checkAnswer(selectedIndex, questionBlock, selectedAnswerBlock) {
  if (!isAnsweringAllowed) return;

  isAnsweringAllowed = false;

  const correctIndex = questions[currentQuestionIndex].correct;
  const allAnswerBlocks = questionBlock.querySelectorAll('.answer');

  if (selectedIndex === correctIndex) {
    questionBlock.style.backgroundColor = '#c8e6c9';
    correctAnswersCount++;
  } else {
    questionBlock.style.backgroundColor = '#ffcdd2';
  }

  allAnswerBlocks.forEach((block, index) => {
    if (index !== selectedIndex || index !== correctIndex) {
      setTimeout(() => {
        block.classList.add('slide-down');
      }, index * 200);
    }
  });
  currentQuestionIndex++;
  if (currentQuestionIndex >= questions.length) {
    showStatistics();
  }
}

function showStatistics() {
  statisticDiv.classList.remove('hidden');
  statisticDiv.textContent = `Тест окончен. Правильных ответов: ${correctAnswersCount} из ${questions.length}.`;

  document.querySelectorAll('.question-block').forEach(block => {
    block.addEventListener('click', () => {
      const index = block.dataset.index;
      const explanationBlock = document.createElement('div');
      explanationBlock.classList.add('correct-answer-block');
      explanationBlock.textContent = questions[index].answers[questions[index].correct];

      document.querySelectorAll('.correct-answer-block').forEach(el => el.remove());

      block.appendChild(explanationBlock);
      explanationBlock.style.display = 'block';
    });
  });
}
