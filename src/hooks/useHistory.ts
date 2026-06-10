import { useCallback } from "react";
import type { HistoryEntry, Question } from "../types";
import { usePersistedState } from "./usePersistedState";

const MAX_ENTRIES = 20;

function generateId(): string {
	return crypto.randomUUID().slice(0, 8);
}

function isHistoryEntry(value: unknown): value is HistoryEntry[] {
	return Array.isArray(value) && value.every((e) => typeof e.id === "string");
}

export function getExportText(entry: HistoryEntry): string {
	return entry.quizData
		.map((q) => {
			const lines = [`Q: ${q.question}`, `A: ${q.answer}`];
			for (const opt of q.manualOptions) {
				lines.push(`O: ${opt}`);
			}
			return lines.join("\n");
		})
		.join("\n\n");
}

export function getExportFilename(entry: HistoryEntry): string {
	const title = entry.title
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-|-$/g, "")
		.slice(0, 30);
	const date = entry.createdAt.slice(0, 10);
	return `quiz-${title}-${date}.txt`;
}

export function useHistory() {
	const [entries, setEntries] = usePersistedState<HistoryEntry[]>(
		"quizgen_history",
		[],
		isHistoryEntry,
	);

	const addEntry = useCallback(
		(
			quizData: Question[],
			timerEnabled: boolean,
			timerDuration?: number,
		): string => {
			const id = generateId();
			const entry: HistoryEntry = {
				id,
				createdAt: new Date().toISOString(),
				title: quizData[0]?.question.slice(0, 60) ?? "Untitled",
				questionCount: quizData.length,
				isTimerEnabled: timerEnabled,
				timerDuration,
				quizData,
			};
			setEntries((prev) => [entry, ...prev].slice(0, MAX_ENTRIES));
			return id;
		},
		[setEntries],
	);

	const updateEntry = useCallback(
		(
			id: string,
			score: number,
			skippedCount: number,
			quizData?: Question[],
		) => {
			setEntries((prev) =>
				prev.map((e) =>
					e.id === id
						? {
								...e,
								completedAt: new Date().toISOString(),
								score,
								skippedCount,
								quizData: quizData ?? e.quizData,
							}
						: e,
				),
			);
		},
		[setEntries],
	);

	const deleteEntry = useCallback(
		(id: string) => {
			setEntries((prev) => prev.filter((e) => e.id !== id));
		},
		[setEntries],
	);

	return { entries, addEntry, updateEntry, deleteEntry };
}
