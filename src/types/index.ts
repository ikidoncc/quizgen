export type Tab = 'create' | 'play';
export type Theme = 'light' | 'dark' | 'auto';

export interface Question {
  question: string;
  answer: string;
  manualOptions: string[];
  options: string[];
}

export interface QuizState {
  currentTab: Tab;
  quizData: Question[];
  currentQuestionIndex: number;
  score: number;
  skippedCount: number;
  currentTheme: Theme;
  isTimerEnabled: boolean;
  timeLeft: number;
}
