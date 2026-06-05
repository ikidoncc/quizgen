const mainContent = document.getElementById('main-content');
const tabCreate = document.getElementById('tab-create');
const tabPlay = document.getElementById('tab-play');

let currentTab = 'create';
let quizData = [];
let currentQuestionIndex = 0;
let score = 0;

function init() {
    renderCreateTab();
    
    tabCreate.addEventListener('click', () => switchTab('create'));
    tabPlay.addEventListener('click', () => switchTab('play'));
}

function switchTab(tab) {
    currentTab = tab;
    
    // Update tab buttons styling
    if (tab === 'create') {
        tabCreate.classList.add('text-blue-600', 'border-b-2', 'border-blue-600');
        tabCreate.classList.remove('text-gray-500');
        tabPlay.classList.add('text-gray-500');
        tabPlay.classList.remove('text-blue-600', 'border-b-2', 'border-blue-600');
        renderCreateTab();
    } else {
        tabPlay.classList.add('text-blue-600', 'border-b-2', 'border-blue-600');
        tabPlay.classList.remove('text-gray-500');
        tabCreate.classList.add('text-gray-500');
        tabCreate.classList.remove('text-blue-600', 'border-b-2', 'border-blue-600');
        renderPlayTab();
    }
}

function renderCreateTab() {
    mainContent.innerHTML = `
        <div class="bg-white p-6 rounded-lg shadow-md">
            <h2 class="text-xl font-semibold mb-4">Colar Conteúdo</h2>
            <p class="text-sm text-gray-500 mb-4">Insira o texto no formato:</p>
            <pre class="bg-gray-50 p-2 rounded text-xs mb-4">Q: Pergunta?\nA: Resposta</pre>
            <textarea id="quiz-input" class="w-full h-64 p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none mb-4" placeholder="Cole seu texto aqui..."></textarea>
            <button id="generate-btn" class="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 transition">Gerar Quizz</button>
        </div>
    `;

    document.getElementById('generate-btn').addEventListener('click', handleGenerate);
}

function renderPlayTab() {
    if (quizData.length === 0) {
        mainContent.innerHTML = `
            <div class="text-center py-12">
                <p class="text-gray-500 mb-4">Nenhum quizz gerado ainda.</p>
                <button id="go-to-create" class="text-blue-600 font-semibold underline">Ir para Criar Quizz</button>
            </div>
        `;
        document.getElementById('go-to-create').addEventListener('click', () => switchTab('create'));
        return;
    }

    if (currentQuestionIndex >= quizData.length) {
        renderResults();
        return;
    }

    const currentQ = quizData[currentQuestionIndex];
    mainContent.innerHTML = `
        <div class="bg-white p-6 rounded-lg shadow-md">
            <div class="flex justify-between items-center mb-6">
                <span class="text-sm font-medium text-gray-400">Pergunta ${currentQuestionIndex + 1} de ${quizData.length}</span>
                <span class="text-sm font-medium text-blue-600">Pontos: ${score}</span>
            </div>
            
            <div class="mb-8">
                <h3 class="text-lg font-medium text-gray-800">${currentQ.question}</h3>
            </div>

            <div class="space-y-4">
                <input type="text" id="answer-input" class="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="Sua resposta...">
                <button id="submit-answer" class="w-full bg-green-600 text-white font-bold py-2 px-4 rounded hover:bg-green-700 transition">Verificar</button>
            </div>
            
            <div id="feedback" class="mt-4 hidden p-3 rounded-md text-center font-medium"></div>
            <button id="next-btn" class="w-full mt-4 bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 transition hidden">Próxima Pergunta</button>
        </div>
    `;

    document.getElementById('submit-answer').addEventListener('click', checkAnswer);
    document.getElementById('answer-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') checkAnswer();
    });
}

function checkAnswer() {
    const userInput = document.getElementById('answer-input').value.trim().toLowerCase();
    const correctAnswer = quizData[currentQuestionIndex].answer.trim().toLowerCase();
    const feedback = document.getElementById('feedback');
    const submitBtn = document.getElementById('submit-answer');
    const nextBtn = document.getElementById('next-btn');

    feedback.classList.remove('hidden', 'bg-green-100', 'text-green-700', 'bg-red-100', 'text-red-700');
    
    if (userInput === correctAnswer) {
        score++;
        feedback.innerText = 'Correto!';
        feedback.classList.add('bg-green-100', 'text-green-700');
    } else {
        feedback.innerText = `Incorreto. A resposta era: ${quizData[currentQuestionIndex].answer}`;
        feedback.classList.add('bg-red-100', 'text-red-700');
    }

    feedback.classList.remove('hidden');
    submitBtn.classList.add('hidden');
    nextBtn.classList.remove('hidden');

    nextBtn.addEventListener('click', () => {
        currentQuestionIndex++;
        renderPlayTab();
    });
}

function renderResults() {
    mainContent.innerHTML = `
        <div class="bg-white p-8 rounded-lg shadow-md text-center">
            <h2 class="text-2xl font-bold mb-4">Quizz Finalizado!</h2>
            <p class="text-4xl font-bold text-blue-600 mb-6">${score} / ${quizData.length}</p>
            <p class="text-gray-600 mb-8">Parabéns pelo esforço!</p>
            <button id="restart-btn" class="bg-blue-600 text-white font-bold py-2 px-8 rounded hover:bg-blue-700 transition">Novo Quizz</button>
        </div>
    `;

    document.getElementById('restart-btn').addEventListener('click', () => {
        currentQuestionIndex = 0;
        score = 0;
        switchTab('create');
    });
}

function handleGenerate() {
    const input = document.getElementById('quiz-input').value;
    console.log('Gerando quizz...');
    // Lógica de parsing virá na etapa 4
}

init();