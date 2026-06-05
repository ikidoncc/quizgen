import { useCallback, useEffect, useState } from "react";
import { STORAGE_VERSION } from "../types";
import type { Question, QuizState, Tab } from "../types";
import { TIMER_DURATION } from "../utils/quiz";

const INITIAL_STATE: QuizState = {
	version: STORAGE_VERSION,
	gameId: 0,
	currentTab: "create",
	quizData: [],
	currentQuestionIndex: 0,
	score: 0,
	skippedCount: 0,
	isTimerEnabled: false,
	timeLeft: TIMER_DURATION,
};

export function useQuizState() {
	const [state, setState] = useState<QuizState>(() => {
		const saved = localStorage.getItem("quizgen_state");
		if (saved) {
			try {
				const parsed = JSON.parse(saved);
				if (parsed.version === STORAGE_VERSION) return parsed;
				console.warn("Storage version mismatch, resetting state");
			} catch (e) {
				console.error("Error loading saved state", e);
			}
		}
		return INITIAL_STATE;
	});

	useEffect(() => {
		localStorage.setItem("quizgen_state", JSON.stringify(state));
	}, [state]);

	const setTab = useCallback((tab: Tab) => {
		setState((s) => ({ ...s, currentTab: tab }));
	}, []);

	const setQuizData = useCallback((data: Question[], timerEnabled: boolean) => {
		setState((s) => ({
			...s,
			quizData: data,
			isTimerEnabled: timerEnabled,
			currentQuestionIndex: 0,
			score: 0,
			skippedCount: 0,
			timeLeft: TIMER_DURATION,
			currentTab: "play",
			gameId: s.gameId + 1,
		}));
	}, []);

	const resetQuiz = useCallback(() => {
		setState((s) => ({
			...s,
			currentQuestionIndex: 0,
			score: 0,
			skippedCount: 0,
			timeLeft: TIMER_DURATION,
			gameId: s.gameId + 1,
		}));
	}, []);

	const deleteQuiz = useCallback(() => {
		setState(() => ({ ...INITIAL_STATE }));
	}, []);

	const answerQuestion = useCallback((isCorrect: boolean) => {
		setState((s) => ({
			...s,
			score: isCorrect ? s.score + 1 : s.score,
			currentQuestionIndex: s.currentQuestionIndex + 1,
			timeLeft: TIMER_DURATION,
		}));
	}, []);

	const skipQuestion = useCallback(() => {
		setState((s) => ({
			...s,
			skippedCount: s.skippedCount + 1,
			currentQuestionIndex: s.currentQuestionIndex + 1,
			timeLeft: TIMER_DURATION,
		}));
	}, []);

	const setTimeLeft = useCallback((time: number) => {
		setState((s) => ({ ...s, timeLeft: time }));
	}, []);

	return {
		state,
		setTab,
		setQuizData,
		resetQuiz,
		deleteQuiz,
		answerQuestion,
		skipQuestion,
		setTimeLeft,
	};
}
