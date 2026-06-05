import { useEffect, useState } from "react";
import type { Theme } from "../types";

export function useTheme() {
	const [theme, setTheme] = useState<Theme>(() => {
		const saved = localStorage.getItem("quizgen_theme");
		return (saved as Theme) || "auto";
	});

	useEffect(() => {
		const applyTheme = () => {
			const html = document.documentElement;
			if (theme === "dark") {
				html.classList.add("dark");
			} else if (theme === "light") {
				html.classList.remove("dark");
			} else {
				if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
					html.classList.add("dark");
				} else {
					html.classList.remove("dark");
				}
			}
		};

		applyTheme();
		localStorage.setItem("quizgen_theme", theme);

		if (theme === "auto") {
			const media = window.matchMedia("(prefers-color-scheme: dark)");
			const listener = () => applyTheme();
			media.addEventListener("change", listener);
			return () => media.removeEventListener("change", listener);
		}
	}, [theme]);

	return { theme, setTheme };
}
