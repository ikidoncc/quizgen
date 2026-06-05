export type Tab = "create" | "play";
export type Theme = "light" | "dark" | "auto";

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

export const STORAGE_VERSION = 3;

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
}
