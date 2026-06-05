import { useState } from "react";
import { CreateTab } from "./components/CreateTab";
import { Modal } from "./components/Modal";
import { PlayTab } from "./components/PlayTab";
import { ResultsTab } from "./components/ResultsTab";
import { ThemeSelect } from "./components/ThemeSelect";
import { useQuizState } from "./hooks/useQuizState";
import { useTheme } from "./hooks/useTheme";

export function App() {
	const { theme, setTheme } = useTheme();
	const {
		state,
		setTab,
		setQuizData,
		resetQuiz,
		deleteQuiz,
		advanceQuestion,
		setTimeLeft,
	} = useQuizState();

	const [modalConfig, setModalConfig] = useState<{
		isOpen: boolean;
		title: string;
		message: string;
		onConfirm: () => void;
		onCancel?: () => void;
	}>({
		isOpen: false,
		title: "",
		message: "",
		onConfirm: () => {},
	});

	const showModal = (config: Omit<typeof modalConfig, "isOpen">) => {
		setModalConfig({ ...config, isOpen: true });
	};

	const closeModal = () => {
		setModalConfig((prev) => ({ ...prev, isOpen: false }));
	};

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
							QuizGen
						</h1>
						<p className="text-subtle font-medium">
							Crie seu quizz a partir de um texto
						</p>
					</div>
					<ThemeSelect value={theme} onChange={setTheme} />
				</div>
			</header>

			<nav className="flex border-b border-overlay mb-8">
				<button
					onClick={() => setTab("create")}
					className={`px-6 py-3 font-bold transition-all border-b-2 -mb-0.5 ${
						state.currentTab === "create"
							? "text-primary border-primary opacity-100"
							: "text-muted border-transparent opacity-60 hover:text-primary hover:opacity-100"
					}`}
					type="button"
				>
					Criar Quizz
				</button>
				<button
					onClick={() => setTab("play")}
					className={`px-6 py-3 font-bold transition-all border-b-2 -mb-0.5 ${
						state.currentTab === "play"
							? "text-primary border-primary opacity-100"
							: "text-muted border-transparent opacity-60 hover:text-primary hover:opacity-100"
					}`}
					type="button"
				>
					Jogar Quizz
				</button>
			</nav>

			<main className="grow">
				{state.currentTab === "create" ? (
					<CreateTab
						onGenerate={setQuizData}
						initialTimerEnabled={state.isTimerEnabled}
						onError={(msg) =>
							showModal({ title: "Erro", message: msg, onConfirm: closeModal })
						}
					/>
				) : state.quizData.length === 0 ? (
					<div className="text-center py-16 bg-surface/50 rounded-3xl border border-dashed border-overlay">
						<p className="text-muted mb-6 font-medium">
							Nenhum quizz gerado ainda.
						</p>
						<button
							onClick={() => setTab("create")}
							className="text-primary font-bold underline hover:opacity-80 transition-all"
							type="button"
						>
							Ir para Criar Quizz
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
						quizData={state.quizData}
						currentQuestionIndex={state.currentQuestionIndex}
						score={state.score}
						skippedCount={state.skippedCount}
						isTimerEnabled={state.isTimerEnabled}
						timeLeft={state.timeLeft}
						onTick={setTimeLeft}
						onAnswer={(isCorrect) => advanceQuestion(isCorrect)}
						onSkip={() => advanceQuestion(false, true)}
						onReset={() =>
							showModal({
								title: "Reiniciar Quizz",
								message: "Deseja reiniciar este quizz?",
								onConfirm: () => {
									resetQuiz();
									closeModal();
								},
								onCancel: closeModal,
							})
						}
						onDelete={() =>
							showModal({
								title: "Excluir Quizz",
								message: "Deseja excluir este quizz?",
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
				QuizGen &copy; 2026 • Made with React + Tailwind v4
			</footer>

			<Modal
				isOpen={modalConfig.isOpen}
				title={modalConfig.title}
				message={modalConfig.message}
				onConfirm={modalConfig.onConfirm}
				onCancel={modalConfig.onCancel}
			/>
		</div>
	);
}
