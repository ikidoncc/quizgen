import type { Question } from "../types";

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

/**
 * Prepares options for each question (manual + automatic distractors).
 */
export function prepareQuizOptions(
	data: Omit<Question, "options">[],
): Question[] {
	const allAnswers = data.map((q) => q.answer);

	return data.map((q) => {
		const uniqueOptionsMap = new Map<string, string>();

		const addIfUnique = (text: string) => {
			const normalized = normalizeText(text);
			if (!uniqueOptionsMap.has(normalized) && normalized !== "") {
				uniqueOptionsMap.set(normalized, text);
			}
		};

		addIfUnique(q.answer);
		for (const opt of q.manualOptions) {
			addIfUnique(opt);
		}

		let options = Array.from(uniqueOptionsMap.values());

		if (options.length < 4) {
			const otherAnswers = allAnswers.filter((a) => {
				const normA = normalizeText(a);
				const normCorrect = normalizeText(q.answer);
				return (
					normA !== normCorrect &&
					!q.manualOptions.map(normalizeText).includes(normA)
				);
			});

			const shuffledOthers = otherAnswers.sort(() => 0.5 - Math.random());

			while (options.length < 4 && shuffledOthers.length > 0) {
				const popped = shuffledOthers.pop();
				if (popped !== undefined) {
					addIfUnique(popped);
					options = Array.from(uniqueOptionsMap.values());
				}
			}
		}

		return {
			...q,
			options: options.sort(() => 0.5 - Math.random()),
		} as Question;
	});
}
