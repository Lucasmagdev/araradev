# social/ — gerador de post Instagram (TrilhaDev)

IA gera a dica + imagem. Você posta manual.

## Rodar

```bash
# 1. pega API key em console.anthropic.com (Settings > API Keys)
export ANTHROPIC_API_KEY=sk-ant-...        # Windows PS: $env:ANTHROPIC_API_KEY="sk-ant-..."

# 2. gera 1 post (tema aleatorio)
node social/generate.js

# tema forcado:
node social/generate.js "explicar o que e uma API"
```

Saída em `social/out/`:
- `post-DATA.png` — imagem 1080x1080 (sobe no Instagram)
- `post-DATA.txt` — legenda + hashtags (copia e cola no caption)

## Custo
- Imagem: grátis (render local via Puppeteer).
- Texto: ~centavos/post (modelo `claude-haiku-4-5`). Trocar via `TRILHA_MODEL`.

## Mudar visual
Edita `template.html`. Placeholders: `__TAG__`, `__TITLE__`, `__BODY__`, `LOGO_SRC`.
No texto da IA: `*palavra*` vira verde, `` `codigo` `` vira bloco azul.

## Gerar vários de uma vez
```bash
for i in 1 2 3; do node social/generate.js; sleep 1; done
```

## Próximo nível (depois)
- Carrossel (vários cards num post)
- Formato Reels/Stories (1080x1920)
- Auto-post via Instagram Graph API (conta Business)
