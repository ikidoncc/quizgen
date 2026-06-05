import { useState, useEffect } from 'react';
import type { Question, Tab, QuizState } from '../types';

const INITIAL_STATE: QuizState = {
  currentTab: 'create',
  quizData: [],
  currentQuestionIndex: 0,
  score: 0,
  skippedCount: 0,
  currentTheme: 'auto',
  isTimerEnabled: false,
  timeLeft: 60
};

export function useQuizState() {
  const [state, setState] = useState<QuizState>(() => {
    const saved = localStorage.getItem('quizgen_state');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error loading saved state", e);
      }
    }
    return INITIAL_STATE;
  });

  useEffect(() => {
    localStorage.setItem('quizgen_state', JSON.stringify(state));
  }, [state]);

  const setTab = (tab: Tab) => setState(s => ({ ...s, currentTab: tab }));
  
  const setQuizData = (data: Question[], timerEnabled: boolean) => setState(s => ({
    ...s,
    quizData: data,
    isTimerEnabled: timerEnabled,
    currentQuestionIndex: 0,
    score: 0,
    skippedCount: 0,
    timeLeft: 60,
    currentTab: 'play'
  }));

  const resetQuiz = () => setState(s => ({
    ...s,
    currentQuestionIndex: 0,
    score: 0,
    skippedCount: 0,
    timeLeft: 60
  }));

  const deleteQuiz = () => setState(s => ({
    ...INITIAL_STATE,
    currentTheme: s.currentTheme // Preserve theme
  }));

  const advanceQuestion = (isCorrect: boolean, isSkip: boolean = false) => {
    setState(s => ({
      ...s,
      score: isCorrect ? s.score + 1 : s.score,
      skippedCount: isSkip ? s.skippedCount + 1 : s.skippedCount,
      currentQuestionIndex: s.currentQuestionIndex + 1,
      timeLeft: 60
    }));
  };

  const setTimeLeft = (time: number) => setState(s => ({ ...s, timeLeft: time }));

  return {
    state,
    setTab,
    setQuizData,
    resetQuiz,
    deleteQuiz,
    advanceQuestion,
    setTimeLeft
  };
}
