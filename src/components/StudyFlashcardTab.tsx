import {
	AlertCircle,
	CheckCircle,
	Layers,
	RefreshCw,
	RotateCw,
	ThumbsDown,
	ThumbsUp,
} from "lucide-react";
import type React from "react";
import { useState } from "react";
import { useTranslation } from "../i18n/I18nProvider";
import type { FlashcardSet } from "../types";
import { cn } from "../utils/cn";

interface StudyFlashcardTabProps {
	deck: FlashcardSet | null;
	currentCardIndex: number;
	cardsMastered: string[];
	cardsToReview: string[];
	onFeedback: (cardId: string, type: "master" | "review") => void;
	onReset: (onlyReview?: boolean) => void;
	onNavigateToCreate: () => void;
}

export const StudyFlashcardTab: React.FC<StudyFlashcardTabProps> = ({
	deck,
	currentCardIndex,
	cardsMastered,
	cardsToReview,
	onFeedback,
	onReset,
	onNavigateToCreate,
}) => {
	const { t } = useTranslation();
	const [isFlipped, setIsFlipped] = useState(false);

	if (!deck) {
		return (
			<div className="rounded-3xl border border-overlay border-dashed bg-surface/50 py-16 text-center">
				<Layers className="mx-auto mb-4 h-12 w-12 text-muted/40" />
				<p className="mb-6 font-medium text-muted">
					{t("flashcard.study.empty.message") ||
						"Nenhum deck selecionado para estudar no momento."}
				</p>
				<button
					onClick={onNavigateToCreate}
					className="cursor-pointer font-bold text-primary underline transition-all hover:opacity-80"
					type="button"
				>
					{t("flashcard.study.empty.action") ||
						"Criar um novo deck de Flashcards"}
				</button>
			</div>
		);
	}

	const cards = deck.cards;
	const isFinished = currentCardIndex >= cards.length;

	const handleFlip = () => {
		setIsFlipped(!isFlipped);
	};

	const handleFeedbackClick = (type: "master" | "review") => {
		if (isFinished) return;
		const activeCard = cards[currentCardIndex];
		onFeedback(activeCard.id, type);
		setIsFlipped(false); // Reseta a rotação para o próximo cartão
	};

	if (isFinished) {
		const totalMastered = cardsMastered.length;
		const totalToReview = cardsToReview.length;

		return (
			<div className="fade-in animate-in rounded-lg border border-overlay bg-surface p-8 text-center shadow-md">
				<CheckCircle className="mx-auto mb-4 h-16 w-16 text-primary" />
				<h2 className="mb-2 font-bold text-2xl text-main">
					{t("flashcard.study.finished.title") || "Deck Concluído!"}
				</h2>
				<p className="mb-6 text-sm text-subtle">
					{t("flashcard.study.finished.subtitle", { deck: deck.title }) ||
						`Você terminou de revisar o deck: ${deck.title}`}
				</p>

				<div className="mb-8 grid grid-cols-2 gap-4">
					<div className="rounded-xl border border-success/20 bg-success/10 p-4 text-center">
						<span className="block font-bold text-2xl text-success">
							{totalMastered}
						</span>
						<span className="font-semibold text-muted text-xs">
							{t("flashcard.study.finished.mastered") || "Dominados"}
						</span>
					</div>
					<div className="rounded-xl border border-danger/20 bg-danger/10 p-4 text-center">
						<span className="block font-bold text-2xl text-danger">
							{totalToReview}
						</span>
						<span className="font-semibold text-muted text-xs">
							{t("flashcard.study.finished.toReview") || "Revisar"}
						</span>
					</div>
				</div>

				<div className="flex flex-col gap-3">
					<button
						onClick={() => onReset(false)}
						className="flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 font-bold text-surface shadow-sm transition-all hover:bg-primary/95 active:scale-[0.98]"
						type="button"
					>
						<RefreshCw className="h-4 w-4" />
						{t("flashcard.study.finished.restartAll") || "Estudar Todo o Deck"}
					</button>

					{totalToReview > 0 && (
						<button
							onClick={() => onReset(true)}
							className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-overlay bg-overlay px-5 py-3 font-bold text-main transition-all hover:bg-overlay/80 active:scale-[0.98]"
							type="button"
						>
							<AlertCircle className="h-4 w-4 text-danger" />
							{t("flashcard.study.finished.restartReviewOnly") ||
								"Revisar Apenas os que Errei"}
						</button>
					)}

					<button
						onClick={onNavigateToCreate}
						className="mt-2 cursor-pointer font-bold text-primary text-sm hover:underline"
						type="button"
					>
						{t("flashcard.study.finished.newDeck") ||
							"Criar outro deck de Flashcards"}
					</button>
				</div>
			</div>
		);
	}

	const activeCard = cards[currentCardIndex];
	const progressPercent = Math.min(
		100,
		Math.round((currentCardIndex / cards.length) * 100),
	);

	return (
		<div className="fade-in animate-in rounded-lg border border-overlay bg-surface p-6 shadow-md">
			<div className="mb-4 flex items-center justify-between">
				<div className="max-w-[70%]">
					<span className="font-bold text-muted text-xs uppercase tracking-wider">
						{t("flashcard.study.studying") || "Estudando deck"}
					</span>
					<h3 className="truncate font-semibold text-main text-sm">
						{deck.title}
					</h3>
				</div>
				<span className="font-bold text-muted text-xs">
					{t("flashcard.study.progress", {
						current: currentCardIndex + 1,
						total: cards.length,
					}) || `${currentCardIndex + 1} / ${cards.length}`}
				</span>
			</div>

			{/* Progress bar */}
			<div className="mb-8 h-2 w-full overflow-hidden rounded-full bg-base">
				<div
					className="h-full bg-primary transition-all duration-300"
					style={{ width: `${progressPercent}%` }}
				/>
			</div>

			{/* 3D Flashcard Container */}
			<div className="mb-8 flex justify-center">
				<button
					className="card-perspective block h-80 w-full max-w-md cursor-pointer rounded-3xl border-none bg-transparent text-left focus:outline-none focus:ring-2 focus:ring-primary"
					onClick={handleFlip}
					type="button"
					aria-label={t("flashcard.study.card.tapToFlip") || "Girar cartão"}
				>
					<div
						className={cn(
							"card-inner h-full w-full rounded-3xl border border-overlay shadow-lg transition-transform duration-500 ease-out",
							isFlipped && "flipped",
						)}
					>
						{/* Front Side */}
						<div className="card-face card-front flex flex-col items-center justify-center bg-base p-6 text-center">
							<span className="absolute top-4 font-bold text-muted text-xs uppercase tracking-widest">
								{t("flashcard.study.card.front") || "Conceito / Pergunta"}
							</span>
							<p className="max-h-56 overflow-y-auto font-semibold text-lg text-main leading-relaxed">
								{activeCard.front}
							</p>
							<div className="absolute bottom-4 flex items-center gap-1.5 font-medium text-muted text-xs">
								<RotateCw className="h-3 w-3 animate-pulse" />
								{t("flashcard.study.card.tapToFlip") ||
									"Clique para ver a resposta"}
							</div>
						</div>

						{/* Back Side */}
						<div className="card-face card-back flex flex-col items-center justify-center bg-overlay p-6 text-center">
							<span className="absolute top-4 font-bold text-muted text-xs uppercase tracking-widest">
								{t("flashcard.study.card.back") || "Explicação / Resposta"}
							</span>
							<p className="max-h-56 overflow-y-auto font-medium text-base text-main leading-relaxed">
								{activeCard.back}
							</p>
							<div className="absolute bottom-4 flex items-center gap-1.5 font-medium text-muted text-xs">
								<RotateCw className="h-3 w-3 animate-pulse" />
								{t("flashcard.study.card.tapToFlip") || "Clique para voltar"}
							</div>
						</div>
					</div>
				</button>
			</div>

			{/* Control actions */}
			<div className="flex flex-col items-center gap-3">
				{!isFlipped ? (
					<button
						onClick={handleFlip}
						className="flex cursor-pointer items-center gap-2 rounded-xl border border-primary/20 bg-primary/10 px-6 py-3 font-bold text-primary text-sm transition-all hover:bg-primary/20 active:scale-[0.98]"
						type="button"
					>
						<RotateCw className="h-4 w-4" />
						{t("flashcard.study.reveal") || "Revelar Resposta"}
					</button>
				) : (
					<div className="fade-in grid w-full max-w-md animate-in grid-cols-2 gap-4">
						<button
							onClick={() => handleFeedbackClick("review")}
							className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-danger/20 bg-danger/10 py-3.5 font-bold text-danger text-sm transition-all hover:bg-danger/25 active:scale-[0.97]"
							type="button"
						>
							<ThumbsDown className="h-4 w-4" />
							{t("flashcard.study.feedback.review") || "Revisar (Errei)"}
						</button>
						<button
							onClick={() => handleFeedbackClick("master")}
							className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-success/20 bg-success/10 py-3.5 font-bold text-sm text-success transition-all hover:bg-success/25 active:scale-[0.97]"
							type="button"
						>
							<ThumbsUp className="h-4 w-4" />
							{t("flashcard.study.feedback.master") || "Dominado (Acertei)"}
						</button>
					</div>
				)}
			</div>
		</div>
	);
};
