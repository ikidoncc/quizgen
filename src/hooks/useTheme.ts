import { useEffect } from "react";
import type { Theme } from "../types";
import { usePersistedState } from "./usePersistedState";

function applyThemeToDOM(theme: Theme) {
	const html = document.documentElement;
	if (theme === "dark") {
		html.classList.add("dark");
	} else if (theme === "light") {
		html.classList.remove("dark");
	} else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
		html.classList.add("dark");
	} else {
		html.classList.remove("dark");
	}
}

export function useTheme() {
	const [theme, setTheme] = usePersistedState<Theme>("quizgen_theme", "auto");

	useEffect(() => {
		applyThemeToDOM(theme);
	}, [theme]);

	useEffect(() => {
		if (theme !== "auto") return;

		const media = window.matchMedia("(prefers-color-scheme: dark)");
		const listener = () => applyThemeToDOM("auto");
		media.addEventListener("change", listener);
		return () => media.removeEventListener("change", listener);
	}, [theme]);

	return { theme, setTheme };
}
