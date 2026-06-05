import { ChevronDown, Globe } from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "../i18n/I18nProvider";
import { cn } from "../utils/cn";

export const LangSelect: React.FC = () => {
	const { t, language, setLanguage } = useTranslation();
	const [isOpen, setIsOpen] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);

	const langs = [
		{ value: "pt-BR", label: t("lang.pt-BR") },
		{ value: "en", label: t("lang.en") },
	] as const;

	const selectedLang = langs.find((l) => l.value === language) || langs[0];

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				containerRef.current &&
				!containerRef.current.contains(event.target as Node)
			) {
				setIsOpen(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	return (
		<div className="relative inline-block text-left" ref={containerRef}>
			<button
				onClick={() => setIsOpen(!isOpen)}
				className="flex items-center justify-center sm:justify-between w-10 sm:w-32 bg-surface border border-overlay text-main text-xs rounded-lg p-2 outline-none cursor-pointer hover:bg-overlay transition-all active:scale-95"
				type="button"
			>
				<span className="flex items-center">
					<Globe className="w-4 h-4" />
					<span className="hidden sm:inline ml-2">{selectedLang.label}</span>
				</span>
				<ChevronDown
					className={cn("w-4 h-4 ml-1 hidden sm:block transition-transform duration-200", isOpen && "rotate-180")}
				/>
			</button>

			{isOpen && (
				<div className="absolute right-0 mt-2 w-32 bg-surface border border-overlay rounded-lg shadow-lg z-50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200">
					{langs.map((lang) => (
						<button
							type="button"
							key={lang.value}
							className={cn("w-full px-4 py-3 text-xs text-main hover:bg-overlay cursor-pointer flex items-center transition-colors", language === lang.value && "bg-overlay/50 font-bold")}
							onClick={() => {
								setLanguage(lang.value);
								setIsOpen(false);
							}}
						>
							<Globe className="w-4 h-4" />
							<span className="ml-2">{lang.label}</span>
						</button>
					))}
				</div>
			)}
		</div>
	);
};
