import { RefreshCw, Trophy } from "lucide-react";
import type React from "react";
import { useTranslation } from "../i18n/I18nProvider";

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
	const { t } = useTranslation();
	const wrongCount = totalQuestions - score - skippedCount;

	return (
		<div className="zoom-in animate-in rounded-lg border border-overlay bg-surface p-8 text-center shadow-md transition-all duration-300">
			<div className="mb-4 flex justify-center">
				<Trophy className="h-12 w-12 text-warning" />
			</div>
			<h2 className="mb-4 font-bold text-2xl text-main">
				{t("results.title")}
			</h2>
			<p className="mb-6 font-bold text-5xl text-primary tracking-tighter">
				{score}{" "}
				<span className="font-normal text-2xl text-muted">
					/ {totalQuestions}
				</span>
			</p>

			<div className="mb-8 grid grid-cols-3 gap-4 text-sm">
				<div className="rounded-xl border border-secondary/20 bg-secondary/10 p-4">
					<span className="block font-bold text-secondary text-xl">
						{score}
					</span>
					<span className="font-medium text-secondary/80">
						{t("results.correctLabel")}
					</span>
				</div>
				<div className="rounded-xl border border-warning/20 bg-warning/10 p-4">
					<span className="block font-bold text-warning text-xl">
						{skippedCount}
					</span>
					<span className="font-medium text-warning/80">
						{t("results.skippedLabel")}
					</span>
				</div>
				<div className="rounded-xl border border-danger/20 bg-danger/10 p-4">
					<span className="block font-bold text-danger text-xl">
						{wrongCount}
					</span>
					<span className="font-medium text-danger/80">
						{t("results.wrongLabel")}
					</span>
				</div>
			</div>

			<p className="mb-8 text-subtle italic">
				{score === totalQuestions
					? t("results.perfect")
					: t("results.goodEffort")}
			</p>

			<button
				onClick={onNewQuiz}
				className="flex w-full items-center justify-center rounded-xl bg-primary px-8 py-3 font-bold text-white shadow-sm transition-all hover:opacity-90 active:scale-[0.98]"
				type="button"
			>
				<RefreshCw className="mr-2 h-5 w-5" />
				{t("results.newQuiz")}
			</button>
		</div>
	);
};
