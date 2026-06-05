const mainContent = document.getElementById('main-content');
const tabCreate = document.getElementById('tab-create');
const tabPlay = document.getElementById('tab-play');

let currentTab = 'create';
let quizData = [];
let currentQuestionIndex = 0;
let score = 0;

/**
 * Normalizes text for robust comparison.
 * Handles Unicode (NFD), hidden characters, invisible spaces, 
 * multiple spaces, and case sensitivity.
 */
function normalizeText(text) {
    if (!text) return "";
    return text
        .normalize("NFD") // Decompose combined characters (accents)
        .replace(/[\u0300-\u036f]/g, "") // Remove accents
        .replace(/[\u200B-\u200D\uFEFF]/g, "") // Remove invisible characters (zero-width spaces, etc.)
        .replace(/\s+/g, " ") // Collapse multiple spaces into one
        .trim() // Remove start/end spaces
        .toLowerCase();
}

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
            <p class="text-sm text-gray-500 mb-4">Formato:</p>
            <pre class="bg-gray-50 p-2 rounded text-xs mb-4 text-gray-700">Q: Pergunta?\nA: Resposta\nO: Opção Incorreta (Opcional)</pre>
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
            <div class="flex justify-between items-center mb-4 pb-4 border-b">
                <div class="flex space-x-2">
                    <button id="reset-btn" class="text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 py-1 px-2 rounded transition">Reiniciar</button>
                    <button id="delete-btn" class="text-xs bg-red-100 hover:bg-red-200 text-red-600 py-1 px-2 rounded transition">Excluir</button>
                </div>
                <div class="text-right">
                    <span class="block text-xs font-medium text-gray-400">Pergunta ${currentQuestionIndex + 1} de ${quizData.length}</span>
                    <span class="block text-xs font-medium text-blue-600">Pontos: ${score}</span>
                </div>
            </div>
            
            <div class="mb-8">
                <h3 class="text-lg font-medium text-gray-800">${currentQ.question}</h3>
            </div>

            <div id="options-container" class="grid grid-cols-1 gap-3">
                ${currentQ.options.map((option, index) => `
                    <button class="option-btn w-full text-left p-3 border-2 rounded-md hover:border-blue-500 hover:bg-blue-50 transition" data-option="${option}">
                        ${option}
                    </button>
                `).join('')}
            </div>
            
            <div id="feedback" class="mt-6 hidden p-3 rounded-md text-center font-medium"></div>
            <button id="next-btn" class="w-full mt-6 bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 transition hidden">Próxima Pergunta</button>
        </div>
    `;

    document.querySelectorAll('.option-btn').forEach(btn => {
        btn.addEventListener('click', () => checkAnswer(btn.getAttribute('data-option'), btn));
    });

    document.getElementById('reset-btn').addEventListener('click', () => {
        if (confirm('Deseja reiniciar este quizz?')) {
            currentQuestionIndex = 0;
            score = 0;
            renderPlayTab();
        }
    });

    document.getElementById('delete-btn').addEventListener('click', () => {
        if (confirm('Deseja excluir este quizz?')) {
            quizData = [];
            currentQuestionIndex = 0;
            score = 0;
            switchTab('create');
        }
    });
}

function checkAnswer(selectedOption, clickedBtn) {
    const correctAnswer = quizData[currentQuestionIndex].answer;
    const feedback = document.getElementById('feedback');
    const nextBtn = document.getElementById('next-btn');
    const optionBtns = document.querySelectorAll('.option-btn');

    // Robust comparison using normalization
    const normalizedSelected = normalizeText(selectedOption);
    const normalizedCorrect = normalizeText(correctAnswer);

    // Debug logs to identify hidden character issues
    console.log("Checking answer:");
    console.log("- Selected raw: ", JSON.stringify(selectedOption));
    console.log("- Selected normalized: ", JSON.stringify(normalizedSelected));
    console.log("- Correct raw: ", JSON.stringify(correctAnswer));
    console.log("- Correct normalized: ", JSON.stringify(normalizedCorrect));

    const isCorrect = normalizedSelected === normalizedCorrect;

    // Disable all buttons after selection
    optionBtns.forEach(btn => {
        btn.disabled = true;
        const btnOption = btn.getAttribute('data-option');
        const normalizedBtnOption = normalizeText(btnOption);
        
        if (normalizedBtnOption === normalizedCorrect) {
            btn.classList.add('border-green-500', 'bg-green-50', 'text-green-700');
        } else if (normalizedBtnOption === normalizedSelected && !isCorrect) {
            btn.classList.add('border-red-500', 'bg-red-50', 'text-red-700');
        }
    });
    
    if (isCorrect) {
        score++;
        feedback.innerText = 'Correto!';
        feedback.classList.add('bg-green-100', 'text-green-700');
    } else {
        feedback.innerText = `Incorreto. A resposta era: ${correctAnswer}`;
        feedback.classList.add('bg-red-100', 'text-red-700');
    }

    feedback.classList.remove('hidden');
    nextBtn.classList.remove('hidden');

    nextBtn.addEventListener('click', () => {
        currentQuestionIndex++;
        renderPlayTab();
    }, { once: true }); // Ensure listener is added only once
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
    const lines = input.split('\n');
    const parsedData = [];
    
    let currentQ = null;

    lines.forEach(line => {
        const trimmed = line.trim();
        if (trimmed.toLowerCase().startsWith('q:')) {
            currentQ = { 
                question: trimmed.substring(2).trim(), 
                answer: '', 
                manualOptions: [] 
            };
        } else if (trimmed.toLowerCase().startsWith('a:') && currentQ) {
            currentQ.answer = trimmed.substring(2).trim();
            parsedData.push(currentQ);
        } else if (trimmed.toLowerCase().startsWith('o:') && currentQ) {
            currentQ.manualOptions.push(trimmed.substring(2).trim());
        }
    });

    if (parsedData.length === 0) {
        alert('Nenhuma pergunta encontrada. Use o formato Q: Pergunta e A: Resposta.');
        return;
    }

    quizData = prepareQuizOptions(parsedData);
    currentQuestionIndex = 0;
    score = 0;
    switchTab('play');
}

function prepareQuizOptions(data) {
    const allAnswers = data.map(q => q.answer);
    
    return data.map(q => {
        // Collect all potential options (manual + correct answer)
        let uniqueOptionsMap = new Map();
        
        // Helper to add if normalized version isn't already there
        const addIfUnique = (text) => {
            const normalized = normalizeText(text);
            if (!uniqueOptionsMap.has(normalized) && normalized !== "") {
                uniqueOptionsMap.set(normalized, text);
            }
        };

        addIfUnique(q.answer);
        q.manualOptions.forEach(opt => addIfUnique(opt));
        
        let options = Array.from(uniqueOptionsMap.values());
        
        // Fill with automatic distractors if less than 4 unique options
        if (options.length < 4) {
            const otherAnswers = allAnswers.filter(a => {
                const normA = normalizeText(a);
                const normCorrect = normalizeText(q.answer);
                return normA !== normCorrect && !q.manualOptions.map(normalizeText).includes(normA);
            });
            
            const shuffledOthers = otherAnswers.sort(() => 0.5 - Math.random());
            
            while (options.length < 4 && shuffledOthers.length > 0) {
                addIfUnique(shuffledOthers.pop());
                options = Array.from(uniqueOptionsMap.values());
            }
        }
        
        return {
            ...q,
            options: options.sort(() => 0.5 - Math.random())
        };
    });
}

init();