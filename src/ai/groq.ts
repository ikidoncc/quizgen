import type { Question, DifficultyMode } from "../types";

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

export interface GroqGenerationResult {
	distractors: string[];
	correctOption?: string;
}

function isBooleanAnswer(answer: string): boolean {
	const normalized = answer.trim().toLowerCase();
	return [
		"sim", "não", "nao", "yes", "no",
		"verdadeiro", "falso", "true", "false"
	].includes(normalized);
}

/**
 * Generates distractors for multiple questions in batch using the Groq API.
 * Returns a mapping of question ID to the list of generated distractors and optional correct option overrides.
 */
export async function generateDistractorsWithGroq(
	questions: Omit<Question, "options" | "correctOptionId">[],
	mode: DifficultyMode,
	apiKey: string,
): Promise<Record<string, GroqGenerationResult>> {
	if (mode === "easy") {
		return {};
	}

	// Filter questions that actually need distractors
	const inputs: QuestionInput[] = questions
		.map((q) => {
			const isBool = isBooleanAnswer(q.answer);
			return {
				id: q.id,
				question: q.question,
				answer: q.answer,
				neededCount: isBool ? 3 : Math.max(0, 3 - (q.manualOptions?.length || 0)),
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
- Introduzir erros gramaticais ou de digitação plausíveis na resposta correta.`
			: `Modo NORMAL:
Gere distratores que sejam alternativas incorretas plausíveis para o contexto da pergunta correspondente. Devem fazer sentido com o assunto abordado, mas estarem factualmente incorretas.`;

	const prompt = `Você é um gerador especializado de alternativas para quizzes.
Para cada pergunta na lista JSON fornecida abaixo, você deve gerar alternativas ou distratores conforme especificado.

Regras Gerais:
1. NÃO repita a resposta correta original em nenhuma das alternativas geradas (exceto se for no formato expandido para perguntas booleanas).
2. Mantenha exatamente o mesmo idioma da pergunta e da resposta fornecida.
3. Retorne a resposta estritamente como um objeto JSON válido no formato de saída especificado.

Regras de Geração (Dificuldade):
${promptModeDescription}

Regras para Perguntas Booleanas (quando "isBoolean" for true):
Se o campo "isBoolean" for true na entrada, a resposta correta original é simples (como "Sim", "Não", "Verdadeiro", "Falso").
Você DEVE:
1. Gerar uma versão expandida da resposta correta no campo "correctOption", incluindo uma justificativa curta (ex: "Sim, porque a fotossíntese necessita de luz solar." ou "Falso, porque o Sol é uma estrela.").
2. Gerar exatamente 3 distratores no campo "distractors", cada um contendo uma justificativa plausível porém incorreta (ex: "Não, porque a fotossíntese ocorre apenas à noite." ou "Sim, porque as plantas realizam apenas respiração.").
As alternativas devem começar de forma apropriada com "Sim, porque...", "Não, porque...", "Verdadeiro, porque...", "Falso, porque...", etc.

Esquema de Saída JSON esperado (retorne obrigatoriamente um objeto contendo a chave "questions"):
{
  "questions": [
    {
      "id": "id_da_pergunta",
      "correctOption": "Resposta correta expandida (apenas se isBoolean for true)",
      "distractors": ["distrator 1", "distrator 2", "distrator 3"]
    }
  ]
}

Entrada:
${JSON.stringify(inputs, null, 2)}`;

	const response = await fetch(
		"https://api.groq.com/openai/v1/chat/completions",
		{
			method: "POST",
			headers: {
				"Authorization": `Bearer ${apiKey}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				model: "llama-3.1-8b-instant",
				messages: [
					{
						role: "user",
						content: prompt,
					},
				],
				response_format: { type: "json_object" },
				temperature: 0.2,
			}),
		},
	);

	if (!response.ok) {
		const errorText = await response.text();
		throw new Error(`Groq API error (${response.status}): ${errorText}`);
	}

	const data = await response.json();
	const text = data.choices?.[0]?.message?.content;
	if (!text) {
		throw new Error("No response text returned from Groq API");
	}

	const parsed = JSON.parse(text.trim());
	const results: DistractorResult[] = parsed.questions || [];

	// Convert to a dictionary for easy lookup
	const dict: Record<string, GroqGenerationResult> = {};
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
