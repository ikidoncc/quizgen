import { ChevronDown, Monitor, Moon, Sun } from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "../i18n/I18nProvider";
import type { Theme } from "../types";
import { cn } from "../utils/cn";

interface ThemeSelectProps {
	value: Theme;
	onChange: (value: Theme) => void;
}

export const ThemeSelect: React.FC<ThemeSelectProps> = ({
	value,
	onChange,
}) => {
	const { t } = useTranslation();
	const [isOpen, setIsOpen] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);

	const themes = [
		{ value: "light", label: t("theme.light"), Icon: Sun },
		{ value: "dark", label: t("theme.dark"), Icon: Moon },
		{ value: "auto", label: t("theme.auto"), Icon: Monitor },
	] as const;

	const selectedTheme = themes.find((t) => t.value === value) || themes[2];
	const SelectedIcon = selectedTheme.Icon;

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
					<SelectedIcon className="h-4 w-4" />
					<span className="ml-2 hidden sm:inline">{selectedTheme.label}</span>
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
					{themes.map((themeItem) => {
						const Icon = themeItem.Icon;
						return (
							<button
								type="button"
								key={themeItem.value}
								className={cn(
									"flex w-full cursor-pointer items-center px-4 py-3 text-main text-xs transition-colors hover:bg-overlay",
									value === themeItem.value && "bg-overlay/50 font-bold",
								)}
								onClick={() => {
									onChange(themeItem.value);
									setIsOpen(false);
								}}
							>
								<Icon className="h-4 w-4" />
								<span className="ml-2">{themeItem.label}</span>
							</button>
						);
					})}
				</div>
			)}
		</div>
	);
};
