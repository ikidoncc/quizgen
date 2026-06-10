import { generateFlashcardsWithGemini } from "../ai/gemini";
import { generateFlashcardsWithGroq } from "../ai/groq";
import { generateFlashcardsWithOpenAI } from "../ai/openai";
import type { AIProvider, FlashcardSet } from "../types";

export async function generateFlashcardSet(
	text: string,
	provider: AIProvider,
	apiKey: string,
	cardCount = 10,
): Promise<FlashcardSet> {
	if (!apiKey.trim()) {
		throw new Error("Chave de API inválida ou ausente.");
	}

	let result: { title: string; cards: { front: string; back: string }[] };
	if (provider === "gemini") {
		result = await generateFlashcardsWithGemini(text, apiKey, cardCount);
	} else if (provider === "groq") {
		result = await generateFlashcardsWithGroq(text, apiKey, cardCount);
	} else if (provider === "openai") {
		result = await generateFlashcardsWithOpenAI(text, apiKey, cardCount);
	} else {
		throw new Error("Provedor de IA desconhecido");
	}

	// Mapeia para FlashcardSet com identificadores únicos para cada card
	const cards = result.cards.map((c, i) => ({
		id: `fc-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 11)}`,
		front: c.front,
		back: c.back,
	}));

	return {
		id: `fcs-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
		title: result.title || "Novo Deck de Flashcards",
		createdAt: new Date().toISOString(),
		cards,
	};
}

export function parseFlashcardText(
	text: string,
): { front: string; back: string }[] {
	const cards: { front: string; back: string }[] = [];
	const lines = text.split("\n");
	let currentFront = "";
	let currentBack = "";

	for (let line of lines) {
		line = line.trim();
		if (line.toLowerCase().startsWith("q:")) {
			if (currentFront && currentBack) {
				cards.push({ front: currentFront, back: currentBack });
				currentBack = "";
			}
			currentFront = line.substring(2).trim();
		} else if (line.toLowerCase().startsWith("a:")) {
			currentBack = line.substring(2).trim();
		}
	}

	// Adiciona o último cartão se houver
	if (currentFront && currentBack) {
		cards.push({ front: currentFront, back: currentBack });
	}

	return cards;
}

export function createFlashcardSetManual(
	title: string,
	rawCards: { front: string; back: string }[],
): FlashcardSet {
	const cards = rawCards.map((c, i) => ({
		id: `fc-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 11)}`,
		front: c.front,
		back: c.back,
	}));

	return {
		id: `fcs-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
		title: title || "Novo Deck Manual",
		createdAt: new Date().toISOString(),
		cards,
	};
}
