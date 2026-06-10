export type Tab =
	| "quiz-create"
	| "quiz-play"
	| "quiz-history"
	| "flashcard-create"
	| "flashcard-study"
	| "flashcard-history";
export type Theme = "light" | "dark" | "auto";
export type DifficultyMode = "easy" | "normal" | "hard";
export type AIProvider = "gemini" | "groq" | "openai";

export interface Option {
	id: string;
	text: string;
	explanation?: string;
}

export interface Question {
	id: string;
	question: string;
	answer: string;
	correctOptionId: string;
	manualOptions: string[];
	options: Option[];
	selectedOptionId?: string;
}

export interface Flashcard {
	id: string;
	front: string;
	back: string;
}

export interface FlashcardSet {
	id: string;
	title: string;
	createdAt: string;
	cards: Flashcard[];
}

export const STORAGE_VERSION = 7;

export interface QuizState {
	version: number;
	gameId: number;
	currentTab: Tab;
	quizData: Question[];
	currentQuestionIndex: number;
	score: number;
	skippedCount: number;
	isTimerEnabled: boolean;
	timerDuration: number;
	timeLeft: number;
	currentHistoryId: string;
	// Flashcard states
	flashcardHistory: FlashcardSet[];
	currentFlashcardSet: FlashcardSet | null;
	currentCardIndex: number;
	cardsMastered: string[];
	cardsToReview: string[];
	cardsPartial: string[];
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
	timerDuration?: number;
	quizData: Question[];
}
