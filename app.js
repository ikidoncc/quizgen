const mainContent = document.getElementById('main-content');
const tabCreate = document.getElementById('tab-create');
const tabPlay = document.getElementById('tab-play');

// Custom Select Elements
const selectTrigger = document.getElementById('select-trigger');
const selectOptions = document.getElementById('select-options');
const selectValueDisplay = document.getElementById('select-value');

let currentTab = 'create';
let quizData = [];
let currentQuestionIndex = 0;
let score = 0;
let skippedCount = 0;
let currentTheme = 'auto';
let isTimerEnabled = false;
let timerInterval = null;
let timeLeft = 60;

/**
 * Normalizes text for robust comparison.
 */
function normalizeText(text) {
    if (!text) return "";
    return text
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[\u200B-\u200D\uFEFF]/g, "")
        .replace(/\s+/g, " ")
        .trim()
        .toLowerCase();
}

/**
 * Custom Modal implementation
 */
function showModal({ title, message, onConfirm, onCancel }) {
    const container = document.getElementById('modal-container');
    const titleEl = document.getElementById('modal-title');
    const messageEl = document.getElementById('modal-message');
    const confirmBtn = document.getElementById('modal-confirm');
    const cancelBtn = document.getElementById('modal-cancel');

    titleEl.innerText = title;
    messageEl.innerText = message;
    
    container.classList.remove('hidden');

    if (onCancel) {
        cancelBtn.classList.remove('hidden');
    } else {
        cancelBtn.classList.add('hidden');
    }

    const cleanup = () => {
        container.classList.add('hidden');
        const newConfirm = confirmBtn.cloneNode(true);
        const newCancel = cancelBtn.cloneNode(true);
        confirmBtn.parentNode.replaceChild(newConfirm, confirmBtn);
        cancelBtn.parentNode.replaceChild(newCancel, cancelBtn);
    };

    document.getElementById('modal-confirm').addEventListener('click', () => {
        cleanup();
        if (onConfirm) onConfirm();
    });

    if (onCancel) {
        document.getElementById('modal-cancel').addEventListener('click', () => {
            cleanup();
            onCancel();
        });
    }
}

/**
 * State Management & Persistence
 */
function saveState() {
    const state = {
        currentTab,
        quizData,
        currentQuestionIndex,
        score,
        skippedCount,
        currentTheme,
        isTimerEnabled,
        timeLeft
    };
    localStorage.setItem('quizgen_state', JSON.stringify(state));
}

function loadState() {
    const saved = localStorage.getItem('quizgen_state');
    if (saved) {
        try {
            const state = JSON.parse(saved);
            currentTab = state.currentTab || 'create';
            quizData = state.quizData || [];
            currentQuestionIndex = state.currentQuestionIndex || 0;
            score = state.score || 0;
            skippedCount = state.skippedCount || 0;
            currentTheme = state.currentTheme || 'auto';
            isTimerEnabled = state.isTimerEnabled || false;
            timeLeft = state.timeLeft || 60;
            updateSelectValueDisplay(currentTheme);
            return true;
        } catch (e) {
            console.error("Error loading saved state", e);
        }
    }
    return false;
}

/**
 * Theme Management
 */
function applyTheme() {
    const html = document.documentElement;
    if (currentTheme === 'dark') {
        html.classList.add('dark');
    } else if (currentTheme === 'light') {
        html.classList.remove('dark');
    } else {
        // Auto mode
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            html.classList.add('dark');
        } else {
            html.classList.remove('dark');
        }
    }
}

/**
 * Timer Logic
 */
function startTimer() {
    if (!isTimerEnabled) return;
    
    stopTimer(); // Clear any existing interval
    
    const timerDisplay = document.getElementById('timer-display');
    if (timerDisplay) timerDisplay.innerText = timeLeft;

    timerInterval = setInterval(() => {
        timeLeft--;
        if (timerDisplay) timerDisplay.innerText = timeLeft;
        
        saveState();

        if (timeLeft <= 0) {
            stopTimer();
            handleTimeout();
        }
    }, 1000);
}

function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

function handleTimeout() {
    skippedCount++;
    currentQuestionIndex++;
    timeLeft = 60;
    saveState();
    renderPlayTab();
}

function updateSelectValueDisplay(value) {
    const option = Array.from(document.querySelectorAll('#select-options .option')).find(opt => opt.dataset.value === value);
    if (option) {
        const parts = option.innerText.split(' ');
        const emoji = parts[0];
        const label = parts[1];
        selectValueDisplay.innerHTML = `${emoji} <span class="hidden sm:inline ml-1">${label}</span>`;
    }
}

function init() {
    loadState();
    applyTheme();
    switchTab(currentTab);
    
    tabCreate.addEventListener('click', () => switchTab('create'));
    tabPlay.addEventListener('click', () => switchTab('play'));
    
    // Custom Select Toggle
    selectTrigger.addEventListener('click', (e) => {
        e.stopPropagation();
        selectOptions.classList.toggle('hidden');
    });

    // Custom Select Options
    document.querySelectorAll('#select-options .option').forEach(option => {
        option.addEventListener('click', () => {
            currentTheme = option.dataset.value;
            updateSelectValueDisplay(currentTheme);
            selectOptions.classList.add('hidden');
            saveState();
            applyTheme();
        });
    });

    // Close select on outside click
    document.addEventListener('click', () => {
        selectOptions.classList.add('hidden');
    });

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        if (currentTheme === 'auto') applyTheme();
    });
}

function switchTab(tab) {
    currentTab = tab;
    saveState();
    
    if (tab === 'create') {
        stopTimer();
        tabCreate.classList.add('text-iris', 'border-b-2', 'border-iris');
        tabCreate.classList.remove('text-muted');
        tabPlay.classList.add('text-muted');
        tabPlay.classList.remove('text-iris', 'border-b-2', 'border-iris');
        renderCreateTab();
    } else {
        tabPlay.classList.add('text-iris', 'border-b-2', 'border-iris');
        tabPlay.classList.remove('text-muted');
        tabCreate.classList.add('text-muted');
        tabCreate.classList.remove('text-iris', 'border-b-2', 'border-iris');
        renderPlayTab();
    }
}

function renderCreateTab() {
    mainContent.innerHTML = `
        <div class="bg-surface p-6 rounded-lg shadow-md border border-overlay transition-colors">
            <h2 class="text-xl font-semibold mb-4 text-main">Colar Conteúdo</h2>
            <p class="text-sm text-subtle mb-4">Formato:</p>
            <pre class="bg-overlay p-2 rounded text-xs mb-4 text-muted border border-overlay">Q: Pergunta?\nA: Resposta\nO: Opção Incorreta (Opcional)</pre>
            <textarea id="quiz-input" class="w-full h-64 p-3 bg-base border border-overlay text-main rounded-md focus:ring-2 focus:ring-iris focus:outline-none mb-4 transition-colors" placeholder="Cole seu texto aqui..."></textarea>
            
            <div class="flex items-center mb-6">
                <input type="checkbox" id="timer-checkbox" class="w-4 h-4 text-iris bg-base border-overlay rounded focus:ring-iris focus:ring-2 cursor-pointer" ${isTimerEnabled ? 'checked' : ''}>
                <label for="timer-checkbox" class="ml-2 text-sm font-medium text-main cursor-pointer select-none">Habilitar temporizador (1 minuto por questão)</label>
            </div>

            <button id="generate-btn" class="w-full bg-iris text-surface font-bold py-2 px-4 rounded hover:opacity-90 transition">Gerar Quizz</button>
        </div>
    `;

    document.getElementById('generate-btn').addEventListener('click', handleGenerate);
}

function renderPlayTab() {
    if (quizData.length === 0) {
        stopTimer();
        mainContent.innerHTML = `
            <div class="text-center py-12">
                <p class="text-muted mb-4">Nenhum quizz gerado ainda.</p>
                <button id="go-to-create" class="text-iris font-semibold underline">Ir para Criar Quizz</button>
            </div>
        `;
        document.getElementById('go-to-create').addEventListener('click', () => switchTab('create'));
        return;
    }

    if (currentQuestionIndex >= quizData.length) {
        stopTimer();
        renderResults();
        return;
    }

    const currentQ = quizData[currentQuestionIndex];
    mainContent.innerHTML = `
        <div class="bg-surface p-6 rounded-lg shadow-md border border-overlay transition-colors">
            <div class="flex justify-between items-center mb-4 pb-4 border-b border-overlay">
                <div class="flex space-x-2">
                    <button id="reset-btn" class="text-xs bg-overlay hover:opacity-80 text-main py-1 px-2 rounded transition">Reiniciar</button>
                    <button id="delete-btn" class="text-xs bg-love bg-opacity-10 hover:bg-opacity-20 text-love py-1 px-2 rounded transition">Excluir</button>
                </div>
                <div class="text-right">
                    <span class="block text-xs font-medium text-muted">Pergunta ${currentQuestionIndex + 1} de ${quizData.length}</span>
                    <span class="block text-xs font-medium text-iris font-bold">Pontos: ${score}</span>
                    ${isTimerEnabled ? `<span class="block text-xs font-bold text-love mt-1">Tempo: <span id="timer-display">${timeLeft}</span>s</span>` : ''}
                </div>
            </div>
            
            <div class="mb-8">
                <h3 class="text-lg font-medium text-main">${currentQ.question}</h3>
            </div>

            <div id="options-container" class="grid grid-cols-1 gap-3">
                ${currentQ.options.map((option, index) => `
                    <button class="option-btn w-full text-left p-3 border-2 border-overlay rounded-md hover:border-iris hover:bg-iris hover:bg-opacity-5 transition text-main" data-option="${option.replace(/"/g, '&quot;')}">
                        ${option}
                    </button>
                `).join('')}
            </div>
            
            <div id="feedback" class="mt-6 hidden p-3 rounded-md text-center font-medium"></div>
            <div class="mt-6 space-y-2">
                <button id="next-btn" class="w-full bg-iris text-surface font-bold py-2 px-4 rounded hover:opacity-90 transition hidden">Próxima Pergunta</button>
                <button id="skip-btn" class="w-full bg-surface border-2 border-overlay text-subtle font-bold py-2 px-4 rounded hover:border-muted transition">Pular Pergunta</button>
            </div>
        </div>
    `;

    document.querySelectorAll('.option-btn').forEach(btn => {
        btn.addEventListener('click', () => checkAnswer(btn.getAttribute('data-option'), btn));
    });

    document.getElementById('skip-btn').addEventListener('click', () => {
        stopTimer();
        skippedCount++;
        currentQuestionIndex++;
        timeLeft = 60;
        saveState();
        renderPlayTab();
    });

    document.getElementById('reset-btn').addEventListener('click', () => {
        stopTimer();
        showModal({
            title: 'Reiniciar Quizz',
            message: 'Deseja reiniciar este quizz?',
            onConfirm: () => {
                currentQuestionIndex = 0;
                score = 0;
                skippedCount = 0;
                timeLeft = 60;
                saveState();
                renderPlayTab();
            },
            onCancel: () => {
                startTimer();
            }
        });
    });

    document.getElementById('delete-btn').addEventListener('click', () => {
        stopTimer();
        showModal({
            title: 'Excluir Quizz',
            message: 'Deseja excluir este quizz?',
            onConfirm: () => {
                quizData = [];
                currentQuestionIndex = 0;
                score = 0;
                skippedCount = 0;
                timeLeft = 60;
                saveState();
                switchTab('create');
            },
            onCancel: () => {
                startTimer();
            }
        });
    });

    startTimer();
}

function checkAnswer(selectedOption, clickedBtn) {
    stopTimer();
    const correctAnswer = quizData[currentQuestionIndex].answer;
    const feedback = document.getElementById('feedback');
    const nextBtn = document.getElementById('next-btn');
    const optionBtns = document.querySelectorAll('.option-btn');

    const normalizedSelected = normalizeText(selectedOption);
    const normalizedCorrect = normalizeText(correctAnswer);
    const isCorrect = normalizedSelected === normalizedCorrect;

    optionBtns.forEach(btn => {
        btn.disabled = true;
        const btnOption = btn.getAttribute('data-option');
        const normalizedBtnOption = normalizeText(btnOption);
        
        if (normalizedBtnOption === normalizedCorrect) {
            btn.classList.add('border-pine', 'bg-pine', 'bg-opacity-10', 'text-pine');
        } else if (normalizedBtnOption === normalizedSelected && !isCorrect) {
            btn.classList.add('border-love', 'bg-love', 'bg-opacity-10', 'text-love');
        }
    });
    
    if (isCorrect) {
        score++;
        feedback.innerText = 'Correto!';
        feedback.classList.add('bg-pine', 'bg-opacity-10', 'text-pine');
    } else {
        feedback.innerText = `Incorreto. A resposta era: ${correctAnswer}`;
        feedback.classList.add('bg-love', 'bg-opacity-10', 'text-love');
    }

    saveState();
    feedback.classList.remove('hidden');
    nextBtn.classList.remove('hidden');
    document.getElementById('skip-btn').classList.add('hidden');

    nextBtn.addEventListener('click', () => {
        currentQuestionIndex++;
        timeLeft = 60;
        saveState();
        renderPlayTab();
    }, { once: true });
}

function renderResults() {
    stopTimer();
    const totalQuestions = quizData.length;
    const wrongCount = totalQuestions - score - skippedCount;

    mainContent.innerHTML = `
        <div class="bg-surface p-8 rounded-lg shadow-md text-center border border-overlay transition-colors">
            <h2 class="text-2xl font-bold mb-4 text-main">Quizz Finalizado!</h2>
            <p class="text-4xl font-bold text-iris mb-6">${score} / ${totalQuestions}</p>
            
            <div class="grid grid-cols-3 gap-4 mb-8 text-sm">
                <div class="bg-pine bg-opacity-10 p-3 rounded">
                    <span class="block text-pine font-bold">${score}</span>
                    <span class="text-pine opacity-80">Acertos</span>
                </div>
                <div class="bg-gold bg-opacity-10 p-3 rounded">
                    <span class="block text-gold font-bold">${skippedCount}</span>
                    <span class="text-gold opacity-80">Puladas</span>
                </div>
                <div class="bg-love bg-opacity-10 p-3 rounded">
                    <span class="block text-love font-bold">${wrongCount}</span>
                    <span class="text-love opacity-80">Erros</span>
                </div>
            </div>

            <button id="restart-btn" class="bg-iris text-surface font-bold py-2 px-8 rounded hover:opacity-90 transition">Novo Quizz</button>
        </div>
    `;

    document.getElementById('restart-btn').addEventListener('click', () => {
        currentQuestionIndex = 0;
        score = 0;
        skippedCount = 0;
        timeLeft = 60;
        saveState();
        switchTab('create');
    });
}

function handleGenerate() {
    const input = document.getElementById('quiz-input').value;
    const lines = input.split('\n');
    const parsedData = [];
    isTimerEnabled = document.getElementById('timer-checkbox').checked;
    
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
        showModal({
            title: 'Erro',
            message: 'Nenhuma pergunta encontrada. Use o formato Q: Pergunta e A: Resposta.'
        });
        return;
    }

    quizData = prepareQuizOptions(parsedData);
    currentQuestionIndex = 0;
    score = 0;
    skippedCount = 0;
    timeLeft = 60;
    saveState();
    switchTab('play');
}

function prepareQuizOptions(data) {
    const allAnswers = data.map(q => q.answer);
    
    return data.map(q => {
        let uniqueOptionsMap = new Map();
        const addIfUnique = (text) => {
            const normalized = normalizeText(text);
            if (!uniqueOptionsMap.has(normalized) && normalized !== "") {
                uniqueOptionsMap.set(normalized, text);
            }
        };

        addIfUnique(q.answer);
        q.manualOptions.forEach(opt => addIfUnique(opt));
        
        let options = Array.from(uniqueOptionsMap.values());
        
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