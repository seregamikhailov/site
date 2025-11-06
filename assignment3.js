// Массив вопросов с ответами
const questionsData = [
    {
        question: "А голос у него был не такой, как у почтальона Печкина, дохленький. У Гаврюши голосище был, как у электрички. Он _____ _____ на ноги поднимал.",
        answers: [
            { text: "Пол деревни, за раз", correct: false },
            { text: "Полдеревни, зараз", correct: true, explanation: "Правильно! Раздельно существительное будет писаться в случае наличия дополнительного слова между существительным и частицей. Правильный ответ: полдеревни пишется слитно. Зараз (ударение на второй слог) — это обстоятельственное наречие, пишется слитно. Означает быстро, одним махом." },
            { text: "Пол-деревни, за раз", correct: false }
        ]
    },
    {
        question: "А эти слова как пишутся?",
        answers: [
            { text: "Капуччино и эспрессо", correct: false },
            { text: "Каппуччино и экспресо", correct: false },
            { text: "Капучино и эспрессо", correct: true, explanation: "Конечно! По орфографическим нормам русского языка единственно верным написанием будут «капучино» и «эспрессо»." }
        ]
    },
    {
        question: "Как нужно писать?",
        answers: [
            { text: "Черезчур", correct: false },
            { text: "Черес-чур", correct: false },
            { text: "Чересчур", correct: true, explanation: "Да! Это слово появилось от соединения предлога «через» и древнего слова «чур», которое означает «граница», «край». Но слово претерпело изменения, так что правильное написание учим наизусть — «чересчур»." }
        ]
    },
    {
        question: "Где допущена ошибка?",
        answers: [
            { text: "Аккордеон", correct: false },
            { text: "Белиберда", correct: false },
            { text: "Эпелепсия", correct: true, explanation: "Верно! Это слово пишется так: «эпИлепсия»." }
        ]
    }
];

let currentQuestions = [];
let currentQuestionIndex = 0;
let isAnswering = false;
let answeredQuestions = [];
let correctAnswers = 0;
let allQuestionsAnswered = false;

// Функция перемешивания массива (Fisher-Yates)
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Инициализация викторины
function initQuiz() {
    // Перемешиваем вопросы
    currentQuestions = shuffleArray(questionsData.map((q, index) => ({ 
        ...q, 
        originalIndex: index,
        answered: undefined,
        correct: undefined,
        selectedAnswerIndex: undefined,
        showingCorrect: false
    })));
    
    // Для каждого вопроса перемешиваем ответы
    currentQuestions = currentQuestions.map(q => ({
        ...q,
        answers: shuffleArray(q.answers)
    }));
    
    currentQuestionIndex = 0;
    isAnswering = false;
    answeredQuestions = [];
    correctAnswers = 0;
    allQuestionsAnswered = false;
    
    renderCurrentQuestion();
}

// Отображение текущего вопроса
function renderCurrentQuestion() {
    const questionsArea = document.getElementById('questions-area');
    const endMessage = document.getElementById('end-message');
    const statistics = document.getElementById('statistics');
    
    questionsArea.innerHTML = '';
    endMessage.classList.add('hidden');
    statistics.classList.add('hidden');
    
    if (currentQuestionIndex >= currentQuestions.length) {
        endMessage.classList.remove('hidden');
        showStatistics();
        allQuestionsAnswered = true;
        renderAllQuestionsForReview();
        return;
    }
    
    const question = currentQuestions[currentQuestionIndex];
    const questionBlock = createQuestionBlock(question, currentQuestionIndex + 1, false);
    questionBlock.classList.add('current-question');
    questionsArea.appendChild(questionBlock);
}

// Создание блока вопроса
function createQuestionBlock(question, number, isReview = false) {
    const questionDiv = document.createElement('div');
    questionDiv.className = 'question-block';
    questionDiv.dataset.questionIndex = question.originalIndex;
    
    const questionHeader = document.createElement('div');
    questionHeader.className = 'question-header';
    
    const questionNumber = document.createElement('div');
    questionNumber.className = 'question-number';
    questionNumber.textContent = number;
    
    const questionText = document.createElement('div');
    questionText.className = 'question-text';
    questionText.textContent = question.question;
    
    const marker = document.createElement('div');
    marker.className = 'question-marker';
    if (isReview && question.answered !== undefined) {
        // В режиме просмотра показываем маркер для отвеченных вопросов
        marker.innerHTML = question.correct ? '✓' : '✗';
        marker.classList.add(question.correct ? 'correct' : 'incorrect', 'show');
    } else if (!isReview && question.answered !== undefined) {
        // В обычном режиме показываем маркер после ответа
        marker.innerHTML = question.correct ? '✓' : '✗';
        marker.classList.add(question.correct ? 'correct' : 'incorrect', 'show');
    }
    
    questionHeader.appendChild(questionNumber);
    questionHeader.appendChild(questionText);
    questionHeader.appendChild(marker);
    
    const answersContainer = document.createElement('div');
    answersContainer.className = 'answers-container';
    
    if (!isReview) {
        // В обычном режиме показываем все ответы
        question.answers.forEach((answer, index) => {
            const answerBlock = createAnswerBlock(answer, index, question, isReview);
            answersContainer.appendChild(answerBlock);
        });
    }
    // В режиме просмотра ответы не показываем изначально - они появятся по клику
    
    questionDiv.appendChild(questionHeader);
    questionDiv.appendChild(answersContainer);
    
    // Для режима просмотра после завершения - все вопросы кликабельны
    if (isReview) {
        questionDiv.style.cursor = 'pointer';
        questionDiv.addEventListener('click', (e) => {
            // Не обрабатываем клики на ответы и их элементы
            // Кликаем только на заголовок вопроса или область вопроса
            const clickedElement = e.target;
            if (clickedElement.classList.contains('answer-block') || 
                clickedElement.classList.contains('explanation') ||
                clickedElement.closest('.answer-block') ||
                clickedElement.closest('.answers-container')) {
                return;
            }
            showCorrectAnswerForReview(questionDiv, question);
        });
    }
    
    return questionDiv;
}

// Создание блока ответа
function createAnswerBlock(answer, index, question, isReview = false) {
    const answerDiv = document.createElement('div');
    answerDiv.className = 'answer-block';
    answerDiv.textContent = answer.text;
    answerDiv.dataset.answerIndex = index;
    
    // В режиме просмотра блоки ответов не кликабельны
    if (!isReview && !isAnswering) {
        answerDiv.addEventListener('click', () => selectAnswer(answer, index, question));
    }
    
    return answerDiv;
}

// Выбор ответа
function selectAnswer(answer, answerIndex, question) {
    if (isAnswering) return;
    
    isAnswering = true;
    
    const questionBlock = document.querySelector('.current-question');
    const answerBlocks = questionBlock.querySelectorAll('.answer-block');
    const selectedBlock = answerBlocks[answerIndex];
    
    // Помечаем выбранный ответ
    selectedBlock.classList.add('selected');
    
    // Сохраняем информацию об ответе
    question.selectedAnswerIndex = answerIndex;
    question.answered = true;
    question.correct = answer.correct;
    
    setTimeout(() => {
        if (answer.correct) {
            handleCorrectAnswer(questionBlock, answerBlocks, answerIndex, answer);
            correctAnswers++;
        } else {
            handleIncorrectAnswer(questionBlock, answerBlocks);
        }
    }, 500);
}

// Обработка правильного ответа
function handleCorrectAnswer(questionBlock, answerBlocks, correctIndex, correctAnswer) {
    const correctBlock = answerBlocks[correctIndex];
    const marker = questionBlock.querySelector('.question-marker');
    
    // Увеличиваем правильный блок и показываем пояснение
    correctBlock.classList.add('correct-answer');
    
    if (correctAnswer.explanation) {
        const explanation = document.createElement('div');
        explanation.className = 'explanation show';
        explanation.textContent = correctAnswer.explanation;
        correctBlock.appendChild(explanation);
    }
    
    // Перемещаем неправильные ответы вниз
    answerBlocks.forEach((block, index) => {
        if (index !== correctIndex) {
            block.classList.add('slide-down');
        }
    });
    
    // Через пару секунд (2000мс) после начала анимации показываем маркер
    setTimeout(() => {
        // Показываем маркер правильного ответа ПОСЛЕ того как блоки уехали
        marker.classList.add('correct', 'show');
        marker.innerHTML = '✓';
        
        // Прячем неправильные ответы
        answerBlocks.forEach((block, index) => {
            if (index !== correctIndex) {
                block.style.display = 'none';
            }
        });
        
        // Убираем правильный ответ
        setTimeout(() => {
            correctBlock.style.opacity = '0';
            correctBlock.style.transform = 'scale(0.8)';
            setTimeout(() => {
                moveToNextQuestion();
            }, 300);
        }, 1500);
    }, 2000);
}

// Обработка неправильного ответа
function handleIncorrectAnswer(questionBlock, answerBlocks) {
    const marker = questionBlock.querySelector('.question-marker');
    
    // Перемещаем все блоки вниз
    answerBlocks.forEach(block => {
        block.classList.add('slide-down');
    });
    
    // Через пару секунд (2000мс) после начала анимации показываем маркер
    setTimeout(() => {
        // Показываем маркер неправильного ответа ПОСЛЕ того как блоки уехали
        marker.classList.add('incorrect', 'show');
        marker.innerHTML = '✗';
        
        // Добавляем сообщение "Ответ неверный"
        const incorrectMessage = document.createElement('div');
        incorrectMessage.className = 'incorrect-message show';
        incorrectMessage.textContent = 'Ответ неверный';
        
        // Вставляем сообщение после заголовка вопроса
        const questionHeader = questionBlock.querySelector('.question-header');
        questionHeader.insertAdjacentElement('afterend', incorrectMessage);
        
        // Переходим к следующему вопросу
        setTimeout(() => {
            moveToNextQuestion();
        }, 1500);
    }, 2000);
}

// Переход к следующему вопросу
function moveToNextQuestion() {
    answeredQuestions.push(currentQuestions[currentQuestionIndex]);
    currentQuestionIndex++;
    isAnswering = false;
    renderCurrentQuestion();
}

// Отображение статистики
function showStatistics() {
    const statistics = document.getElementById('statistics');
    const correctCount = document.getElementById('correct-count');
    const totalCount = document.getElementById('total-count');
    const restartBtn = document.getElementById('restart-btn');
    
    correctCount.textContent = correctAnswers;
    totalCount.textContent = currentQuestions.length;
    statistics.classList.remove('hidden');
    restartBtn.classList.remove('hidden');
    
    // Обработчик кнопки перезапуска (удаляем старый обработчик, если есть)
    restartBtn.onclick = null;
    restartBtn.onclick = function() {
        // Сбрасываем все состояния
        currentQuestionIndex = 0;
        isAnswering = false;
        answeredQuestions = [];
        correctAnswers = 0;
        allQuestionsAnswered = false;
        
        // Очищаем интерфейс
        document.getElementById('questions-area').innerHTML = '';
        statistics.classList.add('hidden');
        restartBtn.classList.add('hidden');
        document.getElementById('end-message').classList.add('hidden');
        
        // Инициализируем викторину заново
        initQuiz();
    };
}

    // Отображение всех вопросов для просмотра после завершения
function renderAllQuestionsForReview() {
    const questionsArea = document.getElementById('questions-area');
    questionsArea.innerHTML = '';
    
    // Сортируем вопросы по оригинальному индексу для отображения
    const sortedQuestions = [...currentQuestions].sort((a, b) => a.originalIndex - b.originalIndex);
    
    sortedQuestions.forEach((question, index) => {
        const questionBlock = createQuestionBlock(question, index + 1, true);
        questionsArea.appendChild(questionBlock);
    });
}

// Показать правильный ответ при клике на вопрос (после завершения)
function showCorrectAnswerForReview(questionBlock, question) {
    const answersContainer = questionBlock.querySelector('.answers-container');
    
    // Если правильный ответ уже показан, скрываем его
    if (answersContainer.children.length > 0 && 
        Array.from(answersContainer.children).some(child => child.classList.contains('correct-answer'))) {
        answersContainer.innerHTML = '';
        return;
    }
    
    // Скрываем правильные ответы у других вопросов
    document.querySelectorAll('.question-block').forEach(block => {
        if (block !== questionBlock) {
            const otherAnswersContainer = block.querySelector('.answers-container');
            if (otherAnswersContainer) {
                otherAnswersContainer.innerHTML = '';
            }
        }
    });
    
    answersContainer.innerHTML = '';
    
    const correctAnswer = question.answers.find(a => a.correct);
    
    const correctBlock = document.createElement('div');
    correctBlock.className = 'answer-block correct-answer';
    correctBlock.textContent = correctAnswer.text;
    
    if (correctAnswer.explanation) {
        const explanation = document.createElement('div');
        explanation.className = 'explanation show';
        explanation.textContent = correctAnswer.explanation;
        correctBlock.appendChild(explanation);
    }
    
    answersContainer.appendChild(correctBlock);
    
    // Маркер уже показывает результат ответа пользователя, не меняем его
    // Показываем маркер, если он еще не показан
    const marker = questionBlock.querySelector('.question-marker');
    if (!marker.classList.contains('show')) {
        if (question.answered !== undefined) {
            marker.innerHTML = question.correct ? '✓' : '✗';
            marker.classList.add(question.correct ? 'correct' : 'incorrect', 'show');
        } else {
            // Если вопрос не был отвечен, показываем зеленый маркер (правильный ответ)
            marker.innerHTML = '✓';
            marker.classList.add('correct', 'show');
        }
    }
    
    // Также обновляем статус вопроса
    question.showingCorrect = true;
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', initQuiz);

