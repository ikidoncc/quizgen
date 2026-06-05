import type { Question } from "../types";

export const TIMER_DURATION = 60;

/**
 * Normalizes text for robust comparison.
 */
export function normalizeText(text: string): string {
	if (!text) return "";
	return text
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/[\u200B-\u200D\uFEFF]/g, "")
		.replace(/\s+/g, " ")
		.trim()
		.toLowerCase();
}

function shuffle<T>(array: T[]): T[] {
	const result = [...array];
	for (let i = result.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[result[i], result[j]] = [result[j], result[i]];
	}
	return result;
}

/**
 * Parses quiz text from input string.
 */
export function parseQuizText(input: string): Question[] {
	const lines = input.split("\n");
	const parsedData: Question[] = [];
	let currentQ: Partial<Question> | null = null;

	lines.forEach((line) => {
		const trimmed = line.trim();
		if (trimmed.toLowerCase().startsWith("q:")) {
			currentQ = {
				question: trimmed.substring(2).trim(),
				answer: "",
				manualOptions: [],
			};
		} else if (trimmed.toLowerCase().startsWith("a:") && currentQ) {
			currentQ.answer = trimmed.substring(2).trim();
			parsedData.push(currentQ as Question);
		} else if (
			trimmed.toLowerCase().startsWith("o:") &&
			currentQ?.manualOptions
		) {
			currentQ.manualOptions.push(trimmed.substring(2).trim());
		}
	});

	return parsedData;
}

function collectUniqueOptions(q: {
	answer: string;
	manualOptions: string[];
}): Map<string, string> {
	const map = new Map<string, string>();

	const addIfUnique = (text: string) => {
		const normalized = normalizeText(text);
		if (!map.has(normalized) && normalized !== "") {
			map.set(normalized, text);
		}
	};

	addIfUnique(q.answer);
	for (const opt of q.manualOptions) {
		addIfUnique(opt);
	}

	return map;
}

function fillWithDistractors(
	options: Map<string, string>,
	allAnswers: string[],
	correctAnswer: string,
	manualOptions: string[],
): Map<string, string> {
	const result = new Map(options);

	if (result.size >= 4) return result;

	const otherAnswers = allAnswers.filter((a) => {
		const normA = normalizeText(a);
		const normCorrect = normalizeText(correctAnswer);
		return (
			normA !== normCorrect && !manualOptions.map(normalizeText).includes(normA)
		);
	});

	for (const answer of shuffle(otherAnswers)) {
		if (result.size >= 4) break;
		const normalized = normalizeText(answer);
		if (!result.has(normalized) && normalized !== "") {
			result.set(normalized, answer);
		}
	}

	return result;
}

/**
 * Prepares options for each question (manual + automatic distractors).
 */
export function prepareQuizOptions(
	data: Omit<Question, "options">[],
): Question[] {
	const allAnswers = data.map((q) => q.answer);

	return data.map((q) => {
		const uniqueOptions = collectUniqueOptions(q);
		const filledOptions = fillWithDistractors(
			uniqueOptions,
			allAnswers,
			q.answer,
			q.manualOptions,
		);

		return {
			...q,
			options: shuffle(Array.from(filledOptions.values())),
		} as Question;
	});
}
