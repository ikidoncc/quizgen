import {
	Bot,
	Brain,
	ChevronDown,
	Eye,
	EyeOff,
	Key,
	Sparkles,
	Wand2,
	Zap,
} from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "../i18n/I18nProvider";
import type { AIProvider, DifficultyMode, Question } from "../types";
import { cn } from "../utils/cn";
import {
	generateQuizFromText,
	parseQuizText,
	prepareQuizOptionsWithAI,
} from "../utils/quiz";
import { Checkbox } from "./Checkbox";

interface CreateTabProps {
	onGenerate: (
		data: Question[],
		timerEnabled: boolean,
		timerDuration: number,
	) => void;
	initialTimerEnabled: boolean;
	onError: (message: string) => void;
}

export const CreateTab: React.FC<CreateTabProps> = ({
	onGenerate,
	initialTimerEnabled,
	onError,
}) => {
	const { t } = useTranslation();
	const [inputType, setInputType] = useState<"formatted" | "raw">("formatted");
	const [input, setInput] = useState("");
	const [questionCount, setQuestionCount] = useState(5);
	const [timerEnabled, setTimerEnabled] = useState(initialTimerEnabled);
	const [isGenerating, setIsGenerating] = useState(false);
	const [difficultyMode, setDifficultyMode] = useState<DifficultyMode>("easy");
	const [aiProvider, setAiProvider] = useState<AIProvider>(
		() => (localStorage.getItem("ai_provider") as AIProvider) || "gemini",
	);
	const [apiKey, setApiKey] = useState("");
	const [showApiKey, setShowApiKey] = useState(false);
	const [isProviderOpen, setIsProviderOpen] = useState(false);

	const [minutes, setMinutes] = useState(1);
	const [seconds, setSeconds] = useState(0);

	const providerRef = useRef<HTMLDivElement>(null);

	// Load the API Key for the selected provider when it changes
	useEffect(() => {
		const savedKey = localStorage.getItem(`${aiProvider}_api_key`) || "";
		setApiKey(savedKey);
		setShowApiKey(false); // Reset key visibility for safety
	}, [aiProvider]);

	// Handle click outside to close the custom provider select dropdown
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				providerRef.current &&
				!providerRef.current.contains(event.target as Node)
			) {
				setIsProviderOpen(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	// Auto-fallback from easy to normal mode when switching to raw text input
	useEffect(() => {
		if (inputType === "raw" && difficultyMode === "easy") {
			setDifficultyMode("normal");
		}
	}, [inputType, difficultyMode]);

	const handleApiKeyChange = (val: string) => {
		setApiKey(val);
		localStorage.setItem(`${aiProvider}_api_key`, val);
	};

	const handleProviderChange = (val: AIProvider) => {
		setAiProvider(val);
		localStorage.setItem("ai_provider", val);
	};

	const handleGenerate = async (e: React.FormEvent) => {
		e.preventDefault();
		if (isGenerating) return;

		let totalSeconds = 60;
		if (timerEnabled) {
			totalSeconds = minutes * 60 + seconds;
			if (totalSeconds <= 0) {
				onError(t("create.timerZeroError"));
				return;
			}
		}

		if (inputType === "formatted") {
			const parsed = parseQuizText(input);
			if (parsed.length === 0) {
				onError(t("create.error"));
				return;
			}

			if (difficultyMode !== "easy" && !apiKey.trim()) {
				onError(t("create.apiKeyWarning"));
				return;
			}

			setIsGenerating(true);
			try {
				const questions = await prepareQuizOptionsWithAI(
					parsed,
					difficultyMode,
					aiProvider,
					apiKey,
				);
				onGenerate(questions, timerEnabled, totalSeconds);
			} catch (err) {
				console.error(err);
				onError(t("create.error"));
			} finally {
				setIsGenerating(false);
			}
		} else {
			// Geração a partir de texto livre (Exige IA)
			if (!input.trim()) {
				onError(
					t("flashcard.create.emptyInputError") ||
						"Por favor, insira o texto para gerar o quiz.",
				);
				return;
			}

			if (!apiKey.trim()) {
				onError(t("create.apiKeyWarning"));
				return;
			}

			setIsGenerating(true);
			try {
				const questions = await generateQuizFromText(
					input,
					aiProvider,
					apiKey,
					questionCount,
					difficultyMode === "easy" ? "normal" : difficultyMode,
				);
				onGenerate(questions, timerEnabled, totalSeconds);
			} catch (err) {
				console.error(err);
				onError(
					(err as Error).message ||
						"Erro ao gerar o quiz. Verifique as configurações de IA ou chave de API.",
				);
			} finally {
				setIsGenerating(false);
			}
		}
	};

	const getProviderLink = () => {
		if (aiProvider === "gemini") return "https://aistudio.google.com/";
		if (aiProvider === "groq") return "https://console.groq.com/keys";
		return "https://platform.openai.com/api-keys";
	};

	const getProviderName = () => {
		if (aiProvider === "gemini") return "Gemini";
		if (aiProvider === "groq") return "Groq";
		return "OpenAI";
	};

	const modes = [
		{
			id: "easy" as const,
			icon: Zap,
			title: t("create.mode.easy.title"),
			desc: t("create.mode.easy.desc"),
		},
		{
			id: "normal" as const,
			icon: Brain,
			title: t("create.mode.normal.title"),
			desc: t("create.mode.normal.desc"),
		},
		{
			id: "hard" as const,
			icon: Sparkles,
			title: t("create.mode.hard.title"),
			desc: t("create.mode.hard.desc"),
		},
	];

	const visibleModes =
		inputType === "raw" ? modes.filter((m) => m.id !== "easy") : modes;

	const showAiConfig = inputType === "raw" || difficultyMode !== "easy";

	return (
		<div className="fade-in slide-in-from-bottom-2 animate-in rounded-lg border border-overlay bg-surface p-6 shadow-md transition-all duration-300">
			{/* Input Type Selector */}
			<div className="mb-6">
				<span className="mb-2 block font-semibold text-main text-sm">
					{t("create.inputTypeLabel") || "Método de Geração"}
				</span>
				<div className="grid grid-cols-2 gap-2 rounded-xl border border-overlay bg-base p-1">
					<button
						type="button"
						onClick={() => setInputType("formatted")}
						className={cn(
							"cursor-pointer rounded-lg py-2 font-bold text-xs transition-all",
							inputType === "formatted"
								? "bg-surface font-extrabold text-primary shadow-sm"
								: "text-muted hover:text-main",
						)}
					>
						{t("create.inputFormatted") || "Texto Formatado (Q/A/O)"}
					</button>
					<button
						type="button"
						onClick={() => setInputType("raw")}
						className={cn(
							"cursor-pointer rounded-lg py-2 font-bold text-xs transition-all",
							inputType === "raw"
								? "bg-surface font-extrabold text-primary shadow-sm"
								: "text-muted hover:text-main",
						)}
					>
						{t("create.inputRaw") || "Texto Livre (Artigo, Resumo)"}
					</button>
				</div>
			</div>

			<h2 className="mb-4 font-semibold text-main text-xl">
				{inputType === "formatted"
					? t("create.heading")
					: t("create.headingRaw") || "Colar Conteúdo para IA"}
			</h2>

			{inputType === "formatted" ? (
				<>
					<p className="mb-4 text-sm text-subtle">{t("create.formatLabel")}</p>
					<pre className="mb-4 overflow-x-auto rounded border border-overlay bg-overlay p-2 text-muted text-xs">
						{t("create.formatExample")}
					</pre>
				</>
			) : (
				<p className="mb-4 text-sm text-subtle">
					{t("create.rawDescription") ||
						"Cole seu texto (artigo, resumo, anotação) abaixo. A Inteligência Artificial lerá o conteúdo e criará perguntas de múltipla escolha factuais."}
				</p>
			)}

			<form onSubmit={handleGenerate}>
				<textarea
					value={input}
					onChange={(e) => setInput(e.target.value)}
					className="mb-4 h-64 w-full rounded-md border border-overlay bg-base p-3 text-main text-sm transition-all placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary"
					placeholder={
						inputType === "formatted"
							? t("create.placeholder")
							: t("create.rawPlaceholder") ||
								"Cole seu artigo, resumo ou anotações para gerar as perguntas do quiz..."
					}
				/>

				{/* Selection mode cards */}
				<div className="mb-6">
					<span className="mb-2 block font-semibold text-main text-sm">
						{t("create.modeLabel")}
					</span>
					<div
						className={cn(
							"grid gap-3",
							visibleModes.length === 2 ? "grid-cols-2" : "grid-cols-3",
						)}
					>
						{visibleModes.map(({ id, icon: Icon, title, desc }) => (
							<button
								key={id}
								type="button"
								onClick={() => setDifficultyMode(id)}
								className={cn(
									"flex cursor-pointer flex-col items-center rounded-xl border p-3 text-center transition-all duration-200",
									difficultyMode === id
										? "scale-[1.02] border-primary bg-primary/5 font-extrabold text-primary shadow-sm"
										: "border-overlay bg-base text-muted hover:border-primary/50 hover:text-main",
								)}
							>
								<Icon className="mb-1.5 h-5 w-5" />
								<span className="font-bold text-xs">{title}</span>
								<span className="mt-1 font-medium text-[9px] leading-tight opacity-80">
									{desc}
								</span>
							</button>
						))}
					</div>
				</div>

				{/* Quantity selector for Raw input */}
				{inputType === "raw" && (
					<div className="mb-6">
						<label
							htmlFor="question-count"
							className="mb-2 block font-semibold text-main text-sm"
						>
							{t("create.questionCountLabel") || "Quantidade de Perguntas"}
						</label>
						<div className="relative flex items-center">
							<input
								id="question-count"
								type="number"
								min="3"
								max="20"
								value={questionCount}
								onChange={(e) =>
									setQuestionCount(
										Math.max(3, Math.min(20, Number(e.target.value))),
									)
								}
								className="w-full rounded-lg border border-overlay bg-base p-2.5 text-main text-sm outline-none transition-all focus:ring-1 focus:ring-primary"
							/>
						</div>
					</div>
				)}

				{/* AI Configuration Section */}
				{showAiConfig && (
					<div className="fade-in slide-in-from-top-1 mb-6 animate-in duration-200">
						{/* Custom AI Provider selector */}
						<div className="mb-4">
							<span className="mb-2 block font-semibold text-main text-sm">
								{t("create.providerLabel")}
							</span>
							<div
								className="relative inline-block w-full text-left"
								ref={providerRef}
							>
								<button
									onClick={() => setIsProviderOpen(!isProviderOpen)}
									className="flex w-full cursor-pointer items-center justify-between rounded-lg border border-overlay bg-base p-2.5 text-main text-sm outline-none transition-all hover:bg-overlay/50 active:scale-[0.99]"
									type="button"
								>
									<span className="flex items-center">
										<Bot className="h-4 w-4 text-primary" />
										<span className="ml-2 font-medium">
											{aiProvider === "gemini" && "Gemini (Google AI Studio)"}
											{aiProvider === "groq" && "Groq (Llama 3.1)"}
											{aiProvider === "openai" && "OpenAI (ChatGPT)"}
										</span>
									</span>
									<ChevronDown
										className={cn(
											"ml-1 h-4 w-4 transition-transform duration-200",
											isProviderOpen && "rotate-180",
										)}
									/>
								</button>

								{isProviderOpen && (
									<div className="fade-in slide-in-from-top-1 absolute left-0 z-50 mt-1 w-full animate-in overflow-hidden rounded-lg border border-overlay bg-surface shadow-lg duration-200">
										{[
											{
												value: "gemini" as const,
												label: "Gemini (Google AI Studio)",
											},
											{ value: "groq" as const, label: "Groq (Llama 3.1)" },
											{ value: "openai" as const, label: "OpenAI (ChatGPT)" },
										].map((prov) => (
											<button
												type="button"
												key={prov.value}
												className={cn(
													"flex w-full cursor-pointer items-center px-4 py-3 text-left text-main text-sm transition-colors hover:bg-overlay",
													aiProvider === prov.value &&
														"bg-overlay/50 font-bold",
												)}
												onClick={() => {
													handleProviderChange(prov.value);
													setIsProviderOpen(false);
												}}
											>
												<Bot className="h-4 w-4 text-primary/70" />
												<span className="ml-2.5">{prov.label}</span>
											</button>
										))}
									</div>
								)}
							</div>
						</div>

						{/* API Key Input */}
						<div className="mb-2 flex items-center justify-between">
							<label
								htmlFor="api-key"
								className="font-semibold text-main text-sm"
							>
								{t("create.apiKeyLabel", { provider: getProviderName() })}
							</label>
							<a
								href={getProviderLink()}
								target="_blank"
								rel="noreferrer"
								className="font-bold text-primary text-xs hover:underline"
							>
								{t("create.getApiKey")}
							</a>
						</div>
						<div className="relative flex items-center">
							<Key className="absolute left-3 h-4 w-4 text-muted/65" />
							<input
								id="api-key"
								type={showApiKey ? "text" : "password"}
								value={apiKey}
								onChange={(e) => handleApiKeyChange(e.target.value)}
								className="w-full rounded-md border border-overlay bg-base py-2 pr-10 pl-9 text-main text-sm transition-all placeholder:text-muted/40 focus:outline-none focus:ring-2 focus:ring-primary"
								placeholder={t("create.apiKeyPlaceholder", {
									provider: getProviderName(),
								})}
							/>
							<button
								type="button"
								onClick={() => setShowApiKey(!showApiKey)}
								className="absolute right-3 cursor-pointer text-muted hover:text-main"
							>
								{showApiKey ? (
									<EyeOff className="h-4 w-4" />
								) : (
									<Eye className="h-4 w-4" />
								)}
							</button>
						</div>
						{apiKey.trim() === "" && (
							<p className="mt-1.5 font-medium text-[11px] text-danger leading-tight">
								{t("create.apiKeyWarning")}
							</p>
						)}
					</div>
				)}

				{/* Timer Configuration Section */}
				<div className="mb-6">
					<div className="flex items-center">
						<Checkbox
							id="timer-checkbox"
							checked={timerEnabled}
							onChange={setTimerEnabled}
						/>
						<label
							htmlFor="timer-checkbox"
							className="ml-2 cursor-pointer select-none font-medium text-main text-sm"
						>
							{t("create.timerLabel")}
						</label>
					</div>

					{timerEnabled && (
						<div className="fade-in slide-in-from-top-1 mt-3 flex animate-in items-center gap-4 duration-200">
							<div className="flex flex-col">
								<span className="mb-1 font-semibold text-muted text-xs">
									{t("create.timerMinutes")}
								</span>
								<div className="relative flex items-center">
									<input
										type="number"
										min="0"
										max="59"
										value={minutes}
										onChange={(e) =>
											setMinutes(
												Math.max(0, Math.min(59, Number(e.target.value))),
											)
										}
										className="no-spinner w-20 rounded-md border border-overlay bg-base py-1.5 pr-8 pl-3 text-center font-semibold text-main text-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary"
									/>
									<span className="pointer-events-none absolute right-2 font-medium text-muted text-xs">
										m
									</span>
								</div>
							</div>
							<div className="flex flex-col">
								<span className="mb-1 font-semibold text-muted text-xs">
									{t("create.timerSeconds")}
								</span>
								<div className="relative flex items-center">
									<input
										type="number"
										min="0"
										max="59"
										value={seconds}
										onChange={(e) =>
											setSeconds(
												Math.max(0, Math.min(59, Number(e.target.value))),
											)
										}
										className="no-spinner w-20 rounded-md border border-overlay bg-base py-1.5 pr-8 pl-3 text-center font-semibold text-main text-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary"
									/>
									<span className="pointer-events-none absolute right-2 font-medium text-muted text-xs">
										s
									</span>
								</div>
							</div>
						</div>
					)}
				</div>

				<button
					disabled={isGenerating}
					className="flex w-full cursor-pointer items-center justify-center rounded bg-primary px-4 py-3.5 font-bold text-white shadow-sm transition-all hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
					type="submit"
				>
					<Wand2
						className={cn("mr-2 h-5 w-5", isGenerating && "animate-spin")}
					/>
					{isGenerating ? t("create.generatingWithAI") : t("create.submit")}
				</button>
			</form>
		</div>
	);
};
