export type Tab = "create" | "play" | "history";
export type Theme = "light" | "dark" | "auto";
export type DifficultyMode = "easy" | "normal" | "hard";

export interface Option {
	id: string;
	text: string;
}

export interface Question {
	id: string;
	question: string;
	answer: string;
	correctOptionId: string;
	manualOptions: string[];
	options: Option[];
}

export const STORAGE_VERSION = 4;

export interface QuizState {
	version: number;
	gameId: number;
	currentTab: Tab;
	quizData: Question[];
	currentQuestionIndex: number;
	score: number;
	skippedCount: number;
	isTimerEnabled: boolean;
	timeLeft: number;
	currentHistoryId: string;
}

export interface HistoryEntry {
	id: string;
	createdAt: string;
	completedAt?: string;
	title: string;
	questionCount: number;
	score?: number;
	skippedCount?: number;
	isTimerEnabled: boolean;
	quizData: Question[];
}
