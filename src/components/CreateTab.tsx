import { Wand2, Zap, Brain, Sparkles, Key, Eye, EyeOff } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { useTranslation } from "../i18n/I18nProvider";
import type { Question, DifficultyMode } from "../types";
import {
	parseQuizText,
	prepareQuizOptionsWithAI,
	TIMER_DURATION,
} from "../utils/quiz";
import { Checkbox } from "./Checkbox";
import { cn } from "../utils/cn";

interface CreateTabProps {
	onGenerate: (data: Question[], timerEnabled: boolean) => void;
	initialTimerEnabled: boolean;
	onError: (message: string) => void;
}

export const CreateTab: React.FC<CreateTabProps> = ({
	onGenerate,
	initialTimerEnabled,
	onError,
}) => {
	const { t } = useTranslation();
	const [input, setInput] = useState("");
	const [timerEnabled, setTimerEnabled] = useState(initialTimerEnabled);
	const [isGenerating, setIsGenerating] = useState(false);
	const [difficultyMode, setDifficultyMode] = useState<DifficultyMode>("easy");
	const [apiKey, setApiKey] = useState(
		() => localStorage.getItem("gemini_api_key") || "",
	);
	const [showApiKey, setShowApiKey] = useState(false);

	const handleApiKeyChange = (val: string) => {
		setApiKey(val);
		localStorage.setItem("gemini_api_key", val);
	};

	const handleGenerate = async (e: React.FormEvent) => {
		e.preventDefault();
		if (isGenerating) return;

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
				apiKey,
			);
			onGenerate(questions, timerEnabled);
		} catch (err) {
			console.error(err);
			onError(t("create.error"));
		} finally {
			setIsGenerating(false);
		}
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

	return (
		<div className="fade-in slide-in-from-bottom-2 animate-in rounded-lg border border-overlay bg-surface p-6 shadow-md transition-all duration-300">
			<h2 className="mb-4 font-semibold text-main text-xl">
				{t("create.heading")}
			</h2>
			<p className="mb-4 text-sm text-subtle">{t("create.formatLabel")}</p>
			<pre className="mb-4 overflow-x-auto rounded border border-overlay bg-overlay p-2 text-muted text-xs">
				{t("create.formatExample")}
			</pre>

			<form onSubmit={handleGenerate}>
				<textarea
					value={input}
					onChange={(e) => setInput(e.target.value)}
					className="mb-4 h-64 w-full rounded-md border border-overlay bg-base p-3 text-main transition-all placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary"
					placeholder={t("create.placeholder")}
				/>

				{/* Selection mode cards */}
				<div className="mb-6">
					<span className="mb-2 block font-semibold text-main text-sm">
						{t("create.modeLabel")}
					</span>
					<div className="grid grid-cols-3 gap-3">
						{modes.map(({ id, icon: Icon, title, desc }) => (
							<button
								key={id}
								type="button"
								onClick={() => setDifficultyMode(id)}
								className={cn(
									"flex flex-col items-center rounded-xl border p-3 text-center transition-all duration-200 cursor-pointer",
									difficultyMode === id
										? "border-primary bg-primary/5 text-primary scale-[1.02] shadow-sm"
										: "border-overlay bg-base text-muted hover:border-primary/50 hover:text-main",
								)}
							>
								<Icon className="mb-1.5 h-5 w-5" />
								<span className="font-bold text-xs">{title}</span>
								<span className="mt-1 font-medium text-[9px] opacity-80 leading-tight">
									{desc}
								</span>
							</button>
						))}
					</div>
				</div>

				{/* API Key Input */}
				{difficultyMode !== "easy" && (
					<div className="fade-in animate-in slide-in-from-top-1 mb-6 duration-200">
						<div className="mb-2 flex items-center justify-between">
							<label
								htmlFor="api-key"
								className="font-semibold text-main text-sm"
							>
								{t("create.apiKeyLabel")}
							</label>
							<a
								href="https://aistudio.google.com/"
								target="_blank"
								rel="noreferrer"
								className="text-primary text-xs hover:underline"
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
								className="w-full rounded-md border border-overlay bg-base py-2 pl-9 pr-10 text-main transition-all placeholder:text-muted/40 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
								placeholder={t("create.apiKeyPlaceholder")}
							/>
							<button
								type="button"
								onClick={() => setShowApiKey(!showApiKey)}
								className="absolute right-3 text-muted hover:text-main cursor-pointer"
							>
								{showApiKey ? (
									<EyeOff className="h-4 w-4" />
								) : (
									<Eye className="h-4 w-4" />
								)}
							</button>
						</div>
						{apiKey.trim() === "" && (
							<p className="mt-1.5 text-danger text-[11px] font-medium leading-tight">
								{t("create.apiKeyWarning")}
							</p>
						)}
					</div>
				)}

				<div className="mb-6 flex items-center">
					<Checkbox
						id="timer-checkbox"
						checked={timerEnabled}
						onChange={setTimerEnabled}
					/>
					<label
						htmlFor="timer-checkbox"
						className="ml-2 cursor-pointer select-none font-medium text-main text-sm"
					>
						{t("create.timerLabel", { count: TIMER_DURATION / 60 })}
					</label>
				</div>

				<button
					disabled={isGenerating}
					className="flex w-full items-center justify-center rounded bg-primary px-4 py-3 font-bold text-white shadow-sm transition-all hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
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
