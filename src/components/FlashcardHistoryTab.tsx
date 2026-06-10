import { ClipboardCopy, Download, FileText, Play, Trash2 } from "lucide-react";
import type React from "react";
import { useCallback } from "react";
import { useTranslation } from "../i18n/I18nProvider";
import type { FlashcardSet } from "../types";

interface FlashcardHistoryTabProps {
	entries: FlashcardSet[];
	onSelectDeck: (deck: FlashcardSet) => void;
	onDelete: (id: string) => void;
}

export const FlashcardHistoryTab: React.FC<FlashcardHistoryTabProps> = ({
	entries,
	onSelectDeck,
	onDelete,
}) => {
	const { t } = useTranslation();

	const getExportText = (deck: FlashcardSet): string => {
		return `Deck: ${deck.title}\nCriado em: ${new Date(deck.createdAt).toLocaleString()}\n\n` + 
			deck.cards.map((c, i) => `[Card ${i + 1}]\nFrente: ${c.front}\nVerso: ${c.back}`).join("\n\n");
	};

	const handleCopy = useCallback(async (deck: FlashcardSet) => {
		try {
			await navigator.clipboard.writeText(getExportText(deck));
		} catch {
			// silently fail
		}
	}, []);

	const handleDownload = useCallback((deck: FlashcardSet) => {
		const text = getExportText(deck);
		const blob = new Blob([text], { type: "text/plain" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `${deck.title.toLowerCase().replace(/[^a-z0-9]/g, "_")}_flashcards.txt`;
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
				<p className="font-medium text-muted">
					{t("flashcard.history.empty") || "Nenhum deck de flashcards encontrado."}
				</p>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			{entries.map((deck) => {
				return (
					<div
						key={deck.id}
						className="fade-in slide-in-from-bottom-2 animate-in rounded-lg border border-overlay bg-surface p-4 shadow-sm transition-all duration-200"
					>
						<div className="mb-3 flex items-start justify-between">
							<div className="min-w-0 flex-1">
								<h3 className="truncate font-semibold text-main text-sm">
									{deck.title}
								</h3>
								<p className="mt-0.5 font-medium text-muted text-xs">
									{rd(deck.createdAt)}
								</p>
							</div>
							<span className="ml-3 shrink-0 rounded-full bg-secondary/10 px-2.5 py-0.5 text-xs font-bold text-secondary">
								{t("flashcard.history.cardsCount", { count: deck.cards.length }) || `${deck.cards.length} cards`}
							</span>
						</div>

						<div className="flex flex-wrap gap-1.5">
							<button
								onClick={() => onSelectDeck(deck)}
								className="flex items-center rounded bg-primary/10 px-3 py-1.5 text-primary text-xs font-semibold transition-all hover:bg-primary/20 active:scale-95 cursor-pointer"
								type="button"
							>
								<Play className="mr-1 h-3.5 w-3.5" />
								{t("flashcard.history.study") || "Estudar"}
							</button>
							<button
								onClick={() => handleCopy(deck)}
								className="flex items-center rounded bg-overlay px-3 py-1.5 text-main text-xs font-medium transition-all hover:bg-overlay/80 active:scale-95 cursor-pointer"
								type="button"
							>
								<ClipboardCopy className="mr-1 h-3.5 w-3.5" />
								{t("history.copy")}
							</button>
							<button
								onClick={() => handleDownload(deck)}
								className="flex items-center rounded bg-overlay px-3 py-1.5 text-main text-xs font-medium transition-all hover:bg-overlay/80 active:scale-95 cursor-pointer"
								type="button"
							>
								<Download className="mr-1 h-3.5 w-3.5" />
								{t("history.download")}
							</button>
							<button
								onClick={() => onDelete(deck.id)}
								className="flex items-center rounded bg-danger/10 px-3 py-1.5 text-danger text-xs font-medium transition-all hover:bg-danger/20 active:scale-95 cursor-pointer"
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
