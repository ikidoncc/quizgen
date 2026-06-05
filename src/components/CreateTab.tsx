import React, { useState } from 'react';
import { Question } from '../types';
import { parseQuizText, prepareQuizOptions } from '../utils/quiz';

interface CreateTabProps {
  onGenerate: (data: Question[], timerEnabled: boolean) => void;
  initialTimerEnabled: boolean;
  onError: (message: string) => void;
}

export const CreateTab: React.FC<CreateTabProps> = ({ onGenerate, initialTimerEnabled, onError }) => {
  const [input, setInput] = useState('');
  const [timerEnabled, setTimerEnabled] = useState(initialTimerEnabled);

  const handleGenerate = () => {
    const parsedData = parseQuizText(input);
    
    if (parsedData.length === 0) {
      onError('Nenhuma pergunta encontrada. Use o formato Q: Pergunta e A: Resposta.');
      return;
    }

    const quizData = prepareQuizOptions(parsedData);
    onGenerate(quizData, timerEnabled);
  };

  return (
    <div className="bg-surface p-6 rounded-lg shadow-md border border-overlay transition-all animate-in fade-in slide-in-from-bottom-2 duration-300">
      <h2 className="text-xl font-semibold mb-4 text-main font-serif">Colar Conteúdo</h2>
      <p class="text-sm text-subtle mb-4">Formato:</p>
      <pre className="bg-overlay p-2 rounded text-xs mb-4 text-muted border border-overlay overflow-x-auto">
        {`Q: Pergunta?\nA: Resposta\nO: Opção Incorreta (Opcional)`}
      </pre>
      
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className="w-full h-64 p-3 bg-base border border-overlay text-main rounded-md focus:ring-2 focus:ring-iris focus:outline-none mb-4 transition-all placeholder:text-muted/50"
        placeholder="Cole seu texto aqui..."
      />
      
      <div className="flex items-center mb-6">
        <input
          type="checkbox"
          id="timer-checkbox"
          checked={timerEnabled}
          onChange={(e) => setTimerEnabled(e.target.checked)}
          className="w-4 h-4 text-iris bg-base border-overlay rounded focus:ring-iris focus:ring-2 cursor-pointer transition-all"
        />
        <label htmlFor="timer-checkbox" className="ml-2 text-sm font-medium text-main cursor-pointer select-none">
          Habilitar temporizador (1 minuto por questão)
        </label>
      </div>

      <button
        onClick={handleGenerate}
        className="w-full bg-iris text-surface font-bold py-3 px-4 rounded hover:opacity-90 transition-all active:scale-[0.98] shadow-sm"
      >
        Gerar Quizz
      </button>
    </div>
  );
};
