import { Wand2 } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { useTranslation } from "../i18n/I18nProvider";
import type { Question } from "../types";
import { parseQuizText, prepareQuizOptions, TIMER_DURATION } from "../utils/quiz";

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
		<div className="bg-surface p-6 rounded-lg shadow-md border border-overlay transition-all animate-in fade-in slide-in-from-bottom-2 duration-300">
			<h2 className="text-xl font-semibold mb-4 text-main font-serif">
				{t("create.heading")}
			</h2>
			<p className="text-sm text-subtle mb-4">{t("create.formatLabel")}</p>
			<pre className="bg-overlay p-2 rounded text-xs mb-4 text-muted border border-overlay overflow-x-auto">
				{t("create.formatExample")}
			</pre>

			<form onSubmit={handleGenerate}>
				<textarea
					value={input}
					onChange={(e) => setInput(e.target.value)}
					className="w-full h-64 p-3 bg-base border border-overlay text-main rounded-md focus:ring-2 focus:ring-primary focus:outline-none mb-4 transition-all placeholder:text-muted/50"
					placeholder={t("create.placeholder")}
				/>

				<div className="flex items-center mb-6">
					<input
						type="checkbox"
						id="timer-checkbox"
						checked={timerEnabled}
						onChange={(e) => setTimerEnabled(e.target.checked)}
						className="w-4 h-4 text-primary bg-base border-overlay rounded focus:ring-primary focus:ring-2 cursor-pointer transition-all"
					/>
					<label
						htmlFor="timer-checkbox"
						className="ml-2 text-sm font-medium text-main cursor-pointer select-none"
					>
						{t("create.timerLabel", { count: TIMER_DURATION / 60 })}
					</label>
				</div>

				<button
					disabled={isGenerating}
					className="w-full flex items-center justify-center bg-primary text-white font-bold py-3 px-4 rounded hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] shadow-sm"
					type="submit"
				>
					<Wand2 className="w-5 h-5 mr-2" />
					{t("create.submit")}
				</button>
			</form>
		</div>
	);
};
