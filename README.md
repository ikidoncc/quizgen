# Boron

Create quizzes and flashcards from text. Built with React 19, TypeScript, Tailwind CSS v4, and Vite.

🔗 **Live Demo:** [https://ikidon.github.io/boron/](https://ikidon.github.io/boron/)

---

## Features

* ✨ **Quiz Generation** — paste text in `Q: Question? / A: Correct Answer / O: Incorrect Option` format or generate from raw text using AI
* 🎴 **Flashcards** — create flashcard decks manually (`Q: Front / A: Back`) or automatically extract them from text with AI. Study them with interactive flip animations and review/mastery states
* 🤖 **AI-Powered Options** — generate plausible distractors in Normal or Hard difficulty using Gemini, Groq, or OpenAI API keys
* 🎮 **Play Mode** — answer quiz questions with instant feedback and customizable per-question timers
* 📊 **Results Summary** — track correct, incorrect, and skipped answers for quizzes, and deck progress for flashcards
* 🕒 **History** — generated quizzes and flashcard decks are automatically saved locally to localStorage
  * Replay previous quizzes or re-study decks
  * Copy content to clipboard
  * Download content as `.txt`
* 🎨 **Theme Support** — Light, Dark, and Auto (system preference)
* 🌐 **Internationalization (i18n)** — English and Brazilian Portuguese
* 📱 **Responsive Design** — optimized for desktop and mobile devices with a fixed sidebar layout and responsive slide-out drawer
* ⚡ **Fast & Lightweight** — no heavy external state management or i18n libraries

---

## Example Input

### Quiz Format (Manual)
```text
Q: What is the capital of Brazil?
A: Brasília
O: Rio de Janeiro
O: São Paulo
O: Salvador

Q: Which language is primarily used with React?
A: JavaScript
O: Python
O: Java
O: C#
```

### Flashcard Format (Manual)
```text
Q: Front of card (Question or concept)
A: Back of card (Answer or definition)
```

---

## How It Works

1. Write your questions or flashcards using the structured manual format, or select raw text input and paste an article/summary to use AI.
2. Select your generation settings (difficulty mode, provider, API key, timer, card count).
3. Play the quiz or flip flashcards to study concepts.
4. Review your results and track history directly on the sidebar.

---

## Tech Stack

* React 19
* TypeScript
* Tailwind CSS v4
* Vite
* Biome (linting and formatting)
* Lucide React (icons)

### Design Principles

* No external state management libraries
* No external i18n packages
* No UI component libraries
* Mobile-first responsive design
* Local-first persistence using localStorage

---

## Getting Started

### Prerequisites

* Node.js 20+
* pnpm 9+

### Installation

```bash
pnpm install
```

### Development

```bash
pnpm run dev
```

Open:

```text
http://localhost:5173
```

---

## Available Scripts

| Command           | Description                            |
| ----------------- | -------------------------------------- |
| `pnpm run dev`     | Start Vite development server          |
| `pnpm run build`   | Type-check and create production build |
| `pnpm run preview` | Preview production build locally       |
| `pnpm run lint`    | Run Biome lint                         |
| `pnpm run format`  | Format code with Biome                 |

---

## Project Structure

```text
src/
├── ai/             # AI API integration providers (Gemini, Groq, OpenAI)
├── components/     # UI components and tabs
├── hooks/          # Custom hooks
├── i18n/           # Internationalization provider
├── locales/        # Translation files
├── types/          # TypeScript types
├── utils/          # Utility functions
└── app.tsx         # Root application component
```

## Roadmap

Potential future improvements:

* Import/export quizzes as JSON
* Additional quiz formats
* More languages
* Quiz sharing through URLs
* Progress statistics and analytics

---

## License

This project is licensed under the MIT License.

---

## Author

Developed by **João Antonio (Ikidon)**

GitHub: https://github.com/ikidoncc
