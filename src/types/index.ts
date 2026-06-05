export type Tab = "create" | "play";
export type Theme = "light" | "dark" | "auto";

export interface Question {
	question: string;
	answer: string;
	manualOptions: string[];
	options: string[];
}

export const STORAGE_VERSION = 1;

export interface QuizState {
	version: number;
	currentTab: Tab;
	quizData: Question[];
	currentQuestionIndex: number;
	score: number;
	skippedCount: number;
	isTimerEnabled: boolean;
	timeLeft: number;
}
