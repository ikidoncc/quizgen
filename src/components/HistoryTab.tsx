import { ClipboardCopy, Download, FileText, Play, Trash2 } from "lucide-react";
import type React from "react";
import { useCallback } from "react";
import { useTranslation } from "../i18n/I18nProvider";
import type { HistoryEntry } from "../types";
import { cn } from "../utils/cn";
import { getExportFilename, getExportText } from "../hooks/useHistory";

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
			<div className="rounded-3xl border border-dashed border-overlay bg-surface/50 py-16 text-center">
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
									"ml-3 shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold",
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
								className="flex items-center rounded bg-primary/10 px-3 py-1.5 text-primary text-xs font-semibold transition-all hover:bg-primary/20 active:scale-95"
								type="button"
							>
								<Play className="mr-1 h-3.5 w-3.5" />
								{t("history.playAgain")}
							</button>
							<button
								onClick={() => handleCopy(entry)}
								className="flex items-center rounded bg-overlay px-3 py-1.5 text-main text-xs font-medium transition-all hover:bg-overlay/80 active:scale-95"
								type="button"
							>
								<ClipboardCopy className="mr-1 h-3.5 w-3.5" />
								{t("history.copy")}
							</button>
							<button
								onClick={() => handleDownload(entry)}
								className="flex items-center rounded bg-overlay px-3 py-1.5 text-main text-xs font-medium transition-all hover:bg-overlay/80 active:scale-95"
								type="button"
							>
								<Download className="mr-1 h-3.5 w-3.5" />
								{t("history.download")}
							</button>
							<button
								onClick={() => onDelete(entry.id)}
								className="flex items-center rounded bg-danger/10 px-3 py-1.5 text-danger text-xs font-medium transition-all hover:bg-danger/20 active:scale-95"
								type="button"
							>
								<Trash2 className="mr-1 h-3.5 w-3.5" />
								{t("history.delete")}
							</button>
						</div>
					</div>
				);
			})}
		</div>
	);
};
