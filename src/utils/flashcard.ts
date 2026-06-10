import { generateFlashcardsWithGemini } from "../ai/gemini";
import { generateFlashcardsWithGroq } from "../ai/groq";
import { generateFlashcardsWithOpenAI } from "../ai/openai";
import type { AIProvider, FlashcardSet } from "../types";

export async function generateFlashcardSet(
	text: string,
	provider: AIProvider,
	apiKey: string,
): Promise<FlashcardSet> {
	if (!apiKey.trim()) {
		throw new Error("Chave de API inválida ou ausente.");
	}

	let result: { title: string; cards: { front: string; back: string }[] };
	if (provider === "gemini") {
		result = await generateFlashcardsWithGemini(text, apiKey);
	} else if (provider === "groq") {
		result = await generateFlashcardsWithGroq(text, apiKey);
	} else if (provider === "openai") {
		result = await generateFlashcardsWithOpenAI(text, apiKey);
	} else {
		throw new Error("Provedor de IA desconhecido");
	}

	// Mapeia para FlashcardSet com identificadores únicos para cada card
	const cards = result.cards.map((c, i) => ({
		id: `fc-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 9)}`,
		front: c.front,
		back: c.back,
	}));

	return {
		id: `fcs-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
		title: result.title || "Novo Deck de Flashcards",
		createdAt: new Date().toISOString(),
		cards,
	};
}
