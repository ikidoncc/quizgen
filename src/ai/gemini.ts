import type { Question, DifficultyMode } from "../types";

interface QuestionInput {
	id: string;
	question: string;
	answer: string;
	neededCount: number;
}

interface DistractorResult {
	id: string;
	distractors: string[];
}

function isYesNoAnswer(answer: string): boolean {
	const normalized = answer.trim().toLowerCase();
	return ["sim", "não", "nao", "yes", "no"].includes(normalized);
}

/**
 * Generates distractors for multiple questions in batch using the Gemini API.
 * Returns a mapping of question ID to the list of generated distractors.
 */
export async function generateDistractorsWithGemini(
	questions: Omit<Question, "options" | "correctOptionId">[],
	mode: DifficultyMode,
	apiKey: string,
): Promise<Record<string, string[]>> {
	if (mode === "easy") {
		return {};
	}

	// Filter questions that actually need distractors (excluding yes/no questions)
	const inputs: QuestionInput[] = questions
		.filter((q) => !isYesNoAnswer(q.answer))
		.map((q) => ({
			id: q.id,
			question: q.question,
			answer: q.answer,
			neededCount: Math.max(0, 3 - (q.manualOptions?.length || 0)),
		}))
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
- Introduzir erros gramaticais ou de digitação plausíveis na resposta correta.`
			: `Modo NORMAL:
Gere distratores que sejam alternativas incorretas plausíveis para o contexto da pergunta correspondente. Devem fazer sentido com o assunto abordado, mas estarem factualmente incorretas.`;

	const prompt = `Você é um gerador especializado de alternativas incorretas (distratores) para quizzes.
Para cada pergunta na lista JSON fornecida abaixo, você deve gerar exatamente a quantidade de distratores solicitada em "neededCount".

Regras de Geração:
${promptModeDescription}

Outras Regras Importantes:
1. NÃO repita a resposta correta em nenhuma das alternativas geradas.
2. Mantenha exatamente o mesmo idioma da pergunta e da resposta fornecida.
3. Retorne a resposta estritamente como um array de objetos JSON no seguinte formato:
[
  {
    "id": "id_da_pergunta",
    "distractors": ["distrator 1", "distrator 2", ...]
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
	const dict: Record<string, string[]> = {};
	for (const item of results) {
		if (item.id && Array.isArray(item.distractors)) {
			dict[item.id] = item.distractors;
		}
	}

	return dict;
}
