import { ChevronDown, Monitor, Moon, Sun } from "lucide-react";
import type React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
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
	const [openUpward, setOpenUpward] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);

	const themes = useMemo(
		() =>
			[
				{ value: "light", label: t("theme.light"), Icon: Sun },
				{ value: "dark", label: t("theme.dark"), Icon: Moon },
				{ value: "auto", label: t("theme.auto"), Icon: Monitor },
			] as const,
		[t],
	);

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

	useEffect(() => {
		if (isOpen && containerRef.current) {
			const rect = containerRef.current.getBoundingClientRect();
			const spaceBelow = window.innerHeight - rect.bottom;
			setOpenUpward(spaceBelow < 160);
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
					<SelectedIcon className="h-4 w-4" />
					<span className="ml-2 font-medium">{selectedTheme.label}</span>
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
