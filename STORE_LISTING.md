# Ficha da loja — TrilhaDev (Google Play)

## Política de privacidade

Arquivo: `docs/privacy.html` (fonte) — **publicada** em:

```
https://trilhadev.app.br/privacy.html
```

Hospedada no próprio VPS (nginx, `/var/www/trilhadev/privacy.html`). Cole essa
URL no Play Console (App content → Privacy policy). Pra atualizar: editar
`docs/privacy.html` e reenviar pro VPS.

## Descrição curta (máx. 80 caracteres)

```
Aprenda programação na prática com trilha gamificada e exercícios de código
```
(76 caracteres)

## Descrição longa (máx. 4000 caracteres)

```
🦜 TrilhaDev — aprenda a programar de verdade

O TrilhaDev é uma trilha gamificada pra aprender lógica de programação do zero,
com lições curtas, exercícios de código direto no app e acompanhamento de progresso.

📚 O QUE VOCÊ VAI APRENDER
• Variáveis, tipos e operadores
• Condicionais (if/else) e operadores lógicos
• Loops (for/while) e o padrão acumulador
• Funções
• Arrays, objetos e métodos básicos (filtrar, transformar, etc.)
• Recursão
• Algoritmos clássicos: busca, ordenação, FizzBuzz, palíndromo e mais

🎮 COMO FUNCIONA
• Fases organizadas por progresso, não por calendário — avance no seu ritmo
• Exercícios práticos de código em cada lição
• Troféus de fase pra marcar sua evolução
• Mascote arara te acompanha na jornada

📱 PRA QUEM É
Pra quem está começando em programação e quer fixar a base com prática
constante — sem depender só de teoria ou vídeo.

Crie sua conta, comece pela Fase 1 e siga a trilha. Seu progresso fica salvo
e sincronizado com sua conta.
```

## Assets gráficos

- **Ícone** 512×512: `assets/icon-512.png` ✓
- **Feature graphic** 1024×500: `docs/store-screenshots/feature-graphic.png` ✓
  (fonte editável: `docs/store-screenshots/feature-graphic.html`)
- **Screenshots de phone** (mín. 2): `docs/store-screenshots/`
  - `03-trilha.png` — a trilha com as 12 fases
  - `04-licao.png` — lição (múltipla escolha) com vidas/timer
  - Capturados do site live (`https://trilhadev.app.br`). Pra portrait perfeito,
    dá pra recapturar num device/emulador real depois — mas a proporção atual já
    é aceita pelo Play (entre 16:9 e 9:16).

## Categoria sugerida

Educação

## Content rating (questionário IARC)

Conteúdo: nenhuma violência, nudez, linguagem ofensiva, conteúdo gerado por
usuário público, compras dentro do app, ou interação social entre usuários.
App é puramente educacional (lições de programação).
→ Resultado esperado: classificação livre / "Para todos" (PEGI 3 / ESRB Everyone).

## Data safety (formulário do Console)

**Coleta de dados?** Sim

| Tipo de dado | Coletado? | Finalidade | Compartilhado com terceiros? |
|---|---|---|---|
| Nome | Sim | Funcionalidade do app (conta) | Não |
| E-mail | Sim | Funcionalidade do app (login/conta) | Não |
| Senha | Sim (criptografada) | Autenticação | Não |
| Dados de uso (progresso nas lições) | Sim | Funcionalidade do app | Não |

- Dados criptografados em trânsito: **Sim** (API migrada pra HTTPS via
  `https://trilhadev.app.br`, 2026-06-22).
- Usuário pode solicitar exclusão dos dados: **Sim** → e-mail `codexyctti@gmail.com`
  (seção "Exclusão de conta e dados" da política). Play também pede uma URL de
  exclusão: usar `https://trilhadev.app.br/privacy.html`.
- Anúncios: Não
- Finalidade de coleta: "Funcionalidade do app" (App functionality) — não é
  "Personalização" nem "Publicidade"
