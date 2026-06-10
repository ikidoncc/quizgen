import { useCallback } from "react";
import type { Question, QuizState, Tab } from "../types";
import { STORAGE_VERSION } from "../types";
import { usePersistedState } from "./usePersistedState";

const INITIAL_STATE: QuizState = {
	version: STORAGE_VERSION,
	gameId: 0,
	currentTab: "create",
	quizData: [],
	currentQuestionIndex: 0,
	score: 0,
	skippedCount: 0,
	isTimerEnabled: false,
	timerDuration: 60,
	timeLeft: 60,
	currentHistoryId: "",
};

function isQuizState(value: unknown): value is QuizState {
	return (
		typeof value === "object" &&
		value !== null &&
		(value as QuizState).version === STORAGE_VERSION
	);
}

export function useQuizState() {
	const [state, setState] = usePersistedState<QuizState>(
		"quizgen_state",
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
				currentTab: "play",
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
		setState(() => ({ ...INITIAL_STATE }));
	}, [setState]);

	const setHistoryId = useCallback(
		(id: string) => {
			setState((s) => ({ ...s, currentHistoryId: id }));
		},
		[setState],
	);

	const answerQuestion = useCallback(
		(isCorrect: boolean) => {
			setState((s) => ({
				...s,
				score: isCorrect ? s.score + 1 : s.score,
				currentQuestionIndex: s.currentQuestionIndex + 1,
				timeLeft: s.timerDuration || 60,
			}));
		},
		[setState],
	);

	const skipQuestion = useCallback(() => {
		setState((s) => ({
			...s,
			skippedCount: s.skippedCount + 1,
			currentQuestionIndex: s.currentQuestionIndex + 1,
			timeLeft: s.timerDuration || 60,
		}));
	}, [setState]);

	const setTimeLeft = useCallback(
		(time: number) => {
			setState((s) => ({ ...s, timeLeft: time }));
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
	};
}
