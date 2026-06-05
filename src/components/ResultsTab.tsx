import { RefreshCw, Trophy } from "lucide-react";
import type React from "react";

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
	onNewQuiz,
}) => {
	const wrongCount = totalQuestions - score - skippedCount;

	return (
		<div className="bg-surface p-8 rounded-lg shadow-md text-center border border-overlay transition-all animate-in zoom-in duration-300">
			<div className="flex justify-center mb-4">
				<Trophy className="w-12 h-12 text-warning" />
			</div>
			<h2 className="text-2xl font-bold mb-4 text-main font-serif">
				Quizz Finalizado!
			</h2>
			<p className="text-5xl font-bold text-primary mb-6 tracking-tighter">
				{score}{" "}
				<span className="text-2xl text-muted font-normal">
					/ {totalQuestions}
				</span>
			</p>

			<div className="grid grid-cols-3 gap-4 mb-8 text-sm">
				<div className="bg-secondary/10 p-4 rounded-xl border border-secondary/20">
					<span className="block text-secondary font-bold text-xl">
						{score}
					</span>
					<span className="text-secondary/80 font-medium">Acertos</span>
				</div>
				<div className="bg-warning/10 p-4 rounded-xl border border-warning/20">
					<span className="block text-warning font-bold text-xl">
						{skippedCount}
					</span>
					<span className="text-warning/80 font-medium">Puladas</span>
				</div>
				<div className="bg-danger/10 p-4 rounded-xl border border-danger/20">
					<span className="block text-danger font-bold text-xl">
						{wrongCount}
					</span>
					<span className="text-danger/80 font-medium">Erros</span>
				</div>
			</div>

			<p className="text-subtle mb-8 italic">
				{score === totalQuestions
					? "Desempenho perfeito! Parabéns!"
					: "Ótimo esforço! Continue praticando."}
			</p>

			<button
				onClick={onNewQuiz}
				className="w-full flex items-center justify-center bg-primary text-white font-bold py-3 px-8 rounded-xl hover:opacity-90 transition-all active:scale-[0.98] shadow-sm"
			>
				<RefreshCw className="w-5 h-5 mr-2" />
				Novo Quizz
			</button>
		</div>
	);
};
