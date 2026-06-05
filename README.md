# QuizGen

Create quizzes from text using Q/A/O format. Built with React 19 + TypeScript + Tailwind v4 + Vite.

## Features

- **Quiz Generation** — paste text in `Q: Question? / A: Answer / O: Incorrect option` format
- **Play Mode** — answer questions with instant feedback, optional per-question timer
- **Results** — score summary with correct/skipped/wrong breakdown
- **History** — all generated quizzes auto-saved to localStorage (max 20 entries), with replay, clipboard copy, and `.txt` download
- **Theme** — Light / Dark / Auto (system preference)
- **i18n** — Portuguese (pt-BR) and English (en), no external i18n packages
- **Responsive** — mobile-first layout

## Tech Stack

- [React 19](https://react.dev/) — hooks, `use`, Context API
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS v4](https://tailwindcss.com/) — utility-first CSS
- [Vite](https://vitejs.dev/) — bundler with Oxc plugin
- [Biome](https://biomejs.dev/) — lint + format
- [Lucide React](https://lucide.dev/) — icons

No external state management, i18n, or font packages.

## Getting Started

```bash
npm install
npm run dev
```

## Scripts

| Command | Description |
|---------|-------------|
| `dev` | Start Vite dev server |
| `build` | Type-check + production build |
| `lint` | Biome lint |
| `format` | Biome format (write) |
| `preview` | Preview production build |

## Project Structure

```
src/
├── components/     # UI components (CreateTab, PlayTab, ResultsTab, HistoryTab, …)
├── hooks/          # Custom hooks (useHistory, useQuizState, useTheme, …)
├── i18n/           # Custom i18n Context Provider + translations
├── locales/        # JSON translation files (en, pt-BR)
├── types/          # TypeScript types (Question, Option, QuizState, HistoryEntry, …)
├── utils/          # Utilities (cn, quiz parsing, …)
└── app.tsx         # Root component — orchestrates tabs and state
```
