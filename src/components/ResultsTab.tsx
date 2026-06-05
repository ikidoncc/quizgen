import React from 'react';

interface ResultsTabProps {
  score: number;
  totalQuestions: number;
  skippedCount: number;
  onNewQuiz: () => void;
}

export const ResultsTab: React.FC<ResultsTabProps> = ({
  score,
  totalQuestions,
  skippedCount,
  onNewQuiz
}) => {
  const wrongCount = totalQuestions - score - skippedCount;

  return (
    <div className="bg-surface p-8 rounded-lg shadow-md text-center border border-overlay transition-all animate-in zoom-in duration-300">
      <h2 className="text-2xl font-bold mb-4 text-main font-serif">Quizz Finalizado!</h2>
      <p className="text-5xl font-bold text-iris mb-6 tracking-tighter">
        {score} <span class="text-2xl text-muted font-normal">/ {totalQuestions}</span>
      </p>
      
      <div className="grid grid-cols-3 gap-4 mb-8 text-sm">
        <div className="bg-pine/10 p-4 rounded-xl border border-pine/20">
          <span className="block text-pine font-bold text-xl">{score}</span>
          <span className="text-pine/80 font-medium">Acertos</span>
        </div>
        <div className="bg-gold/10 p-4 rounded-xl border border-gold/20">
          <span className="block text-gold font-bold text-xl">{skippedCount}</span>
          <span className="text-gold/80 font-medium">Puladas</span>
        </div>
        <div className="bg-love/10 p-4 rounded-xl border border-love/20">
          <span className="block text-love font-bold text-xl">{wrongCount}</span>
          <span className="text-love/80 font-medium">Erros</span>
        </div>
      </div>

      <p className="text-subtle mb-8 italic">
        {score === totalQuestions ? '🏆 Desempenho perfeito! Parabéns!' : 'Ótimo esforço! Continue praticando.'}
      </p>

      <button
        onClick={onNewQuiz}
        className="w-full bg-iris text-surface font-bold py-3 px-8 rounded-xl hover:opacity-90 transition-all active:scale-[0.98] shadow-sm"
      >
        Novo Quizz
      </button>
    </div>
  );
};
