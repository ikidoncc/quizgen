import type { DifficultyMode, Question } from "../types";

interface QuestionInput {
	id: string;
	question: string;
	answer: string;
	neededCount: number;
	isBoolean: boolean;
}

interface DistractorResult {
	id: string;
	distractors: string[];
	correctOption?: string;
}

export interface GeminiGenerationResult {
	distractors: string[];
	correctOption?: string;
}

function isBooleanAnswer(answer: string): boolean {
	const normalized = answer.trim().toLowerCase();
	return [
		"sim",
		"não",
		"nao",
		"yes",
		"no",
		"verdadeiro",
		"falso",
		"true",
		"false",
	].includes(normalized);
}

/**
 * Generates distractors for multiple questions in batch using the Gemini API.
 * Returns a mapping of question ID to the list of generated distractors and optional correct option overrides.
 */
export async function generateDistractorsWithGemini(
	questions: Omit<Question, "options" | "correctOptionId">[],
	mode: DifficultyMode,
	apiKey: string,
): Promise<Record<string, GeminiGenerationResult>> {
	if (mode === "easy") {
		return {};
	}

	const inputs: QuestionInput[] = questions
		.map((q) => {
			const isBool = isBooleanAnswer(q.answer);
			return {
				id: q.id,
				question: q.question,
				answer: q.answer,
				neededCount: isBool
					? 3
					: Math.max(0, 3 - (q.manualOptions?.length || 0)),
				isBoolean: isBool,
			};
		})
		.filter((q) => q.neededCount > 0);

	if (inputs.length === 0) {
		return {};
	}

	const promptModeDescription =
		mode === "hard"
			? `Modo DIFÍCIL:
Gere distratores modificando a resposta correta ("answer") LEVEMENTE de maneira sutil de forma que seja extremamente difícil distinguir qual é a correta.
Exemplos de modificações sutis:
- Trocar palavras-chave por sinônimos quase idênticos mas logicamente incorretos.
- Pequenas alterações em datas, valores numéricos muito próximos ou fórmulas.
- Adicionar pequenas negações ou mudar condicionais (ex: "sempre" para "frequentemente").
- Inverter de forma sutil alguma lógica ou condição da frase correta.
NÃO utilize erros gramaticais, ortográficos ou de digitação para criar alternativas incorretas. Todas as opções devem ser escritas com gramática e grafia perfeitas.`
			: `Modo NORMAL:
Gere distratores que sejam alternativas incorretas plausíveis para o contexto da pergunta correspondente. Devem fazer sentido com o assunto abordado, mas estarem factualmente incorretas.`;

	const prompt = `Você é um gerador especializado de alternativas para quizzes.
Para cada pergunta na lista JSON fornecida abaixo, você deve gerar alternativas ou distratores conforme especificado.

Regras Gerais:
1. NÃO repita a resposta correta original em nenhuma das alternativas geradas (exceto se for no formato expandido para perguntas booleanas).
2. Mantenha exatamente o mesmo idioma da pergunta e da resposta fornecida.
3. Retorne a resposta estritamente como um array de objetos JSON no formato de saída especificado.

Regras de Geração (Dificuldade):
${promptModeDescription}

Regras para Perguntas Booleanas (quando "isBoolean" for true):
Se o campo "isBoolean" for true na entrada, a resposta correta original é simples (como "Sim", "Não", "Verdadeiro", "Falso").
Você DEVE:
1. Gerar uma versão expandida da resposta correta no campo "correctOption", incluindo uma justificativa curta (ex: "Sim, porque a fotossíntese necessita de luz solar." ou "Falso, porque o Sol é uma estrela.").
2. Gerar exatamente 3 distratores no campo "distractors", cada um contendo uma justificativa plausível porém incorreta (ex: "Não, porque a fotossíntese ocorre apenas à noite." ou "Sim, porque as plantas realizam apenas respiração.").
As alternativas devem começar de forma apropriada com "Sim, porque...", "Não, porque...", "Verdadeiro, porque...", "Falso, porque...", etc.

Esquema de Saída JSON esperado:
[
  {
    "id": "id_da_pergunta",
    "correctOption": "Resposta correta expandida (apenas se isBoolean for true)",
    "distractors": ["distrator 1", "distrator 2", "distrator 3"]
  }
]

Entrada:
${JSON.stringify(inputs, null, 2)}`;

	const response = await fetch(
		`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
		{
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				contents: [
					{
						parts: [
							{
								text: prompt,
							},
						],
					},
				],
				generationConfig: {
					responseMimeType: "application/json",
				},
			}),
		},
	);

	if (!response.ok) {
		const errorText = await response.text();
		throw new Error(`Gemini API error (${response.status}): ${errorText}`);
	}

	const data = await response.json();
	const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
	if (!text) {
		throw new Error("No response text returned from Gemini API");
	}

	// Parse the JSON array returned
	const results: DistractorResult[] = JSON.parse(text.trim());

	// Convert to a dictionary for easy lookup
	const dict: Record<string, GeminiGenerationResult> = {};
	for (const item of results) {
		if (item.id && Array.isArray(item.distractors)) {
			dict[item.id] = {
				distractors: item.distractors,
				correctOption: item.correctOption,
			};
		}
	}

	return dict;
}

export interface FlashcardGenerationResult {
	title: string;
	cards: {
		front: string;
		back: string;
	}[];
}

export async function generateFlashcardsWithGemini(
	text: string,
	apiKey: string,
	cardCount: number,
): Promise<FlashcardGenerationResult> {
	const prompt = `Você é um gerador especialista em material didático e flashcards de estudo.
Sua tarefa é analisar o texto enviado pelo usuário e gerar um conjunto de flashcards contendo conceitos importantes, perguntas e respostas diretas presentes no texto.

Regras de Geração:
1. Extraia exatamente ${cardCount} flashcards (ou o máximo possível próximo de ${cardCount} caso o texto seja curto), focando em termos-chave, definições, fórmulas ou conceitos cruciais presentes no texto.
2. Cada flashcard deve conter:
   - "front": Uma pergunta clara ou o nome de um conceito (máximo de 120 caracteres).
   - "back": A resposta exata, definição ou explicação resumida (máximo de 300 caracteres).
3. Mantenha as frases diretas e adequadas para memorização rápida.
4. Use o mesmo idioma do texto fornecido.
5. Retorne a resposta estritamente como um objeto JSON válido contendo o título do deck e a lista de cards no formato esperado.

Esquema de Saída JSON esperado:
{
  "title": "Assunto Principal ou Título do Deck",
  "cards": [
    {
      "front": "Pergunta ou conceito?",
      "back": "Resposta ou explicação detalhada."
    }
  ]
}

Texto fornecido:
${text}`;

	const response = await fetch(
		`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
		{
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				contents: [
					{
						parts: [
							{
								text: prompt,
							},
						],
					},
				],
				generationConfig: {
					responseMimeType: "application/json",
				},
			}),
		},
	);

	if (!response.ok) {
		const errorText = await response.text();
		throw new Error(`Gemini API error (${response.status}): ${errorText}`);
	}

	const data = await response.json();
	const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
	if (!responseText) {
		throw new Error("No response text returned from Gemini API");
	}

	const result: FlashcardGenerationResult = JSON.parse(responseText.trim());
	if (!result.title || !Array.isArray(result.cards)) {
		throw new Error("Invalid response format from Gemini API");
	}

	return result;
}

export interface AIQuizQuestion {
	question: string;
	answer: string;
	distractors: string[];
}

export interface AIQuizGenerationResult {
	questions: AIQuizQuestion[];
}

export async function generateQuizFromTextWithGemini(
	text: string,
	apiKey: string,
	quantity: number,
	mode: DifficultyMode,
): Promise<AIQuizGenerationResult> {
	const promptModeDescription =
		mode === "easy"
			? `Modo FÁCIL:
Gere perguntas diretas sobre conceitos simples do texto. As alternativas incorretas (distratores) devem ser fáceis de diferenciar da resposta correta, utilizando conceitos claramente distintos ou incorretos.`
			: mode === "hard"
				? `Modo DIFÍCIL:
Gere perguntas profundas ou interpretativas baseadas no texto. Os distratores devem ser gerados modificando a resposta correta LEVEMENTE de maneira sutil, de forma que seja extremamente difícil distinguir qual é a correta (ex: trocando palavras por sinônimos quase idênticos mas logicamente incorretos, fazendo alterações leves de valores, etc.). NÃO utilize erros gramaticais, ortográficos ou de digitação para criar alternativas incorretas. Todas as opções devem ser escritas com gramática e grafia perfeitas.`
				: `Modo NORMAL:
Gere perguntas sobre conceitos principais e detalhes relevantes do texto. As alternativas incorretas (distratores) devem ser opções plausíveis para o contexto da pergunta, mas factualmente incorretas.`;

	const prompt = `Você é um gerador especialista em quizzes e avaliações didáticas.
Sua tarefa é analisar o texto enviado pelo usuário e gerar um conjunto de perguntas de múltipla escolha com alto rigor pedagógico.

Regras de Geração:
1. Extraia exatamente ${quantity} perguntas de múltipla escolha baseadas nas partes mais importantes do texto (ou o máximo possível próximo de ${quantity} caso o texto seja curto).
2. Cada pergunta deve ser um enunciado claro e objetivo.
3. Para cada pergunta, você deve fornecer:
   - "question": O enunciado da pergunta.
   - "answer": A alternativa correta e factual baseada no texto.
   - "distractors": Uma lista contendo exatamente 3 alternativas incorretas (distratores).
4. O nível de dificuldade deve seguir a seguinte especificação:
${promptModeDescription}
5. Use o mesmo idioma do texto fornecido.
6. Retorne a resposta estritamente como um objeto JSON válido contendo a chave "questions" com a lista de perguntas geradas.

Esquema de Saída JSON esperado:
{
  "questions": [
    {
      "question": "Enunciado da pergunta?",
      "answer": "Opção correta",
      "distractors": ["Distrator 1", "Distrator 2", "Distrator 3"]
    }
  ]
}

Texto fornecido:
${text}`;

	const response = await fetch(
		`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
		{
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				contents: [
					{
						parts: [
							{
								text: prompt,
							},
						],
					},
				],
				generationConfig: {
					responseMimeType: "application/json",
				},
			}),
		},
	);

	if (!response.ok) {
		const errorText = await response.text();
		throw new Error(`Gemini API error (${response.status}): ${errorText}`);
	}

	const data = await response.json();
	const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
	if (!responseText) {
		throw new Error("No response text returned from Gemini API");
	}

	const result: AIQuizGenerationResult = JSON.parse(responseText.trim());
	if (!Array.isArray(result.questions)) {
		throw new Error("Invalid response format from Gemini API");
	}

	return result;
}
