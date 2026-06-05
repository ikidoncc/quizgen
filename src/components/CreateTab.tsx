import { Wand2 } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { useTranslation } from "../i18n/I18nProvider";
import type { Question } from "../types";
import {
	parseQuizText,
	prepareQuizOptions,
	TIMER_DURATION,
} from "../utils/quiz";
import { Checkbox } from "./Checkbox";

function validateQuizInput(
	input: string,
	t: (key: string, options?: Record<string, string | number>) => string,
): Question[] | string {
	const parsed = parseQuizText(input);
	if (parsed.length === 0) {
		return t("create.error");
	}
	return parsed;
}

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

	const handleGenerate = (e: React.FormEvent) => {
		e.preventDefault();
		if (isGenerating) return;

		const result = validateQuizInput(input, t);
		if (typeof result === "string") {
			onError(result);
			return;
		}

		setIsGenerating(true);
		onGenerate(prepareQuizOptions(result), timerEnabled);
	};

	return (
		<div className="fade-in slide-in-from-bottom-2 animate-in rounded-lg border border-overlay bg-surface p-6 shadow-md transition-all duration-300">
			<h2 className="mb-4 font-semibold font-serif text-main text-xl">
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
					<Wand2 className="mr-2 h-5 w-5" />
					{t("create.submit")}
				</button>
			</form>
		</div>
	);
};
