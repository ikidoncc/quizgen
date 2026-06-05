import React, { useState, useEffect } from 'react';
import type { Question } from '../types';
import { normalizeText } from '../utils/quiz';
import { useTimer } from '../hooks/useTimer';
import { RotateCcw, Trash2, ArrowRight, SkipForward, CheckCircle, AlertTriangle } from 'lucide-react';

interface PlayTabProps {
  quizData: Question[];
  currentQuestionIndex: number;
  score: number;
  skippedCount?: number;
  isTimerEnabled: boolean;
  timeLeft: number;
  onAnswer: (isCorrect: boolean) => void;
  onSkip: () => void;
  onReset: () => void;
  onDelete: () => void;
  onTick: (time: number) => void;
}

export const PlayTab: React.FC<PlayTabProps> = ({
  quizData,
  currentQuestionIndex,
  score,
  isTimerEnabled,
  timeLeft,
  onAnswer,
  onSkip,
  onReset,
  onDelete,
  onTick
}) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isAnswering, setIsAnswering] = useState(true);

  const currentQ = quizData[currentQuestionIndex];

  const { stopTimer } = useTimer(
    isTimerEnabled && isAnswering,
    timeLeft,
    onTick,
    () => onSkip() // onTimeout
  );

  useEffect(() => {
    setSelectedOption(null);
    setShowFeedback(false);
    setIsAnswering(true);
  }, [currentQuestionIndex]);

  const handleOptionClick = (option: string) => {
    if (!isAnswering) return;
    
    stopTimer();
    setIsAnswering(false);
    setSelectedOption(option);
    setShowFeedback(true);
  };

  const handleNext = () => {
    const isCorrect = normalizeText(selectedOption || '') === normalizeText(currentQ.answer);
    onAnswer(isCorrect);
  };

  const normalizedCorrect = normalizeText(currentQ.answer);
  const isCorrectSelection = selectedOption && normalizeText(selectedOption) === normalizedCorrect;

  return (
    <div className="bg-surface p-6 rounded-lg shadow-md border border-overlay transition-all animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex justify-between items-center mb-4 pb-4 border-b border-overlay">
        <div className="flex space-x-2">
          <button
            onClick={onReset}
            className="flex items-center text-xs bg-overlay hover:opacity-80 text-main py-1 px-2 rounded transition-all active:scale-95"
          >
            <RotateCcw className="w-3 h-3 mr-1" />
            Reiniciar
          </button>
          <button
            onClick={onDelete}
            className="flex items-center text-xs bg-danger/10 hover:bg-danger/20 text-danger py-1 px-2 rounded transition-all active:scale-95"
          >
            <Trash2 className="w-3 h-3 mr-1" />
            Excluir
          </button>
        </div>
        <div className="text-right">
          <span className="block text-xs font-medium text-muted">
            Pergunta {currentQuestionIndex + 1} de {quizData.length}
          </span>
          <span className="block text-xs font-medium text-primary font-bold">
            Pontos: {score}
          </span>
          {isTimerEnabled && (
            <span className={`block text-xs font-bold mt-1 transition-colors ${timeLeft <= 10 ? 'text-danger animate-pulse' : 'text-primary'}`}>
              Tempo: {timeLeft}s
            </span>
          )}
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-lg font-medium text-main leading-relaxed">
          {currentQ.question}
        </h3>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {currentQ.options.map((option, index) => {
          const isSelected = selectedOption === option;
          const normOption = normalizeText(option);
          const isActuallyCorrect = normOption === normalizedCorrect;
          
          let btnClass = "border-overlay text-main hover:border-primary hover:bg-primary/5";
          if (showFeedback) {
            if (isActuallyCorrect) {
              btnClass = "border-secondary bg-secondary/10 text-secondary font-bold";
            } else if (isSelected) {
              btnClass = "border-danger bg-danger/10 text-danger font-bold";
            } else {
              btnClass = "border-overlay text-muted opacity-50";
            }
          }

          return (
            <button
              key={index}
              disabled={!isAnswering}
              onClick={() => handleOptionClick(option)}
              className={`w-full text-left p-4 border-2 rounded-xl transition-all duration-200 ${btnClass} ${isAnswering ? 'active:scale-[0.99]' : ''}`}
            >
              {option}
            </button>
          );
        })}
      </div>

      {showFeedback && (
        <div className={`mt-6 p-4 rounded-xl flex items-center justify-center font-bold animate-in zoom-in duration-300 ${
          isCorrectSelection ? 'bg-secondary/10 text-secondary border border-secondary/20' : 'bg-danger/10 text-danger border border-danger/20'
        }`}>
          {isCorrectSelection ? (
            <><CheckCircle className="w-5 h-5 mr-2" /> Correto!</>
          ) : (
            <><AlertTriangle className="w-5 h-5 mr-2" /> Incorreto. A resposta era: {currentQ.answer}</>
          )}
        </div>
      )}

      <div className="mt-6 space-y-2">
        {showFeedback ? (
          <button
            onClick={handleNext}
            className="w-full flex items-center justify-center bg-primary text-white font-bold py-3 px-4 rounded-xl hover:opacity-90 transition-all active:scale-[0.98] shadow-sm animate-in slide-in-from-bottom-1"
          >
            {currentQuestionIndex + 1 === quizData.length ? 'Ver Resultado' : 'Próxima Pergunta'}
            <ArrowRight className="w-5 h-5 ml-2" />
          </button>
        ) : (
          <button
            onClick={onSkip}
            className="w-full flex items-center justify-center bg-surface border-2 border-overlay text-subtle font-bold py-3 px-4 rounded-xl hover:border-muted hover:bg-overlay/20 transition-all active:scale-[0.98]"
          >
            <SkipForward className="w-5 h-5 mr-2" />
            Pular Pergunta
          </button>
        )}
      </div>
    </div>
  );
};
