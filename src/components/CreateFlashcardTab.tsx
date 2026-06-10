import {
	Bot,
	ChevronDown,
	Eye,
	EyeOff,
	FileText,
	Key,
	Layers,
	Wand2,
} from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "../i18n/I18nProvider";
import type { AIProvider, FlashcardSet } from "../types";
import { cn } from "../utils/cn";
import {
	createFlashcardSetManual,
	generateFlashcardSet,
	parseFlashcardText,
} from "../utils/flashcard";

interface CreateFlashcardTabProps {
	onGenerate: (deck: FlashcardSet) => void;
	onError: (message: string) => void;
}

export const CreateFlashcardTab: React.FC<CreateFlashcardTabProps> = ({
	onGenerate,
	onError,
}) => {
	const { t } = useTranslation();
	const [inputType, setInputType] = useState<"ai" | "manual">("ai");
	const [deckTitle, setDeckTitle] = useState("");
	const [input, setInput] = useState("");
	const [cardCount, setCardCount] = useState(10);
	const [isGenerating, setIsGenerating] = useState(false);
	const [aiProvider, setAiProvider] = useState<AIProvider>(
		() => (localStorage.getItem("ai_provider") as AIProvider) || "gemini",
	);
	const [apiKey, setApiKey] = useState("");
	const [showApiKey, setShowApiKey] = useState(false);
	const [isProviderOpen, setIsProviderOpen] = useState(false);

	const providerRef = useRef<HTMLDivElement>(null);

	// Load the API Key when provider changes
	useEffect(() => {
		const savedKey = localStorage.getItem(`${aiProvider}_api_key`) || "";
		setApiKey(savedKey);
		setShowApiKey(false);
	}, [aiProvider]);

	// Close provider select dropdown when clicking outside
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

		if (!input.trim()) {
			onError(
				t("flashcard.create.emptyInputError") ||
					"Por favor, insira o texto para gerar os flashcards.",
			);
			return;
		}

		if (inputType === "ai") {
			if (!apiKey.trim()) {
				onError(t("create.apiKeyWarning"));
				return;
			}

			setIsGenerating(true);
			try {
				const deck = await generateFlashcardSet(
					input,
					aiProvider,
					apiKey,
					cardCount,
				);
				if (deckTitle.trim()) {
					deck.title = deckTitle.trim();
				}
				onGenerate(deck);
				setInput("");
				setDeckTitle("");
			} catch (err) {
				console.error(err);
				onError(
					(err as Error).message ||
						"Erro ao gerar os flashcards. Verifique sua chave de API ou conexão.",
				);
			} finally {
				setIsGenerating(false);
			}
		} else {
			// Geração manual offline
			const rawCards = parseFlashcardText(input);
			if (rawCards.length === 0) {
				onError(
					t("flashcard.create.formatError") ||
						"Nenhum cartão encontrado. Use o formato Q: Frente e A: Verso.",
				);
				return;
			}

			const deck = createFlashcardSetManual(
				deckTitle.trim() || t("flashcard.create.defaultTitle") || "Deck Manual",
				rawCards,
			);
			onGenerate(deck);
			setInput("");
			setDeckTitle("");
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
						onClick={() => setInputType("ai")}
						className={cn(
							"cursor-pointer rounded-lg py-2 font-bold text-xs transition-all",
							inputType === "ai"
								? "bg-surface font-extrabold text-primary shadow-sm"
								: "text-muted hover:text-main",
						)}
					>
						{t("flashcard.inputType.ai") || "Inteligência Artificial (IA)"}
					</button>
					<button
						type="button"
						onClick={() => setInputType("manual")}
						className={cn(
							"cursor-pointer rounded-lg py-2 font-bold text-xs transition-all",
							inputType === "manual"
								? "bg-surface font-extrabold text-primary shadow-sm"
								: "text-muted hover:text-main",
						)}
					>
						{t("flashcard.inputType.manual") || "Manual / Offline (Q/A)"}
					</button>
				</div>
			</div>

			<div className="mb-4 flex items-center gap-2">
				<Layers className="h-5 w-5 text-primary" />
				<h2 className="font-semibold text-main text-xl">
					{inputType === "ai"
						? t("flashcard.create.heading") || "Gerar Flashcards com IA"
						: t("flashcard.create.headingManual") || "Criar Flashcards Manuais"}
				</h2>
			</div>

			{inputType === "ai" ? (
				<p className="mb-4 text-sm text-subtle">
					{t("flashcard.create.description") ||
						"Cole um texto corrido (artigo, resumo, anotação) abaixo. A inteligência artificial irá ler e sintetizar a quantidade escolhida de cartões de memorização contendo termos e definições fundamentais."}
				</p>
			) : (
				<>
					<p className="mb-4 text-sm text-subtle">
						{t("flashcard.create.descriptionManual") ||
							"Insira seus flashcards abaixo no formato estruturado offline. Não é necessário chave de API."}
					</p>
					<pre className="mb-4 overflow-x-auto rounded border border-overlay bg-overlay p-2 text-muted text-xs">
						{
							"Q: Pergunta ou conceito (Frente)\nA: Resposta ou explicação (Verso)"
						}
					</pre>
				</>
			)}

			<form onSubmit={handleGenerate}>
				{/* Deck Title Input */}
				<div className="mb-4">
					<label
						htmlFor="deck-title"
						className="mb-2 block font-semibold text-main text-sm"
					>
						{t("flashcard.create.titleLabel") || "Título do Deck (Opcional)"}
					</label>
					<input
						id="deck-title"
						type="text"
						value={deckTitle}
						onChange={(e) => setDeckTitle(e.target.value)}
						className="w-full rounded-lg border border-overlay bg-base p-2.5 text-main text-sm outline-none transition-all placeholder:text-muted/40 focus:ring-1 focus:ring-primary"
						placeholder={
							inputType === "ai"
								? t("flashcard.create.titlePlaceholder") ||
									"Deixe em branco para título automático..."
								: "Insira o título do seu deck..."
						}
					/>
				</div>

				<textarea
					value={input}
					onChange={(e) => setInput(e.target.value)}
					className="mb-4 h-64 w-full rounded-md border border-overlay bg-base p-3 text-main text-sm transition-all placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary"
					placeholder={
						inputType === "ai"
							? t("flashcard.create.placeholder") ||
								"Cole o texto do qual deseja estudar conceitos e definições..."
							: "Q: Frente do cartão 1\nA: Verso do cartão 1\n\nQ: Frente do cartão 2\nA: Verso do cartão 2"
					}
				/>

				{inputType === "ai" ? (
					<>
						{/* Card count selector */}
						<div className="mb-6">
							<label
								htmlFor="card-count"
								className="mb-2 block font-semibold text-main text-sm"
							>
								{t("flashcard.create.countLabel") || "Quantidade de Flashcards"}
							</label>
							<input
								id="card-count"
								type="number"
								min="3"
								max="30"
								value={cardCount}
								onChange={(e) =>
									setCardCount(
										Math.max(3, Math.min(30, Number(e.target.value))),
									)
								}
								className="w-full rounded-lg border border-overlay bg-base p-2.5 text-main text-sm outline-none transition-all focus:ring-1 focus:ring-primary"
							/>
						</div>

						{/* AI Configuration Section */}
						<div className="mb-6">
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
															"bg-primary/5 font-semibold text-primary",
													)}
													onClick={() => {
														handleProviderChange(prov.value);
														setIsProviderOpen(false);
													}}
												>
													{prov.label}
												</button>
											))}
										</div>
									)}
								</div>
							</div>

							<div>
								<div className="mb-2 flex items-center justify-between">
									<label
										htmlFor="api-key"
										className="flex items-center gap-1.5 font-semibold text-main text-sm"
									>
										<Key className="h-4 w-4 text-muted" />
										{t("create.apiKeyLabel", { provider: getProviderName() })}
									</label>
									<a
										href={getProviderLink()}
										target="_blank"
										rel="noopener noreferrer"
										className="font-bold text-primary text-xs hover:underline"
									>
										{t("create.getApiKey")}
									</a>
								</div>
								<div className="relative">
									<input
										id="api-key"
										type={showApiKey ? "text" : "password"}
										value={apiKey}
										onChange={(e) => handleApiKeyChange(e.target.value)}
										placeholder={t("create.apiKeyPlaceholder", {
											provider: getProviderName(),
										})}
										className="w-full rounded-lg border border-overlay bg-base p-2.5 pr-10 text-main text-sm outline-none transition-all placeholder:text-muted/50 focus:ring-1 focus:ring-primary"
									/>
									<button
										type="button"
										onClick={() => setShowApiKey(!showApiKey)}
										className="absolute top-1/2 right-2 -translate-y-1/2 cursor-pointer p-1 text-muted transition-colors hover:text-main"
									>
										{showApiKey ? (
											<EyeOff className="h-4 w-4" />
										) : (
											<Eye className="h-4 w-4" />
										)}
									</button>
								</div>
								<p className="mt-1.5 text-muted text-xs">
									{t("create.apiKeyWarning")}
								</p>
							</div>
						</div>
					</>
				) : null}

				<button
					type="submit"
					disabled={isGenerating}
					className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3.5 font-bold text-base text-surface shadow-md transition-all hover:bg-primary/95 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
				>
					{isGenerating ? (
						<>
							<div className="h-4 w-4 animate-spin rounded-full border-2 border-surface border-t-transparent" />
							{t("flashcard.create.generating") ||
								"Analisando texto e gerando cartões..."}
						</>
					) : inputType === "ai" ? (
						<>
							<Wand2 className="h-4 w-4" />
							{t("flashcard.create.submit") || "Gerar Flashcards"}
						</>
					) : (
						<>
							<FileText className="h-4 w-4" />
							{t("flashcard.create.submitManual") ||
								"Criar Flashcards (Offline)"}
						</>
					)}
				</button>
			</form>
		</div>
	);
};
