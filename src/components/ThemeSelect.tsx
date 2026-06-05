import { ChevronDown, Monitor, Moon, Sun } from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import type { Theme } from "../types";

interface ThemeSelectProps {
	value: Theme;
	onChange: (value: Theme) => void;
}

const THEMES = [
	{ value: "light", label: "Light", Icon: Sun },
	{ value: "dark", label: "Dark", Icon: Moon },
	{ value: "auto", label: "Auto", Icon: Monitor },
] as const;

export const ThemeSelect: React.FC<ThemeSelectProps> = ({
	value,
	onChange,
}) => {
	const [isOpen, setIsOpen] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);

	const selectedTheme = THEMES.find((t) => t.value === value) || THEMES[2];
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
				className="flex items-center justify-center sm:justify-between w-10 sm:w-32 bg-surface border border-overlay text-main text-xs rounded-lg p-2 outline-none cursor-pointer hover:bg-overlay transition-all active:scale-95"
				type="button"
			>
				<span className="flex items-center">
					<SelectedIcon className="w-4 h-4" />
					<span className="hidden sm:inline ml-2">{selectedTheme.label}</span>
				</span>
				<ChevronDown
					className={`w-4 h-4 ml-1 hidden sm:block transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
				/>
			</button>

			{isOpen && (
				<div className="absolute right-0 mt-2 w-32 bg-surface border border-overlay rounded-lg shadow-lg z-50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200">
					{THEMES.map((theme) => {
						const Icon = theme.Icon;
						return (
							<button
								type="button"
								key={theme.value}
								className={`w-full px-4 py-3 text-xs text-main hover:bg-overlay cursor-pointer flex items-center transition-colors ${
									value === theme.value ? "bg-overlay/50 font-bold" : ""
								}`}
								onClick={() => {
									onChange(theme.value);
									setIsOpen(false);
								}}
							>
								<Icon className="w-4 h-4" />
								<span className="ml-2">{theme.label}</span>
							</button>
						);
					})}
				</div>
			)}
		</div>
	);
};
