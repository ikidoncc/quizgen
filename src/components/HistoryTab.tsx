import { ClipboardCopy, Download, FileText, Play, Trash2 } from "lucide-react";
import type React from "react";
import { useCallback, useState } from "react";
import { getExportFilename, getExportText } from "../hooks/useHistory";
import { useTranslation } from "../i18n/I18nProvider";
import type { HistoryEntry } from "../types";
import { cn } from "../utils/cn";

interface HistoryTabProps {
	entries: HistoryEntry[];
	onPlayAgain: (entry: HistoryEntry) => void;
	onDelete: (id: string) => void;
}

function formatScore(score: number, total: number): string {
	const pct = total > 0 ? Math.round((score / total) * 100) : 0;
	return `${score} / ${total}  •  ${pct}%`;
}

export const HistoryTab: React.FC<HistoryTabProps> = ({
	entries,
	onPlayAgain,
	onDelete,
}) => {
	const { t } = useTranslation();
	const [expandedId, setExpandedId] = useState<string | null>(null);

	const handleCopy = useCallback(async (entry: HistoryEntry) => {
		try {
			await navigator.clipboard.writeText(getExportText(entry));
		} catch {
			// silently fail
		}
	}, []);

	const handleDownload = useCallback((entry: HistoryEntry) => {
		const text = getExportText(entry);
		const blob = new Blob([text], { type: "text/plain" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = getExportFilename(entry);
		a.click();
		URL.revokeObjectURL(url);
	}, []);

	const rd = useCallback(
		(isoDate: string): string => {
			const diff = Date.now() - new Date(isoDate).getTime();
			const days = Math.floor(diff / 86400000);
			if (days === 0) return t("history.today");
			if (days === 1) return t("history.yesterday");
			return t("history.daysAgo", { count: days });
		},
		[t],
	);

	if (entries.length === 0) {
		return (
			<div className="rounded-3xl border border-overlay border-dashed bg-surface/50 py-16 text-center">
				<FileText className="mx-auto mb-4 h-12 w-12 text-muted" />
				<p className="font-medium text-muted">{t("history.empty")}</p>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			{entries.map((entry) => {
				const isCompleted = entry.completedAt !== undefined;

				return (
					<div
						key={entry.id}
						className="fade-in slide-in-from-bottom-2 animate-in rounded-lg border border-overlay bg-surface p-4 shadow-sm transition-all duration-200"
					>
						<div className="mb-3 flex items-start justify-between">
							<div className="min-w-0 flex-1">
								<h3 className="truncate font-semibold text-main text-sm">
									{entry.title}
								</h3>
								<p className="mt-0.5 font-medium text-muted text-xs">
									{rd(entry.createdAt)}
								</p>
							</div>
							<span
								className={cn(
									"ml-3 shrink-0 rounded-full px-2.5 py-0.5 font-bold text-xs",
									isCompleted
										? "bg-secondary/10 text-secondary"
										: "bg-overlay text-muted",
								)}
							>
								{isCompleted
									? formatScore(entry.score ?? 0, entry.questionCount)
									: t("history.incomplete")}
							</span>
						</div>

						<div className="flex flex-wrap gap-1.5">
							<button
								onClick={() => onPlayAgain(entry)}
								className="flex items-center rounded bg-primary/10 px-3 py-1.5 font-semibold text-primary text-xs transition-all hover:bg-primary/20 active:scale-95"
								type="button"
							>
								<Play className="mr-1 h-3.5 w-3.5" />
								{t("history.playAgain")}
							</button>
							<button
								onClick={() =>
									setExpandedId(expandedId === entry.id ? null : entry.id)
								}
								className="flex items-center rounded bg-overlay px-3 py-1.5 font-medium text-main text-xs transition-all hover:bg-overlay/80 active:scale-95"
								type="button"
							>
								<FileText className="mr-1 h-3.5 w-3.5" />
								{expandedId === entry.id
									? t("history.hideDetails") || "Ocultar Detalhes"
									: t("history.viewDetails") || "Ver Detalhes"}
							</button>
							<button
								onClick={() => handleCopy(entry)}
								className="flex items-center rounded bg-overlay px-3 py-1.5 font-medium text-main text-xs transition-all hover:bg-overlay/80 active:scale-95"
								type="button"
							>
								<ClipboardCopy className="mr-1 h-3.5 w-3.5" />
								{t("history.copy")}
							</button>
							<button
								onClick={() => handleDownload(entry)}
								className="flex items-center rounded bg-overlay px-3 py-1.5 font-medium text-main text-xs transition-all hover:bg-overlay/80 active:scale-95"
								type="button"
							>
								<Download className="mr-1 h-3.5 w-3.5" />
								{t("history.download")}
							</button>
							<button
								onClick={() => onDelete(entry.id)}
								className="flex items-center rounded bg-danger/10 px-3 py-1.5 font-medium text-danger text-xs transition-all hover:bg-danger/20 active:scale-95"
								type="button"
							>
								<Trash2 className="mr-1 h-3.5 w-3.5" />
								{t("history.delete")}
							</button>
						</div>

						{expandedId === entry.id && (
							<div className="mt-4 border-t border-overlay pt-4 space-y-4">
								{entry.quizData.map((q, qIndex) => {
									const selectedOption = q.options.find(
										(opt) => opt.id === q.selectedOptionId,
									);
									const correctOption = q.options.find(
										(opt) => opt.id === q.correctOptionId,
									);
									const isSkipped = q.selectedOptionId === "skipped";
									const isCorrect = q.selectedOptionId === q.correctOptionId;
									const isIncorrect =
										q.selectedOptionId !== undefined &&
										q.selectedOptionId !== "skipped" &&
										!isCorrect;

									return (
										<div
											key={q.id}
											className="rounded-lg border border-overlay bg-base p-3 text-xs"
										>
											<div className="mb-2 flex items-start justify-between font-semibold">
												<span className="text-main leading-relaxed">
													{qIndex + 1}. {q.question}
												</span>
												<span
													className={cn(
														"ml-2 shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold",
														isCorrect && "bg-secondary/10 text-secondary",
														isIncorrect && "bg-danger/10 text-danger",
														(isSkipped || q.selectedOptionId === undefined) &&
															"bg-overlay text-muted",
													)}
												>
													{isCorrect &&
														(t("history.questionCorrect") || "Correto")}
													{isIncorrect &&
														(t("history.questionIncorrect") || "Incorreto")}
													{isSkipped &&
														(t("history.questionSkipped") || "Pulado")}
													{q.selectedOptionId === undefined &&
														(t("history.incomplete") || "Não respondido")}
												</span>
											</div>

											<div className="space-y-1.5 pl-2">
												{q.options.map((opt) => {
													const isOptCorrect = opt.id === q.correctOptionId;
													const isOptSelected = opt.id === q.selectedOptionId;

													return (
														<div
															key={opt.id}
															className={cn(
																"rounded p-2 border border-transparent",
																isOptCorrect &&
																	"bg-secondary/5 border-secondary/20 text-secondary font-medium",
																isOptSelected &&
																	!isOptCorrect &&
																	"bg-danger/5 border-danger/20 text-danger font-medium",
																!isOptCorrect && !isOptSelected && "text-muted",
															)}
														>
															<span className="mr-1.5 font-bold">
																{isOptCorrect ? "✓" : isOptSelected ? "✗" : "•"}
															</span>
															{opt.text}
														</div>
													);
												})}
											</div>

											{/* Explanation if incorrect and selected option has explanation */}
											{isIncorrect && selectedOption?.explanation && (
												<div className="mt-2.5 rounded border border-danger/20 bg-danger/5 p-2 text-danger/85">
													<strong className="block mb-0.5 font-bold">
														{t("play.explanationSelected") ||
															"Explicação da sua resposta:"}
													</strong>
													{selectedOption.explanation}
												</div>
											)}

											{/* Explanation of correct answer */}
											{correctOption?.explanation && (
												<div
													className={cn(
														"mt-2.5 rounded border p-2",
														isCorrect
															? "border-secondary/20 bg-secondary/5 text-secondary/85"
															: "border-danger/20 bg-danger/5 text-danger/85",
													)}
												>
													<strong className="block mb-0.5 font-bold">
														{t("play.explanationCorrect") ||
															"Explicação da resposta correta:"}
													</strong>
													{correctOption.explanation}
												</div>
											)}
										</div>
									);
								})}
							</div>
						)}
					</div>
				);
			})}
		</div>
	);
};
