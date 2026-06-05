import { useCallback, useState } from "react";
import { useTranslation } from "./i18n/I18nProvider";
import { CreateTab } from "./components/CreateTab";
import { LangSelect } from "./components/LangSelect";
import { Modal } from "./components/Modal";
import { PlayTab } from "./components/PlayTab";
import { ResultsTab } from "./components/ResultsTab";
import { ThemeSelect } from "./components/ThemeSelect";
import { useQuizState } from "./hooks/useQuizState";
import { useTheme } from "./hooks/useTheme";
import type { Tab } from "./types";
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
	} = useQuizState();

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

	const showModal = useCallback((config: Omit<typeof modalConfig, "isOpen">) => {
		setModalConfig({ ...config, isOpen: true });
	}, []);

	const closeModal = useCallback(() => {
		setModalConfig((prev) => ({ ...prev, isOpen: false }));
	}, []);

	const isGameOver =
		state.quizData.length > 0 &&
		state.currentQuestionIndex >= state.quizData.length;

	return (
		<div className="container mx-auto px-4 py-8 max-w-2xl min-h-screen flex flex-col">
			<header className="flex flex-col items-center mb-10">
				<div className="w-full flex justify-between items-center mb-6">
					<div className="invisible w-10 sm:w-32"></div>
					<div className="text-center group cursor-default">
						<h1 className="text-4xl font-black text-primary tracking-tight transition-transform group-hover:scale-105">
							{t("app.title")}
						</h1>
						<p className="text-subtle font-medium">
							{t("app.subtitle")}
						</p>
					</div>
					<div className="flex items-center gap-2">
						<LangSelect />
						<ThemeSelect value={theme} onChange={setTheme} />
					</div>
				</div>
			</header>

			<nav className="flex border-b border-overlay mb-8">
				<button
					onClick={() => setTab("create")}
					className={cn("px-6 py-3 font-bold transition-all border-b-2 -mb-0.5", tabClass(state.currentTab, "create"))}
					type="button"
				>
					{t("nav.create")}
				</button>
				<button
					onClick={() => setTab("play")}
					className={cn("px-6 py-3 font-bold transition-all border-b-2 -mb-0.5", tabClass(state.currentTab, "play"))}
					type="button"
				>
					{t("nav.play")}
				</button>
			</nav>

			<main className="grow">
				{state.currentTab === "create" ? (
					<CreateTab
						onGenerate={setQuizData}
						initialTimerEnabled={state.isTimerEnabled}
						onError={(msg) =>
							showModal({ title: t("modal.title.error"), message: msg, confirmText: t("modal.ok"), onConfirm: closeModal })
						}
					/>
				) : state.quizData.length === 0 ? (
					<div className="text-center py-16 bg-surface/50 rounded-3xl border border-dashed border-overlay">
						<p className="text-muted mb-6 font-medium">
							{t("empty.message")}
						</p>
						<button
							onClick={() => setTab("create")}
							className="text-primary font-bold underline hover:opacity-80 transition-all"
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
									deleteQuiz();
									closeModal();
								},
								onCancel: closeModal,
							})
						}
					/>
				)}
			</main>

			<footer className="mt-12 text-center text-muted/40 text-xs font-medium">
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
