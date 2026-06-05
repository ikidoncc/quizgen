# 🧠 QuizGen - Gerador Automático de Quizzes

QuizGen é uma aplicação web leve e intuitiva que permite transformar textos simples em quizzes interativos de múltipla escolha em segundos. Ideal para estudantes que desejam praticar flashcards ou professores que precisam de uma ferramenta rápida de avaliação.

## 📝 Descrição

O QuizGen processa textos colados pelo usuário seguindo um padrão simples de Pergunta/Resposta e gera automaticamente alternativas de múltipla escolha. O aplicativo é capaz de criar "distratores" (opções incorretas) de forma inteligente, utilizando respostas de outras perguntas do próprio conjunto ou aceitando opções personalizadas fornecidas pelo usuário.

## ✨ Funcionalidades

- ⚡ **Geração Instantânea**: Transforme texto em jogo com um clique.
- 🧩 **Múltipla Escolha Inteligente**: Gera alternativas incorretas automaticamente a partir do contexto do quizz.
- ✍️ **Opções Manuais**: Suporte para definir alternativas específicas usando o prefixo `O:`.
- 🔍 **Normalização Robusta**: Algoritmo que ignora espaços extras, acentos e caracteres ocultos para evitar erros de validação injustos.
- ⏭️ **Pular Questões**: Funcionalidade para pular perguntas difíceis e revisá-las na contagem final.
- 📊 **Relatório de Desempenho**: Feedback detalhado no final com contagem de acertos, erros e pulos.
- 🎨 **Interface Moderna**: Design responsivo e limpo construído com Tailwind CSS.
- 📱 **Custom Modals**: Substituição de diálogos nativos por modais elegantes e consistentes.

## 🚀 Tecnologias Utilizadas

- **HTML5**: Estrutura semântica.
- **Tailwind CSS**: Estilização moderna e responsiva via CDN.
- **JavaScript (Vanilla)**: Lógica de parsing, gerenciamento de estado e manipulação de DOM.
- **Git**: Controle de versão com histórico semântico.

## 💻 Como Executar Localmente

Como o projeto é uma aplicação *client-side* pura, não é necessário instalar dependências.

1. Clone o repositório:
   ```bash
   git clone https://github.com/seu-usuario/quizgen.git
   ```
2. Navegue até o diretório do projeto:
   ```bash
   cd quizgen
   ```
3. Abra o arquivo `index.html` diretamente em seu navegador ou use uma extensão como o *Live Server* no VS Code.

## 📂 Estrutura do Projeto

```text
├── index.html    # Estrutura principal e containers dos modais
├── app.js        # Lógica de parsing, normalização e fluxo do jogo
└── README.md     # Documentação do projeto
```

## 🛠️ Como Usar

1. Na aba **Criar Quizz**, cole seu conteúdo seguindo o formato:
   ```text
   Q: Pergunta Exemplo?
   A: Resposta Correta
   O: Opção Errada 1 (Opcional)
   O: Opção Errada 2 (Opcional)
   ```
2. Clique em **Gerar Quizz**.
3. Na aba **Jogar Quizz**, selecione as alternativas.
4. Use o botão **Pular Pergunta** se necessário.
5. Veja seu resultado detalhado ao final!

## 🔗 Demonstração

O projeto pode ser visualizado online em: [Link para o Deploy] *(Ex: GitHub Pages, Netlify ou Vercel)*

## 📸 Capturas de Tela

| Criação de Quizz | Jogo em Andamento |
| :--- | :--- |
| ![Aba Criar](https://via.placeholder.com/400x250?text=Interface+de+Criação) | ![Aba Jogar](https://via.placeholder.com/400x250?text=Interface+de+Jogo) |

## 🔮 Melhorias Futuras

- [ ] Persistência de dados usando `localStorage`.
- [ ] Exportação de quizzes em formato JSON.
- [ ] Modo escuro (Dark Mode).
- [ ] Suporte para imagens nas perguntas.
- [ ] Temporizador por questão.

## 👤 Autor

Desenvolvido por **[Seu Nome]** - [Seu GitHub](https://github.com/seu-usuario)

## 📄 Licença

Este projeto está sob a licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.
