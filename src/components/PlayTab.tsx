import {
	AlertTriangle,
	ArrowRight,
	CheckCircle,
	RotateCcw,
	SkipForward,
	Trash2,
} from "lucide-react";
import type React from "react";
import { useState } from "react";
import { useTimer } from "../hooks/useTimer";
import { useTranslation } from "../i18n/I18nProvider";
import type { Question } from "../types";
import { cn } from "../utils/cn";

interface PlayTabProps {
	quizData: Question[];
	currentQuestionIndex: number;
	score: number;
	isTimerEnabled: boolean;
	timeLeft: number;
	timerPaused: boolean;
	onAnswer: (isCorrect: boolean) => void;
	onSkip: () => void;
	onSkipRequest: () => void;
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
	timerPaused,
	onAnswer,
	onSkip,
	onSkipRequest,
	onReset,
	onDelete,
	onTick,
}) => {
	const { t } = useTranslation();
	const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
	const [showFeedback, setShowFeedback] = useState(false);
	const [isAnswering, setIsAnswering] = useState(true);

	const currentQ = quizData[currentQuestionIndex];

	const { stopTimer } = useTimer(
		isTimerEnabled && isAnswering && !timerPaused,
		timeLeft,
		onTick,
		() => onSkip(),
	);

	if (!currentQ) {
		return (
			<div className="rounded-lg border border-overlay bg-surface p-6 text-center shadow-md">
				<p className="font-medium text-muted">{t("play.error")}</p>
				<button
					onClick={onReset}
					className="mt-4 font-bold text-primary underline hover:opacity-80"
					type="button"
				>
					{t("play.restartButton")}
				</button>
			</div>
		);
	}

	const handleOptionClick = (optionId: string) => {
		if (!isAnswering) return;

		stopTimer();
		setIsAnswering(false);
		setSelectedOptionId(optionId);
		setShowFeedback(true);
	};

	const handleNext = () => {
		const isCorrect = selectedOptionId === currentQ.correctOptionId;
		onAnswer(isCorrect);
	};

	const isCorrectSelection =
		selectedOptionId === currentQ.correctOptionId;

	return (
		<div className="fade-in slide-in-from-bottom-2 animate-in rounded-lg border border-overlay bg-surface p-6 shadow-md transition-all duration-300">
			<div className="mb-4 flex items-center justify-between border-overlay border-b pb-4">
				<div className="flex space-x-2">
					<button
						onClick={onReset}
						className="flex items-center rounded bg-overlay px-2 py-1 text-main text-xs transition-all hover:opacity-80 active:scale-95"
						type="button"
					>
						<RotateCcw className="mr-1 h-3 w-3" />
						{t("play.restart")}
					</button>
					<button
						onClick={onDelete}
						className="flex items-center rounded bg-danger/10 px-2 py-1 text-danger text-xs transition-all hover:bg-danger/20 active:scale-95"
						type="button"
					>
						<Trash2 className="mr-1 h-3 w-3" />
						{t("play.delete")}
					</button>
				</div>
				<div className="text-right">
					<span className="block font-medium text-muted text-xs">
						{t("play.questionCount", {
							current: currentQuestionIndex + 1,
							total: quizData.length,
						})}
					</span>
					<span className="block font-bold text-primary text-xs">
						{t("play.score", { score })}
					</span>
					{isTimerEnabled && (
						<span
							className={cn(
								"mt-1 block font-bold text-xs transition-colors",
								timeLeft <= 10 ? "animate-pulse text-danger" : "text-primary",
							)}
						>
							{t("play.timer", { time: timeLeft })}
						</span>
					)}
				</div>
			</div>

			<div className="mb-8">
				<h3 className="font-medium text-lg text-main leading-relaxed">
					{currentQ.question}
				</h3>
			</div>

			<div className="grid grid-cols-1 gap-3">
				{currentQ.options.map((option) => {
					const isSelected = selectedOptionId === option.id;
					const isActuallyCorrect = option.id === currentQ.correctOptionId;

					let btnClass =
						"border-overlay text-main hover:border-primary hover:bg-primary/5";
					if (showFeedback) {
						if (isActuallyCorrect) {
							btnClass =
								"border-secondary bg-secondary/10 text-secondary font-bold";
						} else if (isSelected) {
							btnClass = "border-danger bg-danger/10 text-danger font-bold";
						} else {
							btnClass = "border-overlay text-muted opacity-50";
						}
					}

					return (
						<button
							key={option.id}
							disabled={!isAnswering}
							onClick={() => handleOptionClick(option.id)}
							className={cn(
								"w-full rounded-xl border-2 p-4 text-left transition-all duration-200",
								btnClass,
								isAnswering && "active:scale-[0.99]",
							)}
							type="button"
						>
							{option.text}
						</button>
					);
				})}
			</div>

			{showFeedback && (
				<div
					className={cn(
						"zoom-in mt-6 flex animate-in items-center justify-center rounded-xl p-4 font-bold duration-300",
						isCorrectSelection
							? "border border-secondary/20 bg-secondary/10 text-secondary"
							: "border border-danger/20 bg-danger/10 text-danger",
					)}
				>
					{isCorrectSelection ? (
						<>
							<CheckCircle className="mr-2 h-5 w-5" /> {t("play.correct")}
						</>
					) : (
						<>
							<AlertTriangle className="mr-2 h-5 w-5" />{" "}
							{t("play.incorrect", { answer: currentQ.answer })}
						</>
					)}
				</div>
			)}

			<div className="mt-6 space-y-2">
				{showFeedback ? (
					<button
						onClick={handleNext}
						className="slide-in-from-bottom-1 flex w-full animate-in items-center justify-center rounded-xl bg-primary px-4 py-3 font-bold text-white shadow-sm transition-all hover:opacity-90 active:scale-[0.98]"
						type="button"
					>
						{currentQuestionIndex + 1 === quizData.length
							? t("play.showResults")
							: t("play.nextQuestion")}
						<ArrowRight className="ml-2 h-5 w-5" />
					</button>
				) : (
					<button
						onClick={onSkipRequest}
						className="flex w-full items-center justify-center rounded-xl border-2 border-overlay bg-surface px-4 py-3 font-bold text-subtle transition-all hover:border-muted hover:bg-overlay/20 active:scale-[0.98]"
						type="button"
					>
						<SkipForward className="mr-2 h-5 w-5" />
						{t("play.skip")}
					</button>
				)}
			</div>
		</div>
	);
};
