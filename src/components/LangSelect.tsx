import { ChevronDown, Globe } from "lucide-react";
import type React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "../i18n/I18nProvider";
import { cn } from "../utils/cn";

export const LangSelect: React.FC = () => {
	const { t, language, setLanguage } = useTranslation();
	const [isOpen, setIsOpen] = useState(false);
	const [openUpward, setOpenUpward] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);

	const langs = useMemo(
		() =>
			[
				{ value: "pt-BR", label: t("lang.pt-BR") },
				{ value: "en", label: t("lang.en") },
			] as const,
		[t],
	);

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

	useEffect(() => {
		if (isOpen && containerRef.current) {
			const rect = containerRef.current.getBoundingClientRect();
			const spaceBelow = window.innerHeight - rect.bottom;
			setOpenUpward(spaceBelow < 120);
		}
	}, [isOpen]);

	return (
		<div className="relative w-full text-left" ref={containerRef}>
			<button
				onClick={() => setIsOpen(!isOpen)}
				className="flex w-full cursor-pointer items-center justify-between rounded-lg border border-overlay bg-surface p-2.5 text-main text-xs outline-none transition-all hover:bg-overlay active:scale-95"
				type="button"
			>
				<span className="flex items-center">
					<Globe className="h-4 w-4" />
					<span className="ml-2 font-medium">{selectedLang.label}</span>
				</span>
				<ChevronDown
					className={cn(
						"ml-1 h-4 w-4 transition-transform duration-200",
						isOpen && "rotate-180",
					)}
				/>
			</button>

			{isOpen && (
				<div
					className={cn(
						"fade-in absolute left-0 z-50 w-full animate-in overflow-hidden rounded-lg border border-overlay bg-surface shadow-lg duration-200",
						openUpward
							? "bottom-full mb-2 slide-in-from-bottom-1"
							: "top-full mt-2 slide-in-from-top-1",
					)}
				>
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
