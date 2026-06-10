import { useCallback } from "react";
import type { FlashcardSet, Question, QuizState, Tab } from "../types";
import { STORAGE_VERSION } from "../types";
import { usePersistedState } from "./usePersistedState";

const INITIAL_STATE: QuizState = {
	version: STORAGE_VERSION,
	gameId: 0,
	currentTab: "quiz-create",
	quizData: [],
	currentQuestionIndex: 0,
	score: 0,
	skippedCount: 0,
	isTimerEnabled: false,
	timerDuration: 60,
	timeLeft: 60,
	currentHistoryId: "",
	flashcardHistory: [],
	currentFlashcardSet: null,
	currentCardIndex: 0,
	cardsMastered: [],
	cardsToReview: [],
	cardsPartial: [],
};

function isQuizState(value: unknown): value is QuizState {
	if (typeof value !== "object" || value === null) return false;
	// biome-ignore lint/suspicious/noExplicitAny: needed for dynamic state schema migration
	const val = value as any;

	// Automatic state migration to current version structure
	if (val.version !== STORAGE_VERSION) {
		val.version = STORAGE_VERSION;
		if (!Array.isArray(val.flashcardHistory)) {
			val.flashcardHistory = [];
		}
		if (val.currentFlashcardSet === undefined) {
			val.currentFlashcardSet = null;
		}
		if (typeof val.currentCardIndex !== "number") {
			val.currentCardIndex = 0;
		}
		if (!Array.isArray(val.cardsMastered)) {
			val.cardsMastered = [];
		}
		if (!Array.isArray(val.cardsToReview)) {
			val.cardsToReview = [];
		}
		if (!Array.isArray(val.cardsPartial)) {
			val.cardsPartial = [];
		}
	}

	return true;
}

export function useQuizState() {
	const [state, setState] = usePersistedState<QuizState>(
		"boron_state", // Atualizado para a nova marca do projeto
		INITIAL_STATE,
		isQuizState,
	);

	const setTab = useCallback(
		(tab: Tab) => {
			setState((s) => ({ ...s, currentTab: tab }));
		},
		[setState],
	);

	const setQuizData = useCallback(
		(
			data: Question[],
			timerEnabled: boolean,
			timerDuration: number,
			historyId?: string,
		) => {
			setState((s) => ({
				...s,
				quizData: data,
				isTimerEnabled: timerEnabled,
				timerDuration: timerDuration,
				currentQuestionIndex: 0,
				score: 0,
				skippedCount: 0,
				timeLeft: timerDuration,
				currentTab: "quiz-play",
				gameId: s.gameId + 1,
				currentHistoryId: historyId ?? s.currentHistoryId,
			}));
		},
		[setState],
	);

	const resetQuiz = useCallback(() => {
		setState((s) => ({
			...s,
			currentQuestionIndex: 0,
			score: 0,
			skippedCount: 0,
			timeLeft: s.timerDuration || 60,
			gameId: s.gameId + 1,
		}));
	}, [setState]);

	const deleteQuiz = useCallback(() => {
		setState((s) => ({
			...s,
			gameId: s.gameId + 1,
			quizData: [],
			currentQuestionIndex: 0,
			score: 0,
			skippedCount: 0,
			timeLeft: s.timerDuration || 60,
			currentHistoryId: "",
			currentTab: "quiz-create",
		}));
	}, [setState]);

	const setHistoryId = useCallback(
		(id: string) => {
			setState((s) => ({ ...s, currentHistoryId: id }));
		},
		[setState],
	);

	const answerQuestion = useCallback(
		(isCorrect: boolean, selectedOptionId?: string) => {
			setState((s) => {
				const updatedQuizData = s.quizData.map((q, idx) =>
					idx === s.currentQuestionIndex ? { ...q, selectedOptionId } : q,
				);
				return {
					...s,
					quizData: updatedQuizData,
					score: isCorrect ? s.score + 1 : s.score,
					currentQuestionIndex: s.currentQuestionIndex + 1,
					timeLeft: s.timerDuration || 60,
				};
			});
		},
		[setState],
	);

	const skipQuestion = useCallback(() => {
		setState((s) => {
			const updatedQuizData = s.quizData.map((q, idx) =>
				idx === s.currentQuestionIndex
					? { ...q, selectedOptionId: "skipped" }
					: q,
			);
			return {
				...s,
				quizData: updatedQuizData,
				skippedCount: s.skippedCount + 1,
				currentQuestionIndex: s.currentQuestionIndex + 1,
				timeLeft: s.timerDuration || 60,
			};
		});
	}, [setState]);

	const setTimeLeft = useCallback(
		(time: number) => {
			setState((s) => ({ ...s, timeLeft: time }));
		},
		[setState],
	);

	// Flashcards Actions
	const setFlashcardSet = useCallback(
		(set: FlashcardSet | null) => {
			setState((s) => ({
				...s,
				currentFlashcardSet: set,
				currentCardIndex: 0,
				cardsMastered: [],
				cardsToReview: [],
				cardsPartial: [],
				currentTab: set ? "flashcard-study" : s.currentTab,
			}));
		},
		[setState],
	);

	const addFlashcardSet = useCallback(
		(set: FlashcardSet) => {
			setState((s) => ({
				...s,
				flashcardHistory: [set, ...s.flashcardHistory],
				currentFlashcardSet: set,
				currentCardIndex: 0,
				cardsMastered: [],
				cardsToReview: [],
				cardsPartial: [],
				currentTab: "flashcard-study",
			}));
		},
		[setState],
	);

	const deleteFlashcardSet = useCallback(
		(id: string) => {
			setState((s) => {
				const nextHistory = s.flashcardHistory.filter((x) => x.id !== id);
				const isCurrent = s.currentFlashcardSet?.id === id;
				return {
					...s,
					flashcardHistory: nextHistory,
					currentFlashcardSet: isCurrent ? null : s.currentFlashcardSet,
					currentTab: isCurrent ? "flashcard-history" : s.currentTab,
				};
			});
		},
		[setState],
	);

	const selectCardFeedback = useCallback(
		(cardId: string, type: "master" | "review" | "partial") => {
			setState((s) => {
				const mastered =
					type === "master"
						? [...s.cardsMastered.filter((id) => id !== cardId), cardId]
						: s.cardsMastered.filter((id) => id !== cardId);
				const review =
					type === "review"
						? [...s.cardsToReview.filter((id) => id !== cardId), cardId]
						: s.cardsToReview.filter((id) => id !== cardId);
				const partial =
					type === "partial"
						? [...(s.cardsPartial || []).filter((id) => id !== cardId), cardId]
						: (s.cardsPartial || []).filter((id) => id !== cardId);

				// Encontra o próximo card que ainda não está dominado
				const cards = s.currentFlashcardSet?.cards || [];
				let nextIndex = s.currentCardIndex + 1;

				// Procuramos o próximo index que não esteja no novo set de dominados
				const masteredSet = new Set(mastered);
				while (
					nextIndex < cards.length &&
					masteredSet.has(cards[nextIndex].id)
				) {
					nextIndex++;
				}

				return {
					...s,
					cardsMastered: mastered,
					cardsToReview: review,
					cardsPartial: partial,
					currentCardIndex: nextIndex,
				};
			});
		},
		[setState],
	);

	const resetFlashcardStudy = useCallback(
		(onlyReview = false) => {
			setState((s) => {
				if (!s.currentFlashcardSet) return s;
				const cards = s.currentFlashcardSet.cards;

				let nextMastered: string[] = [];
				let nextIndex = 0;

				if (onlyReview) {
					// As dominadas serão todas, EXCETO as que estão na lista de revisão ou parcial
					const reviewOrPartialSet = new Set([
						...s.cardsToReview,
						...(s.cardsPartial || []),
					]);
					nextMastered = cards
						.filter((c) => !reviewOrPartialSet.has(c.id))
						.map((c) => c.id);

					// Achar a primeira que precisa de revisão para começar dali
					const masteredSet = new Set(nextMastered);
					while (
						nextIndex < cards.length &&
						masteredSet.has(cards[nextIndex].id)
					) {
						nextIndex++;
					}
				}

				return {
					...s,
					currentCardIndex: nextIndex,
					cardsMastered: nextMastered,
					cardsToReview: onlyReview ? s.cardsToReview : [],
					cardsPartial: onlyReview ? s.cardsPartial || [] : [],
				};
			});
		},
		[setState],
	);

	return {
		state,
		setTab,
		setQuizData,
		resetQuiz,
		deleteQuiz,
		answerQuestion,
		skipQuestion,
		setTimeLeft,
		setHistoryId,
		// Flashcards
		setFlashcardSet,
		addFlashcardSet,
		deleteFlashcardSet,
		selectCardFeedback,
		resetFlashcardStudy,
	};
}
