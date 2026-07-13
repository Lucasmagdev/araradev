# TrilhaDev — gerador de POST estático (HTML → imagem)

> Contexto pra IA. Quando eu pedir "gera post sobre X" / "card", SIGA este arquivo.
> Saída = **HTML completo de 1 card**, no mesmo padrão visual da marca.
> Render vira PNG via `../generate.js` (ou abrir o HTML e print 1080x1080).

## O produto
TrilhaDev: app que ensina **programação do zero** pra iniciante brasileiro.
Estilo Duolingo: gamificado, leve, didático. Mascote: arara azul.
Objetivo do post = valor rápido → salvar/seguir → baixar app.

## Cadência e numeração (IMPORTANTE)
- **1 post educativo por dia**, em série. Cada post = 1 conceito.
- Nomear SEMPRE `postNN-slug.png` + `postNN-slug.txt`, NN sequencial com zero à esquerda.
  Salvar em `../biblioteca/imagens/`.
- A tag do card segue a contagem de conceitos: `Conceito #1`, `Conceito #2`...
  (o post 01 é boas-vindas, não conta; a série educativa começa no Conceito #1).
- Antes de gerar, olhar o último número em `../biblioteca/imagens/` e continuar dele.
- Histórico até agora:
  - post-01-boasvindas (apresentação da conta)
  - post-02-variavel (Conceito #1)
  - post-03-condicao / if (Conceito #2)
- Ordem sugerida da trilha: variável → if/condição → loop → função → tipos de dados →
  operadores → array/lista → erro comum → Git básico → carreira.

## Formato
- **Quadrado 1080x1080** (feed). Carrossel = vários HTMLs (card 1/4, 2/4...).
- Story/Reel cover = **1080x1920** (só mudar height e padding).
- 1 ideia por card. Texto curto, legível no celular.

## Identidade visual (NÃO desviar)
- Fundo: `radial-gradient(circle at 30% 20%, #0e1c2a 0%, #04090f 70%)`.
- Verde marca `#58cc02` · azul `#1cb0f6` · texto `#fff` · texto fraco `#c5d4e3` · amarelo CTA `#ffc800`.
- Glows neon (verde topo-direita, azul baixo-esquerda), blur 120px, opacity ~.15.
- Logo arara (`../../logoararadev.jpeg`) + wordmark "Trilha<span verde>Dev</span>".
- Fonte sans bold, títulos grandes (~78px), letter-spacing negativo.
- Código: bloco `#07111d` texto `#7dd3fc` fonte mono.
- Rodapé: `@trilhadev.ai` esquerda + CTA amarelo "Baixe na Play Store ↓" direita.

## Base
Use `../template.html` como esqueleto. Placeholders dele:
- `LOGO_SRC` (logo base64/caminho), `__TAG__`, `__TITLE__`, `__BODY__`.
- No texto: `*palavra*` → verde (`<em>`); `` `codigo` `` → bloco azul (`<code>`).

## Anatomia do card
1. Topo: logo + wordmark.
2. Tag pill (azul): categoria curta — ex "Dica do dia", "Git básico", "Erro comum".
3. Título grande: pergunta/gancho, máx ~6 palavras, 1 palavra em verde.
4. Corpo: 1–2 frases, máx ~30 palavras, didático. Pode ter `código`.
5. Rodapé fixo: @trilhadev.ai + CTA Play Store.

## Tipos de post
- **Conceito**: "O que é *variável*?" + explicação simples.
- **Dica**: comando/atalho útil.
- **Erro comum**: "Esse erro trava todo iniciante" + fix.
- **Carrossel** (melhor engajamento): card 1 = gancho, cards meio = passos, último = CTA forte ("Salva esse post" + baixe app).
- **Antes/depois**: código ruim vs limpo (2 cards).

## O que ENTREGAR
1. **HTML completo** do(s) card(s) — pronto pra renderizar.
2. **Legenda** (caption): 2–4 linhas, voz humana e informal BR + CTA + 7 hashtags PT com #trilhadev.
3. Se carrossel: dizer quantos cards e o papel de cada um.

## Regras
- Texto sempre caber sem estourar o card (título curto, corpo enxuto). Se grande → carrossel.
- Código só ilustrativo e curto. Nada de bloco gigante.
- Tom realista + motivador. Sem promessa falsa de salário/emprego garantido.
- **Sem emoji nas legendas** (ou no máx 1, raríssimo). Emoji demais = cara de post de IA. Escreve como pessoa real fala.
- Acessível: contraste alto (já garantido pela paleta escura + texto claro).
- Manter SEMPRE logo + @trilhadev.ai + CTA Play Store (consistência de marca).
