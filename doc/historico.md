# Sistema de Histórico de Quizzes

Registra automaticamente todos os quizzes gerados, permitindo visualizar resultados passados, exportar no formato original (Q/A/O) e jogar novamente.

## Funcionalidades

- **Registro automático**: todo quiz gerado é salvo no `localStorage`
- **Resultados**: quizzes finalizados mostram acertos, erros e puladas
- **Exportar**: cópia para clipboard ou download em `.txt` no formato `Q:/A:/O:`
- **Jogar novamente**: recria um quiz a partir de um entry do histórico (gera novo entry)
- **Limite**: máx. 20 entries; as mais antigas são removidas automaticamente

## Estrutura

### Tipos (`src/types/index.ts`)

```typescript
export interface HistoryEntry {
  id: string;
  createdAt: string;       // ISO date
  completedAt?: string;    // preenchido ao finalizar
  title: string;           // primeira pergunta truncada
  questionCount: number;
  score?: number;
  skippedCount?: number;
  quizData: Question[];
}
```

`QuizState` ganha o campo `currentHistoryId: string`.

### Hook (`src/hooks/useHistory.ts`)

- `usePersistedState<HistoryEntry[]>("quizgen_history", [])`
- `addEntry(quizData): string` — cria entry, retorna `id`
- `updateEntry(id, score, skippedCount)` — marca `completedAt`
- `deleteEntry(id)` — remove entry
- `getExportText(entry): string` — gera `Q:\nA:\nO:\n\n...`
- `getExportFilename(entry): string` — `"quiz-{title}-{date}.txt"`

### Componente (`src/components/HistoryTab.tsx`)

Lista de cards com:

| Elemento | Descrição |
|---|---|
| **Título** | Primeira pergunta (truncada) |
| **Data** | Relativa ("hoje", "há 2 dias") |
| **Status** | Badge "3/5" se completo, "Não finalizado" se não |
| **Botão Jogar novamente** | Recria o quiz + salva novo entry |
| **Botão Copiar** | `navigator.clipboard.writeText(...)` |
| **Botão Download** | `Blob` + `<a download="quiz-....txt">` |
| **Botão Excluir** | Confirmação → remove |

## Export (`getExportText`)

Para cada pergunta no `quizData`:

```
Q: {question.question}
A: {question.answer}
O: {manualOption1}
O: {manualOption2}
```

Perguntas separadas por linha em branco. Usa `answer` e `manualOptions` (somente opções originais do usuário, não os distratores gerados).

## Fluxo de integração

### Geração

```
CreateTab.handleGenerate
  → parseQuizText(input)
  → prepareQuizOptions(parsed)
  → useHistory.addEntry(quizData)           ← retorna historyId
  → useQuizState.setQuizData(data, timer, historyId)
```

### Finalização

```
isGameOver === true
  → useEffect em app.tsx
  → useHistory.updateEntry(currentHistoryId, score, skippedCount)
```

### Jogar novamente

```
HistoryTab.onPlayAgain(quizData)
  → useHistory.addEntry(quizData)           ← novo entry
  → useQuizState.setQuizData(quizData, timerEnabled, newHistoryId)
```

## Armazenamento

| Chave | Tipo | Descrição |
|---|---|---|
| `quizgen_history` | `HistoryEntry[]` | Lista de entries (máx. 20) |
| `quizgen_state` | `QuizState` | State atual (inclui `currentHistoryId`) |

## Versionamento

`STORAGE_VERSION` sobe para **4**. A validação de schema descarta states salvos com versão anterior.
