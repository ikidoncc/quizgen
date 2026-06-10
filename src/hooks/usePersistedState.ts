import type { Dispatch, SetStateAction } from "react";
import { useEffect, useState } from "react";

export function usePersistedState<T>(
	key: string,
	defaultValue: T,
	validate?: (value: unknown) => value is T,
): [T, Dispatch<SetStateAction<T>>] {
	const [state, setState] = useState<T>(() => {
		try {
			let saved = localStorage.getItem(key);
			// Fallback to older localStorage keys for seamless migration if boron_state is empty
			if (!saved && key === "boron_state") {
				saved =
					localStorage.getItem("quizgen_state") ||
					localStorage.getItem("quiz_state");
			}
			if (saved) {
				const parsed = JSON.parse(saved);
				if (!validate || validate(parsed)) {
					return parsed;
				}
				console.warn(`Invalid data in localStorage key "${key}", resetting`);
			}
		} catch (e) {
			console.error(`Error loading "${key}" from localStorage`, e);
		}
		return defaultValue;
	});

	useEffect(() => {
		localStorage.setItem(key, JSON.stringify(state));
	}, [key, state]);

	return [state, setState];
}
