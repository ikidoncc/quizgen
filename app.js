const mainContent = document.getElementById('main-content');
const tabCreate = document.getElementById('tab-create');
const tabPlay = document.getElementById('tab-play');

let currentTab = 'create';
let quizData = [];

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
                <button onclick="switchTab('create')" class="text-blue-600 font-semibold underline">Ir para Criar Quizz</button>
            </div>
        `;
        return;
    }
    mainContent.innerHTML = `<div class="bg-white p-6 rounded-lg shadow-md text-center"><p class="text-gray-500">Aba de Jogo (Em breve...)</p></div>`;
}

function handleGenerate() {
    const input = document.getElementById('quiz-input').value;
    console.log('Gerando quizz...');
    // Lógica de parsing virá na etapa 4
}

init();