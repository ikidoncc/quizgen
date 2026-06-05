import type { Option, Question } from "../types";

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
): Map<string, { text: string; isCorrect: boolean }> {
	const map = new Map<string, { text: string; isCorrect: boolean }>();

	const addIfUnique = (text: string, isCorrect: boolean) => {
		if (text === "") return;
		const key = text.toLowerCase().trim();
		if (!map.has(key)) {
			map.set(key, { text, isCorrect });
		}
	};

	addIfUnique(q.answer, true);
	for (const opt of q.manualOptions) {
		addIfUnique(opt, false);
	}

	return map;
}

function fillWithDistractors(
	options: Map<string, { text: string; isCorrect: boolean }>,
	allAnswers: string[],
	correctAnswer: string,
	manualOptions: string[],
): Map<string, { text: string; isCorrect: boolean }> {
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

export function prepareQuizOptions(
	data: Omit<Question, "options" | "correctOptionId">[],
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

		const entries = shuffle(Array.from(filledOptions.entries()));
		let correctOptionId = "";
		const options: Option[] = entries.map(([_, { text, isCorrect }], i) => {
			const id = `${q.id}-opt-${i}`;
			if (isCorrect) correctOptionId = id;
			return { id, text };
		});

		return {
			...q,
			correctOptionId,
			options,
		};
	});
}
