import { useEffect, useState } from "react";
import type { Dispatch, SetStateAction } from "react";

export function usePersistedState<T>(
	key: string,
	defaultValue: T,
	validate?: (value: unknown) => value is T,
): [T, Dispatch<SetStateAction<T>>] {
	const [state, setState] = useState<T>(() => {
		try {
			const saved = localStorage.getItem(key);
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
