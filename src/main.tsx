import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./style.css";
import { I18nProvider } from "./i18n/I18nProvider";
import { App } from "./app.tsx";

const rootElement = document.getElementById("root");

if (rootElement) {
	createRoot(rootElement).render(
		<StrictMode>
			<I18nProvider>
				<App />
			</I18nProvider>
		</StrictMode>,
	);
}
