import {
	generateDistractorsWithGemini,
	generateQuizFromTextWithGemini,
	type AIQuizGenerationResult,
} from "../ai/gemini";
import {
	generateDistractorsWithGroq,
	generateQuizFromTextWithGroq,
} from "../ai/groq";
import {
	generateDistractorsWithOpenAI,
	generateQuizFromTextWithOpenAI,
} from "../ai/openai";
import type { AIProvider, DifficultyMode, Option, Question } from "../types";

export const TIMER_DURATION = 60;

function generateId(): string {
	return crypto.randomUUID().slice(0, 8);
}

function shuffle<T>(array: T[]): T[] {
	const result = [...array];
	for (let i = result.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[result[i], result[j]] = [result[j], result[i]];
	}
	return result;
}

export function parseQuizText(
	input: string,
): Omit<Question, "options" | "correctOptionId">[] {
	const lines = input.split("\n");
	const parsedData: Omit<Question, "options" | "correctOptionId">[] = [];
	let currentQ: Omit<Question, "options" | "correctOptionId"> | null = null;

	lines.forEach((line) => {
		const trimmed = line.trim();
		if (trimmed.toLowerCase().startsWith("q:")) {
			currentQ = {
				id: generateId(),
				question: trimmed.substring(2).trim(),
				answer: "",
				manualOptions: [],
			};
		} else if (trimmed.toLowerCase().startsWith("a:") && currentQ) {
			currentQ.answer = trimmed.substring(2).trim();
			parsedData.push({ ...currentQ });
		} else if (
			trimmed.toLowerCase().startsWith("o:") &&
			currentQ?.manualOptions
		) {
			currentQ.manualOptions.push(trimmed.substring(2).trim());
		}
	});

	return parsedData;
}

function collectUniqueOptions(
	q: Pick<Question, "answer" | "manualOptions">,
): Map<string, { text: string; isCorrect: boolean; explanation?: string }> {
	const map = new Map<
		string,
		{ text: string; isCorrect: boolean; explanation?: string }
	>();

	const addIfUnique = (
		text: string,
		isCorrect: boolean,
		explanation?: string,
	) => {
		if (text === "") return;
		const key = text.toLowerCase().trim();
		if (!map.has(key)) {
			map.set(key, { text, isCorrect, explanation });
		}
	};

	addIfUnique(q.answer, true);
	for (const opt of q.manualOptions) {
		addIfUnique(opt, false);
	}

	return map;
}

function fillWithDistractors(
	options: Map<
		string,
		{ text: string; isCorrect: boolean; explanation?: string }
	>,
	allAnswers: string[],
	correctAnswer: string,
	manualOptions: string[],
): Map<string, { text: string; isCorrect: boolean; explanation?: string }> {
	const result = new Map(options);

	if (result.size >= 4) return result;

	const manualNormalized = new Set(
		manualOptions.map((o) => o.toLowerCase().trim()),
	);

	const otherAnswers = allAnswers.filter((a) => {
		const key = a.toLowerCase().trim();
		return (
			key !== correctAnswer.toLowerCase().trim() && !manualNormalized.has(key)
		);
	});

	for (const answer of shuffle(otherAnswers)) {
		if (result.size >= 4) break;
		const key = answer.toLowerCase().trim();
		if (!result.has(key) && key !== "") {
			result.set(key, { text: answer, isCorrect: false });
		}
	}

	return result;
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

function getBooleanOptions(
	qId: string,
	answer: string,
): { correctOptionId: string; options: Option[] } {
	const normalized = answer.trim().toLowerCase();

	let option1Text = "";
	let option2Text = "";
	let isCorrectOption1 = false;

	if (["sim", "não", "nao"].includes(normalized)) {
		option1Text = "Sim";
		option2Text = "Não";
		isCorrectOption1 = normalized === "sim";
	} else if (["yes", "no"].includes(normalized)) {
		option1Text = "Yes";
		option2Text = "No";
		isCorrectOption1 = normalized === "yes";
	} else if (["verdadeiro", "falso"].includes(normalized)) {
		option1Text = "Verdadeiro";
		option2Text = "Falso";
		isCorrectOption1 = normalized === "verdadeiro";
	} else {
		option1Text = "True";
		option2Text = "False";
		isCorrectOption1 = normalized === "true";
	}

	const opt1Id = `${qId}-opt-0`;
	const opt2Id = `${qId}-opt-1`;

	const options = [
		{ id: opt1Id, text: option1Text },
		{ id: opt2Id, text: option2Text },
	];

	const correctOptionId = isCorrectOption1 ? opt1Id : opt2Id;

	return {
		correctOptionId,
		options,
	};
}

export function prepareQuizOptions(
	data: Omit<Question, "options" | "correctOptionId">[],
): Question[] {
	const allAnswers = data.map((q) => q.answer);

	return data.map((q) => {
		if (isBooleanAnswer(q.answer)) {
			const { correctOptionId, options } = getBooleanOptions(q.id, q.answer);
			return {
				...q,
				correctOptionId,
				options,
			};
		}

		const uniqueOptions = collectUniqueOptions(q);
		const filledOptions = fillWithDistractors(
			uniqueOptions,
			allAnswers,
			q.answer,
			q.manualOptions,
		);

		const entries = shuffle(Array.from(filledOptions.entries()));
		let correctOptionId = "";
		const options: Option[] = entries.map(
			([_, { text, isCorrect, explanation }], i) => {
				const id = `${q.id}-opt-${i}`;
				if (isCorrect) correctOptionId = id;
				return { id, text, explanation };
			},
		);
		return {
			...q,
			correctOptionId,
			options,
		};
	});
}

export async function prepareQuizOptionsWithAI(
	data: Omit<Question, "options" | "correctOptionId">[],
	mode: DifficultyMode,
	provider: AIProvider,
	apiKey?: string,
): Promise<Question[]> {
	if (mode === "easy" || !apiKey) {
		return prepareQuizOptions(data);
	}

	try {
		let distractorMap: Record<
			string,
			{
				distractors: (string | { text: string; explanation: string })[];
				correctOption?: string;
				answerExplanation?: string;
			}
		> = {};
		if (provider === "gemini") {
			distractorMap = await generateDistractorsWithGemini(data, mode, apiKey);
		} else if (provider === "groq") {
			distractorMap = await generateDistractorsWithGroq(data, mode, apiKey);
		} else if (provider === "openai") {
			distractorMap = await generateDistractorsWithOpenAI(data, mode, apiKey);
		}
		const allAnswers = data.map((q) => q.answer);

		return data.map((q) => {
			const isBool = isBooleanAnswer(q.answer);

			// Handle boolean questions with AI generated justifications
			if (isBool) {
				const aiResult = distractorMap[q.id];
				if (
					aiResult?.correctOption &&
					aiResult.distractors &&
					aiResult.distractors.length >= 3
				) {
					const correctText = aiResult.correctOption;
					const distractorsText = aiResult.distractors.slice(0, 3);

					const uniqueOptions = new Map<
						string,
						{ text: string; isCorrect: boolean; explanation?: string }
					>();
					uniqueOptions.set(correctText.toLowerCase().trim(), {
						text: correctText,
						isCorrect: true,
					});
					for (const d of distractorsText) {
						const dText = typeof d === "string" ? d : d.text;
						const dExplanation =
							typeof d === "string" ? undefined : d.explanation;
						uniqueOptions.set(dText.toLowerCase().trim(), {
							text: dText,
							isCorrect: false,
							explanation: dExplanation,
						});
					}

					const entries = shuffle(Array.from(uniqueOptions.entries()));
					let correctOptionId = "";
					const options: Option[] = entries.map(
						([_, { text, isCorrect, explanation }], i) => {
							const id = `${q.id}-opt-${i}`;
							if (isCorrect) correctOptionId = id;
							return { id, text, explanation };
						},
					);

					return {
						...q,
						correctOptionId,
						options,
					};
				}

				// Fallback to offline 2-option version if AI didn't return complete data
				const { correctOptionId, options } = getBooleanOptions(q.id, q.answer);
				return {
					...q,
					correctOptionId,
					options,
				};
			}

			const uniqueOptions = collectUniqueOptions(q);
			const aiResult = distractorMap[q.id];

			// Override the correct answer in the map to include its explanation
			if (aiResult?.answerExplanation) {
				const correctKey = q.answer.toLowerCase().trim();
				const existingCorrect = uniqueOptions.get(correctKey);
				if (existingCorrect) {
					uniqueOptions.set(correctKey, {
						...existingCorrect,
						explanation: aiResult.answerExplanation,
					});
				}
			}

			// Add AI generated distractors if they exist for this question
			const aiDistractors = aiResult?.distractors || [];
			for (const distractor of aiDistractors) {
				if (uniqueOptions.size >= 4) break;
				const text =
					typeof distractor === "string" ? distractor : distractor.text;
				const explanation =
					typeof distractor === "string" ? undefined : distractor.explanation;
				const key = text.toLowerCase().trim();
				if (!uniqueOptions.has(key) && key !== "") {
					uniqueOptions.set(key, { text, isCorrect: false, explanation });
				}
			}

			// If we still don't have 4 options, fall back to offline distractors
			const filledOptions = fillWithDistractors(
				uniqueOptions,
				allAnswers,
				q.answer,
				q.manualOptions,
			);

			const entries = shuffle(Array.from(filledOptions.entries()));
			let correctOptionId = "";
			const options: Option[] = entries.map(
				([_, { text, isCorrect, explanation }], i) => {
					const id = `${q.id}-opt-${i}`;
					if (isCorrect) correctOptionId = id;
					return { id, text, explanation };
				},
			);

			return {
				...q,
				correctOptionId,
				options,
			};
		});
	} catch (error) {
		console.error(
			"Failed to generate distractors with AI, falling back to offline generator:",
			error,
		);
		return prepareQuizOptions(data);
	}
}

export async function generateQuizFromText(
	text: string,
	provider: AIProvider,
	apiKey: string,
	quantity = 5,
	mode: DifficultyMode = "normal",
): Promise<Question[]> {
	if (!apiKey.trim()) {
		throw new Error("Chave de API inválida ou ausente.");
	}

	let result: AIQuizGenerationResult;
	if (provider === "gemini") {
		result = await generateQuizFromTextWithGemini(text, apiKey, quantity, mode);
	} else if (provider === "groq") {
		result = await generateQuizFromTextWithGroq(text, apiKey, quantity, mode);
	} else if (provider === "openai") {
		result = await generateQuizFromTextWithOpenAI(text, apiKey, quantity, mode);
	} else {
		throw new Error("Provedor de IA desconhecido");
	}

	const questions: Question[] = result.questions.map((q, i) => {
		const qId = `q-ai-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 11)}`;

		const distractorsList = q.distractors.map((d) => {
			if (typeof d === "string") {
				return { text: d, explanation: undefined };
			}
			return { text: d.text, explanation: d.explanation };
		});

		const optionsList = [
			{
				id: `${qId}-opt-0`,
				text: q.answer,
				isCorrect: true,
				explanation: q.answerExplanation,
			},
			{
				id: `${qId}-opt-1`,
				text: distractorsList[0]?.text || "",
				isCorrect: false,
				explanation: distractorsList[0]?.explanation,
			},
			{
				id: `${qId}-opt-2`,
				text: distractorsList[1]?.text || "",
				isCorrect: false,
				explanation: distractorsList[1]?.explanation,
			},
			{
				id: `${qId}-opt-3`,
				text: distractorsList[2]?.text || "",
				isCorrect: false,
				explanation: distractorsList[2]?.explanation,
			},
		];
		// Embaralha as opções
		const shuffledOptions = shuffle(optionsList);
		const correctOpt = shuffledOptions.find((o) => o.isCorrect);

		const manualOptionsText = distractorsList.map((d) => d.text);

		return {
			id: qId,
			question: q.question,
			answer: q.answer,
			correctOptionId: correctOpt?.id || "",
			manualOptions: manualOptionsText,
			options: shuffledOptions.map((o) => ({
				id: o.id,
				text: o.text,
				explanation: o.explanation,
			})),
		};
	});

	return questions;
}
