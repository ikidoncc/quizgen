import {
	BookOpen,
	Brain,
	Compass,
	History,
	Layers,
	PlusCircle,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { CreateFlashcardTab } from "./components/CreateFlashcardTab";
import { CreateTab } from "./components/CreateTab";
import { FlashcardHistoryTab } from "./components/FlashcardHistoryTab";
import { HistoryTab } from "./components/HistoryTab";
import { LangSelect } from "./components/LangSelect";
import { Modal } from "./components/Modal";
import { PlayTab } from "./components/PlayTab";
import { ResultsTab } from "./components/ResultsTab";
import { StudyFlashcardTab } from "./components/StudyFlashcardTab";
import { ThemeSelect } from "./components/ThemeSelect";
import { useHistory } from "./hooks/useHistory";
import { useQuizState } from "./hooks/useQuizState";
import { useTheme } from "./hooks/useTheme";
import { useTranslation } from "./i18n/I18nProvider";
import type { HistoryEntry, Question } from "./types";

function sidebarButtonClass(isActive: boolean): string {
	return isActive
		? "flex items-center gap-3 w-full px-4 py-2 text-xs font-extrabold text-primary bg-primary/10 border-l-4 border-primary rounded-r-lg select-none"
		: "flex items-center gap-3 w-full px-4 py-2 text-xs font-semibold text-muted hover:text-main hover:bg-overlay/40 border-l-4 border-transparent rounded-r-lg transition-all select-none";
}

export function App() {
	const { t } = useTranslation();
	const { theme, setTheme } = useTheme();
	const {
		state,
		setTab,
		setQuizData,
		resetQuiz,
		deleteQuiz,
		answerQuestion,
		skipQuestion,
		setTimeLeft,
		setHistoryId,
		// Flashcards actions
		setFlashcardSet,
		addFlashcardSet,
		deleteFlashcardSet,
		selectCardFeedback,
		resetFlashcardStudy,
	} = useQuizState();
	const { entries, addEntry, updateEntry, deleteEntry } = useHistory();

	const handleGenerate = useCallback(
		(data: Question[], timerEnabled: boolean, timerDuration: number) => {
			const historyId = addEntry(data, timerEnabled, timerDuration);
			setQuizData(data, timerEnabled, timerDuration, historyId);
		},
		[addEntry, setQuizData],
	);

	const handlePlayAgain = useCallback(
		(entry: HistoryEntry) => {
			const duration = entry.timerDuration ?? 60;
			const historyId = addEntry(
				entry.quizData,
				entry.isTimerEnabled,
				duration,
			);
			setQuizData(entry.quizData, entry.isTimerEnabled, duration, historyId);
			setHistoryId(historyId);
		},
		[addEntry, setQuizData, setHistoryId],
	);

	const handleDeleteQuizFromPlay = useCallback(() => {
		if (state.currentHistoryId) {
			deleteEntry(state.currentHistoryId);
		}
		deleteQuiz();
	}, [state.currentHistoryId, deleteEntry, deleteQuiz]);

	const handleDeleteEntry = useCallback(
		(id: string) => {
			deleteEntry(id);
			if (state.currentHistoryId === id) {
				deleteQuiz();
			}
		},
		[deleteEntry, state.currentHistoryId, deleteQuiz],
	);

	const [modalConfig, setModalConfig] = useState<{
		isOpen: boolean;
		title: string;
		message: string;
		confirmText?: string;
		onConfirm: () => void;
		onCancel?: () => void;
	}>({
		isOpen: false,
		title: "",
		message: "",
		onConfirm: () => {},
	});

	const showModal = useCallback(
		(config: Omit<typeof modalConfig, "isOpen">) => {
			setModalConfig({ ...config, isOpen: true });
		},
		[],
	);

	const closeModal = useCallback(() => {
		setModalConfig((prev) => ({ ...prev, isOpen: false }));
	}, []);

	const isGameOver =
		state.quizData.length > 0 &&
		state.currentQuestionIndex >= state.quizData.length;

	useEffect(() => {
		if (isGameOver && state.currentHistoryId) {
			updateEntry(state.currentHistoryId, state.score, state.skippedCount);
		}
	}, [
		isGameOver,
		state.currentHistoryId,
		state.score,
		state.skippedCount,
		updateEntry,
	]);

	const getActiveTabTitle = () => {
		switch (state.currentTab) {
			case "quiz-create":
				return t("nav.quizCreate") || "Criar Quiz";
			case "quiz-play":
				return t("nav.quizPlay") || "Jogar Quiz";
			case "quiz-history":
				return t("nav.quizHistory") || "Histórico de Quizzes";
			case "flashcard-create":
				return t("nav.flashcardCreate") || "Criar Flashcards";
			case "flashcard-study":
				return t("nav.flashcardStudy") || "Estudar Flashcards";
			case "flashcard-history":
				return t("nav.flashcardHistory") || "Histórico de Decks";
			default:
				return "";
		}
	};

	const renderContent = () => {
		switch (state.currentTab) {
			case "quiz-create":
				return (
					<CreateTab
						onGenerate={handleGenerate}
						initialTimerEnabled={state.isTimerEnabled}
						onError={(msg) =>
							showModal({
								title: t("modal.title.error"),
								message: msg,
								confirmText: t("modal.ok"),
								onConfirm: closeModal,
							})
						}
					/>
				);
			case "quiz-history":
				return (
					<HistoryTab
						entries={entries}
						onPlayAgain={handlePlayAgain}
						onDelete={handleDeleteEntry}
					/>
				);
			case "quiz-play":
				if (state.quizData.length === 0) {
					return (
						<div className="rounded-3xl border border-overlay border-dashed bg-surface/50 py-16 text-center">
							<p className="mb-6 font-medium text-muted">
								{t("empty.message")}
							</p>
							<button
								onClick={() => setTab("quiz-create")}
								className="cursor-pointer font-bold text-primary underline transition-all hover:opacity-80"
								type="button"
							>
								{t("empty.action")}
							</button>
						</div>
					);
				}
				if (isGameOver) {
					return (
						<ResultsTab
							score={state.score}
							totalQuestions={state.quizData.length}
							skippedCount={state.skippedCount}
							onNewQuiz={() => setTab("quiz-create")}
						/>
					);
				}
				return (
					<PlayTab
						key={`${state.currentQuestionIndex}-${state.gameId}`}
						quizData={state.quizData}
						currentQuestionIndex={state.currentQuestionIndex}
						score={state.score}
						isTimerEnabled={state.isTimerEnabled}
						timeLeft={state.timeLeft}
						timerPaused={modalConfig.isOpen}
						onTick={setTimeLeft}
						onAnswer={(isCorrect) => answerQuestion(isCorrect)}
						onSkip={() => skipQuestion()}
						onSkipRequest={() =>
							showModal({
								title: t("modal.title.skip"),
								message: t("modal.message.skip"),
								onConfirm: () => {
									skipQuestion();
									closeModal();
								},
								onCancel: closeModal,
							})
						}
						onReset={() =>
							showModal({
								title: t("modal.title.reset"),
								message: t("modal.message.reset"),
								onConfirm: () => {
									resetQuiz();
									closeModal();
								},
								onCancel: closeModal,
							})
						}
						onDelete={() =>
							showModal({
								title: t("modal.title.delete"),
								message: t("modal.message.delete"),
								onConfirm: () => {
									handleDeleteQuizFromPlay();
									closeModal();
								},
								onCancel: closeModal,
							})
						}
					/>
				);
			case "flashcard-create":
				return (
					<CreateFlashcardTab
						onGenerate={addFlashcardSet}
						onError={(msg) =>
							showModal({
								title: t("modal.title.error"),
								message: msg,
								confirmText: t("modal.ok"),
								onConfirm: closeModal,
							})
						}
					/>
				);
			case "flashcard-study":
				return (
					<StudyFlashcardTab
						deck={state.currentFlashcardSet}
						currentCardIndex={state.currentCardIndex}
						cardsMastered={state.cardsMastered}
						cardsToReview={state.cardsToReview}
						onFeedback={selectCardFeedback}
						onReset={resetFlashcardStudy}
						onNavigateToCreate={() => setTab("flashcard-create")}
					/>
				);
			case "flashcard-history":
				return (
					<FlashcardHistoryTab
						entries={state.flashcardHistory}
						onSelectDeck={setFlashcardSet}
						onDelete={deleteFlashcardSet}
					/>
				);
			default:
				return null;
		}
	};

	return (
		<div className="flex min-h-screen w-full flex-col bg-base text-main md:flex-row">
			{/* Persistent Sidebar */}
			<aside className="flex w-full shrink-0 flex-col border-overlay bg-surface p-6 md:w-64 md:border-r">
				{/* Logo / Header */}
				<div className="mb-8 flex items-center gap-3">
					<div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary shadow-md">
						<Compass className="h-5 w-5 animate-spin-slow text-surface" />
					</div>
					<div>
						<h1 className="font-black text-primary text-xl tracking-tight">
							{t("app.title")}
						</h1>
						<p className="font-medium text-[10px] text-subtle leading-none">
							{t("app.subtitle")}
						</p>
					</div>
				</div>

				{/* Nav Tree */}
				<nav className="flex grow flex-col gap-6">
					{/* Quiz Section */}
					<div className="flex flex-col gap-1.5">
						<span className="flex select-none items-center gap-1.5 px-4 font-extrabold text-[10px] text-muted uppercase tracking-widest">
							<Brain className="h-3.5 w-3.5 text-primary" />
							{t("nav.quiz") || "Quiz"}
						</span>
						<div className="flex flex-col gap-1">
							<button
								onClick={() => setTab("quiz-create")}
								className={sidebarButtonClass(
									state.currentTab === "quiz-create",
								)}
								type="button"
							>
								<PlusCircle className="h-4 w-4" />
								{t("nav.quizCreate") || "Criar"}
							</button>
							<button
								onClick={() => setTab("quiz-play")}
								className={sidebarButtonClass(state.currentTab === "quiz-play")}
								type="button"
							>
								<Brain className="h-4 w-4" />
								{t("nav.quizPlay") || "Jogar"}
							</button>
							<button
								onClick={() => setTab("quiz-history")}
								className={sidebarButtonClass(
									state.currentTab === "quiz-history",
								)}
								type="button"
							>
								<History className="h-4 w-4" />
								{t("nav.quizHistory") || "Histórico"}
							</button>
						</div>
					</div>

					{/* Flashcards Section */}
					<div className="flex flex-col gap-1.5">
						<span className="flex select-none items-center gap-1.5 px-4 font-extrabold text-[10px] text-muted uppercase tracking-widest">
							<Layers className="h-3.5 w-3.5 text-primary" />
							{t("nav.flashcard") || "Flashcard"}
						</span>
						<div className="flex flex-col gap-1">
							<button
								onClick={() => setTab("flashcard-create")}
								className={sidebarButtonClass(
									state.currentTab === "flashcard-create",
								)}
								type="button"
							>
								<PlusCircle className="h-4 w-4" />
								{t("nav.flashcardCreate") || "Criar"}
							</button>
							<button
								onClick={() => setTab("flashcard-study")}
								className={sidebarButtonClass(
									state.currentTab === "flashcard-study",
								)}
								type="button"
							>
								<BookOpen className="h-4 w-4" />
								{t("nav.flashcardStudy") || "Estudar"}
							</button>
							<button
								onClick={() => setTab("flashcard-history")}
								className={sidebarButtonClass(
									state.currentTab === "flashcard-history",
								)}
								type="button"
							>
								<History className="h-4 w-4" />
								{t("nav.flashcardHistory") || "Histórico"}
							</button>
						</div>
					</div>
				</nav>

				{/* Footer Settings & Copy */}
				<div className="mt-8 flex flex-col gap-4 border-overlay border-t pt-6">
					<div className="flex items-center justify-between gap-2">
						<LangSelect />
						<ThemeSelect value={theme} onChange={setTheme} />
					</div>
					<footer className="select-none text-center font-semibold text-[9px] text-muted/30">
						{t("footer")}
					</footer>
				</div>
			</aside>

			{/* Main Content Area */}
			<main className="mx-auto flex w-full max-w-4xl flex-1 flex-col overflow-y-auto p-6">
				{/* Top bar with active page name */}
				<header className="mb-6 flex items-center justify-between border-overlay border-b pb-4">
					<h2 className="font-extrabold text-main text-xl tracking-tight">
						{getActiveTabTitle()}
					</h2>
				</header>

				{/* Content Panel */}
				<div className="grow">{renderContent()}</div>
			</main>

			{/* Modal Dialogs */}
			<Modal
				isOpen={modalConfig.isOpen}
				title={modalConfig.title}
				message={modalConfig.message}
				confirmText={modalConfig.confirmText}
				onConfirm={modalConfig.onConfirm}
				onCancel={modalConfig.onCancel}
			/>
		</div>
	);
}
