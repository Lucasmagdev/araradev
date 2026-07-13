#!/usr/bin/env node
/**
 * TrilhaDev — gerador de post pra Instagram.
 *
 * Fluxo:
 *   1. Claude API gera 1 dica dev (titulo + corpo + legenda + hashtags)
 *   2. Preenche template.html
 *   3. Puppeteer renderiza PNG 1080x1080 em social/out/
 *   4. Salva legenda.txt do lado (copia e cola no Instagram)
 *
 * Uso:
 *   ANTHROPIC_API_KEY=sk-... node social/generate.js
 *   node social/generate.js "tema livre aqui"   (forca o tema)
 *
 * Custo: ~centavos por post (modelo haiku). Render do PNG e gratis (local).
 */
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const DIR = __dirname;
const OUT = path.join(DIR, 'out');
const MODEL = process.env.TRILHA_MODEL || 'claude-haiku-4-5-20251001';
const KEY = process.env.ANTHROPIC_API_KEY;

const TEMAS = [
  'um conceito de JavaScript', 'um comando de Git util', 'boa pratica de codigo limpo',
  'um atalho de VSCode', 'erro comum de iniciante e como evitar', 'um conceito de logica',
  'dica de carreira dev', 'um termo tecnico explicado simples', 'conceito de HTML/CSS',
  'mentalidade pra aprender a programar',
];

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
// transforma `code` e *destaque* em HTML do template
function rich(s) {
  return esc(s)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>');
}

async function gerarConteudo(tema) {
  if (!KEY) {
    console.error('!! Falta ANTHROPIC_API_KEY no ambiente. Usando conteudo de exemplo.');
    return {
      tag: 'Dica do dia',
      titulo: 'O que e *console.log*?',
      corpo: 'Mostra valores no terminal do navegador. Use `console.log(x)` pra ver o que ta dentro de uma variavel quando algo nao funciona.',
      legenda: 'Toda vez que seu codigo bugar, console.log e seu melhor amigo 🐛\n\nSalva esse post e bora pra proxima dica!',
      hashtags: '#programacao #aprenderprogramar #dev #javascript #trilhadev #codigo #estudardev',
    };
  }
  const t = tema || TEMAS[Math.floor(Math.random() * TEMAS.length)];
  const prompt = `Voce escreve posts curtos pro Instagram do TrilhaDev, app que ensina programacao do zero pra iniciantes brasileiros.

Gere UM post sobre: ${t}

Regras:
- titulo: curto (max 6 palavras), pode usar *palavra* pra destaque em verde
- corpo: 1-2 frases simples, didatico, max 30 palavras. Pode usar \`codigo\` em backtick
- linguagem informal BR, sem jargao desnecessario
- tag: 2-3 palavras (ex "Dica do dia", "Git basico")
- legenda: 2-3 linhas pro caption do insta, com 1-2 emojis e um CTA
- hashtags: 7 hashtags PT relevantes, incluindo #trilhadev

Responda SO com JSON valido:
{"tag":"","titulo":"","corpo":"","legenda":"","hashtags":""}`;

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 600,
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  if (!res.ok) throw new Error('API ' + res.status + ': ' + (await res.text()));
  const data = await res.json();
  let txt = data.content[0].text.trim();
  const m = txt.match(/\{[\s\S]*\}/);
  if (m) txt = m[0];
  return JSON.parse(txt);
}

async function render(c) {
  fs.mkdirSync(OUT, { recursive: true });
  const logo = path.join(DIR, '..', 'logoararadev.jpeg');
  const logoB64 = 'data:image/jpeg;base64,' + fs.readFileSync(logo).toString('base64');

  let html = fs.readFileSync(path.join(DIR, 'template.html'), 'utf8')
    .replace('LOGO_SRC', logoB64)
    .replace('__TAG__', esc(c.tag))
    .replace('__TITLE__', rich(c.titulo))
    .replace('__BODY__', rich(c.corpo));

  const b = await puppeteer.launch({ headless: 'new' });
  const p = await b.newPage();
  await p.setViewport({ width: 1080, height: 1080, deviceScaleFactor: 2 });
  await p.setContent(html, { waitUntil: 'networkidle0' });

  const stamp = new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-');
  const pngPath = path.join(OUT, `post-${stamp}.png`);
  await p.screenshot({ path: pngPath });
  await b.close();

  const legenda = `${c.legenda}\n\n${c.hashtags}\n\n📲 Baixe o TrilhaDev na Play Store`;
  fs.writeFileSync(pngPath.replace('.png', '.txt'), legenda);
  return pngPath;
}

(async () => {
  const tema = process.argv.slice(2).join(' ').trim() || null;
  console.log('Gerando post' + (tema ? ` sobre: ${tema}` : '') + '...');
  const c = await gerarConteudo(tema);
  const png = await render(c);
  console.log('\n✅ Pronto:');
  console.log('  imagem :', png);
  console.log('  legenda:', png.replace('.png', '.txt'));
  console.log('\n' + c.legenda + '\n' + c.hashtags);
})().catch(e => { console.error('ERRO:', e.message); process.exit(1); });
