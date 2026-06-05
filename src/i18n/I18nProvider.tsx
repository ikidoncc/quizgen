import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useState,
} from "react";
import en from "../locales/en/translation.json";
import ptBR from "../locales/pt-BR/translation.json";

type Languages = "pt-BR" | "en";

type TFunction = (
	key: string,
	options?: Record<string, string | number>,
) => string;

interface I18nContextType {
	language: Languages;
	setLanguage: (lang: Languages) => void;
	t: TFunction;
}

const I18nContext = createContext<I18nContextType | null>(null);

const translations: Record<Languages, Record<string, unknown>> = {
	"pt-BR": ptBR as unknown as Record<string, unknown>,
	en: en as unknown as Record<string, unknown>,
};

function resolve(obj: Record<string, unknown>, path: string): string {
	const keys = path.split(".");
	let current: unknown = obj;
	for (const key of keys) {
		if (current && typeof current === "object" && key in current) {
			current = (current as Record<string, unknown>)[key];
		} else {
			return path;
		}
	}
	return typeof current === "string" ? current : path;
}

function interpolate(
	text: string,
	options?: Record<string, string | number>,
): string {
	if (!options) return text;
	return text.replace(/\{\{(\w+)\}\}/g, (_, key: string) => {
		const value = options[key];
		return value !== undefined ? String(value) : `{{${key}}}`;
	});
}

function plural(
	obj: Record<string, unknown>,
	key: string,
	count: number,
): string {
	const pluralKey = `${key}_plural`;
	const pluralVal = resolve(obj, pluralKey);
	if (pluralVal !== pluralKey) {
		return count === 1 ? resolve(obj, key) : pluralVal;
	}
	return resolve(obj, key);
}

export function I18nProvider({ children }: { children: ReactNode }) {
	const [language, setLanguageState] = useState<Languages>(() => {
		const stored = localStorage.getItem("quizgen-language");
		if (stored === "pt-BR" || stored === "en") return stored;
		return "pt-BR";
	});

	useEffect(() => {
		localStorage.setItem("quizgen-language", language);
	}, [language]);

	const setLanguage = useCallback((lang: Languages) => {
		setLanguageState(lang);
	}, []);

	const t = useCallback<TFunction>(
		(key, options) => {
			const dict = translations[language];
			const text =
				options && typeof options.count === "number"
					? plural(dict, key, options.count)
					: resolve(dict, key);
			return interpolate(text, options);
		},
		[language],
	);

	useEffect(() => {
		document.title = t("seo.title");
	}, [t]);

	return (
		<I18nContext.Provider
			value={{
				language,
				setLanguage,
				t,
			}}
		>
			{children}
		</I18nContext.Provider>
	);
}

export function useTranslation() {
	const ctx = useContext(I18nContext);
	if (!ctx) {
		throw new Error("useTranslation must be used within I18nProvider");
	}
	return ctx;
}
