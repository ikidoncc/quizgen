import { useCallback, useEffect, useState } from "react";
import { CreateTab } from "./components/CreateTab";
import { HistoryTab } from "./components/HistoryTab";
import { LangSelect } from "./components/LangSelect";
import { Modal } from "./components/Modal";
import { PlayTab } from "./components/PlayTab";
import { ResultsTab } from "./components/ResultsTab";
import { ThemeSelect } from "./components/ThemeSelect";
import { useHistory } from "./hooks/useHistory";
import { useQuizState } from "./hooks/useQuizState";
import { useTheme } from "./hooks/useTheme";
import { useTranslation } from "./i18n/I18nProvider";
import type { HistoryEntry, Question, Tab } from "./types";
import { cn } from "./utils/cn";

function tabClass(currentTab: Tab, tab: Tab): string {
	return currentTab === tab
		? "text-primary border-primary opacity-100"
		: "text-muted border-transparent opacity-60 hover:text-primary hover:opacity-100";
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
			const historyId = addEntry(entry.quizData, entry.isTimerEnabled, duration);
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

	return (
		<div className="container mx-auto flex min-h-screen max-w-2xl flex-col px-4 py-8">
			<header className="mb-10 flex flex-col items-center">
				<div className="flex w-full flex-col items-center gap-6">
					<div className="group cursor-default text-center">
						<h1 className="font-black text-4xl text-primary tracking-tight transition-transform group-hover:scale-105">
							{t("app.title")}
						</h1>
						<p className="font-medium text-subtle">{t("app.subtitle")}</p>
					</div>
					<div className="flex items-center gap-2">
						<LangSelect />
						<ThemeSelect value={theme} onChange={setTheme} />
					</div>
				</div>
			</header>

			<nav className="mb-8 flex border-overlay border-b">
				<button
					onClick={() => setTab("create")}
					className={cn(
						"-mb-0.5 border-b-2 px-6 py-3 font-bold transition-all",
						tabClass(state.currentTab, "create"),
					)}
					type="button"
				>
					{t("nav.create")}
				</button>
				<button
					onClick={() => setTab("play")}
					className={cn(
						"-mb-0.5 border-b-2 px-6 py-3 font-bold transition-all",
						tabClass(state.currentTab, "play"),
					)}
					type="button"
				>
					{t("nav.play")}
				</button>
				<button
					onClick={() => setTab("history")}
					className={cn(
						"-mb-0.5 border-b-2 px-6 py-3 font-bold transition-all",
						tabClass(state.currentTab, "history"),
					)}
					type="button"
				>
					{t("nav.history")}
				</button>
			</nav>

			<main className="grow">
				{state.currentTab === "create" ? (
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
				) : state.currentTab === "history" ? (
					<HistoryTab
						entries={entries}
						onPlayAgain={handlePlayAgain}
						onDelete={handleDeleteEntry}
					/>
				) : state.quizData.length === 0 ? (
					<div className="rounded-3xl border border-overlay border-dashed bg-surface/50 py-16 text-center">
						<p className="mb-6 font-medium text-muted">{t("empty.message")}</p>
						<button
							onClick={() => setTab("create")}
							className="font-bold text-primary underline transition-all hover:opacity-80"
							type="button"
						>
							{t("empty.action")}
						</button>
					</div>
				) : isGameOver ? (
					<ResultsTab
						score={state.score}
						totalQuestions={state.quizData.length}
						skippedCount={state.skippedCount}
						onNewQuiz={() => setTab("create")}
					/>
				) : (
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
				)}
			</main>

			<footer className="mt-12 text-center font-medium text-muted/40 text-xs">
				{t("footer")}
			</footer>

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
