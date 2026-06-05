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
				className="flex w-10 cursor-pointer items-center justify-center rounded-lg border border-overlay bg-surface p-2 text-main text-xs outline-none transition-all hover:bg-overlay active:scale-95 sm:w-32 sm:justify-between"
				type="button"
			>
				<span className="flex items-center">
					<Globe className="h-4 w-4" />
					<span className="ml-2 hidden sm:inline">{selectedLang.label}</span>
				</span>
				<ChevronDown
					className={cn(
						"ml-1 hidden h-4 w-4 transition-transform duration-200 sm:block",
						isOpen && "rotate-180",
					)}
				/>
			</button>

			{isOpen && (
				<div className="fade-in slide-in-from-top-1 absolute right-0 z-50 mt-2 w-32 animate-in overflow-hidden rounded-lg border border-overlay bg-surface shadow-lg duration-200">
					{langs.map((lang) => (
						<button
							type="button"
							key={lang.value}
							className={cn(
								"flex w-full cursor-pointer items-center px-4 py-3 text-main text-xs transition-colors hover:bg-overlay",
								language === lang.value && "bg-overlay/50 font-bold",
							)}
							onClick={() => {
								setLanguage(lang.value);
								setIsOpen(false);
							}}
						>
							<Globe className="h-4 w-4" />
							<span className="ml-2">{lang.label}</span>
						</button>
					))}
				</div>
			)}
		</div>
	);
};
