// Trilha Front-end (HTML/CSS/JS). IDs prefixados com "fe-".
import type { Lesson } from '../types';

export const FRONTEND_LESSONS: Lesson[] = [
  // ===== FASE 1 — HTML =====
  {
    id: 'fe-1-1', track: 'frontend', unit: 'Fase 1 — HTML',
    title: 'O que é HTML', type: 'theory', xp: 15,
    content: `
      <p><strong>HTML</strong> é a estrutura de toda página web. Ele descreve o conteúdo usando <strong>tags</strong>.</p>
      <pre><code>&lt;h1&gt;Título&lt;/h1&gt;
&lt;p&gt;Um parágrafo de texto.&lt;/p&gt;</code></pre>
      <p>Cada tag geralmente abre e fecha: <code>&lt;p&gt;</code> ... <code>&lt;/p&gt;</code>. O que fica no meio é o conteúdo.</p>`,
    quiz: [
      { q: 'Pra que serve o HTML?', options: ['Estilizar a página', 'Estruturar o conteúdo', 'Fazer cálculos', 'Guardar dados'], answer: 1 },
      { q: 'Como se fecha a tag <code>&lt;p&gt;</code>?', options: ['&lt;/p&gt;', '&lt;p/&gt;', '&lt;close&gt;', 'não fecha'], answer: 0 },
      { q: 'O que fica entre <code>&lt;h1&gt;</code> e <code>&lt;/h1&gt;</code>?', options: ['um estilo', 'o conteúdo do título', 'um script', 'nada'], answer: 1 },
    ],
  },
  {
    id: 'fe-1-2', track: 'frontend', unit: 'Fase 1 — HTML',
    title: 'Tags essenciais', type: 'theory', xp: 15,
    content: `
      <p>Algumas tags que você usa o tempo todo:</p>
      <ul>
        <li><code>&lt;h1&gt;</code> a <code>&lt;h6&gt;</code> — títulos</li>
        <li><code>&lt;p&gt;</code> — parágrafo</li>
        <li><code>&lt;a href="..."&gt;</code> — link</li>
        <li><code>&lt;img src="..."&gt;</code> — imagem</li>
        <li><code>&lt;ul&gt;</code>/<code>&lt;li&gt;</code> — lista</li>
      </ul>`,
    quiz: [
      { q: 'Qual tag cria um link?', options: ['&lt;link&gt;', '&lt;a&gt;', '&lt;href&gt;', '&lt;url&gt;'], answer: 1 },
      { q: 'Qual atributo diz o endereço de uma imagem?', options: ['href', 'src', 'link', 'path'], answer: 1 },
      { q: 'Qual cria um item de lista?', options: ['&lt;list&gt;', '&lt;li&gt;', '&lt;item&gt;', '&lt;ol&gt;'], answer: 1 },
    ],
  },
  {
    id: 'fe-1-3', track: 'frontend', unit: 'Fase 1 — HTML',
    title: 'Estrutura de uma página', type: 'theory', xp: 15,
    content: `
      <p>Toda página tem um esqueleto padrão:</p>
      <pre><code>&lt;!DOCTYPE html&gt;
&lt;html&gt;
  &lt;head&gt;
    &lt;title&gt;Minha página&lt;/title&gt;
  &lt;/head&gt;
  &lt;body&gt;
    &lt;h1&gt;Olá!&lt;/h1&gt;
  &lt;/body&gt;
&lt;/html&gt;</code></pre>
      <p><code>&lt;head&gt;</code> = informações da página (título, estilos). <code>&lt;body&gt;</code> = o que aparece na tela.</p>`,
    quiz: [
      { q: 'Onde fica o conteúdo visível da página?', options: ['&lt;head&gt;', '&lt;body&gt;', '&lt;title&gt;', '&lt;html&gt;'], answer: 1 },
      { q: 'O que vai no <code>&lt;head&gt;</code>?', options: ['o texto principal', 'título e estilos', 'as imagens', 'os botões'], answer: 1 },
      { q: '<code>&lt;!DOCTYPE html&gt;</code> serve pra:', options: ['criar um título', 'dizer que é HTML5', 'fechar a página', 'importar CSS'], answer: 1 },
    ],
  },

  // ===== FASE 2 — CSS =====
  {
    id: 'fe-2-1', track: 'frontend', unit: 'Fase 2 — CSS',
    title: 'O que é CSS', type: 'theory', xp: 15,
    content: `
      <p><strong>CSS</strong> deixa a página bonita: cores, tamanhos, espaçamento, posição.</p>
      <pre><code>p {
  color: blue;
  font-size: 18px;
}</code></pre>
      <p>Você escolhe um elemento (<code>p</code>) e aplica regras (<code>propriedade: valor;</code>).</p>`,
    quiz: [
      { q: 'Pra que serve o CSS?', options: ['estruturar', 'estilizar', 'calcular', 'salvar dados'], answer: 1 },
      { q: 'O que <code>color: blue</code> faz?', options: ['fundo azul', 'texto azul', 'borda azul', 'nada'], answer: 1 },
      { q: 'Uma regra CSS é:', options: ['tag: fecha', 'propriedade: valor', 'href = link', 'função()'], answer: 1 },
    ],
  },
  {
    id: 'fe-2-2', track: 'frontend', unit: 'Fase 2 — CSS',
    title: 'Seletores', type: 'theory', xp: 15,
    content: `
      <p>Seletores dizem <em>quem</em> vai receber o estilo:</p>
      <ul>
        <li><code>p</code> — todas as tags p</li>
        <li><code>.destaque</code> — elementos com <code>class="destaque"</code></li>
        <li><code>#topo</code> — o elemento com <code>id="topo"</code></li>
      </ul>`,
    quiz: [
      { q: 'Como se seleciona a classe "botao"?', options: ['#botao', '.botao', 'botao', '*botao'], answer: 1 },
      { q: 'O <code>#</code> seleciona por:', options: ['classe', 'id', 'tag', 'cor'], answer: 1 },
      { q: '<code>p</code> como seletor pega:', options: ['1 parágrafo', 'todas as tags p', 'nada', 'a classe p'], answer: 1 },
    ],
  },
  {
    id: 'fe-2-3', track: 'frontend', unit: 'Fase 2 — CSS',
    title: 'Box model e layout', type: 'theory', xp: 20,
    content: `
      <p>Todo elemento é uma caixa com: <strong>conteúdo</strong>, <code>padding</code> (espaço interno),
      <code>border</code> (borda) e <code>margin</code> (espaço externo).</p>
      <pre><code>.card {
  padding: 16px;
  margin: 8px;
  border: 1px solid #ccc;
}</code></pre>`,
    quiz: [
      { q: 'Espaço DENTRO da caixa é:', options: ['margin', 'padding', 'border', 'gap'], answer: 1 },
      { q: 'Espaço FORA da caixa é:', options: ['padding', 'margin', 'border', 'content'], answer: 1 },
      { q: 'O que <code>border</code> controla?', options: ['a borda', 'a cor do texto', 'a fonte', 'o link'], answer: 0 },
    ],
  },

  // ===== FASE 3 — JavaScript no navegador =====
  {
    id: 'fe-3-1', track: 'frontend', unit: 'Fase 3 — JS no navegador',
    title: 'JS na página', type: 'theory', xp: 20,
    content: `
      <p><strong>JavaScript</strong> deixa a página interativa. No navegador, ele acessa o HTML pelo <strong>DOM</strong>.</p>
      <pre><code>const titulo = document.querySelector('h1');
titulo.textContent = 'Novo título';</code></pre>
      <p><code>document.querySelector</code> encontra um elemento; aí você muda ele.</p>`,
    quiz: [
      { q: 'O que o JS faz na página?', options: ['estrutura', 'estiliza', 'deixa interativa', 'hospeda'], answer: 2 },
      { q: 'Como pegar o primeiro <code>h1</code>?', options: ["document.querySelector('h1')", "get('h1')", "html.h1", "find(h1)"], answer: 0 },
      { q: '<code>textContent</code> muda:', options: ['a cor', 'o texto do elemento', 'o link', 'a classe'], answer: 1 },
    ],
  },
  {
    id: 'fe-3-2', track: 'frontend', unit: 'Fase 3 — JS no navegador',
    title: 'Eventos (clique)', type: 'theory', xp: 20,
    content: `
      <p>Você reage a ações do usuário com <strong>eventos</strong>:</p>
      <pre><code>const botao = document.querySelector('button');
botao.addEventListener('click', () =&gt; {
  alert('Clicou!');
});</code></pre>
      <p><code>addEventListener('click', fn)</code> roda a função toda vez que clicam.</p>`,
    quiz: [
      { q: 'Qual método escuta um clique?', options: ['onClick()', "addEventListener('click', ...)", 'listen()', 'click()'], answer: 1 },
      { q: 'A função do evento roda:', options: ['uma vez ao carregar', 'quando o usuário age', 'nunca', 'a cada segundo'], answer: 1 },
      { q: 'O que <code>alert()</code> faz?', options: ['some com a página', 'mostra um aviso', 'recarrega', 'apaga o texto'], answer: 1 },
    ],
  },
  {
    id: 'fe-3-3', track: 'frontend', unit: 'Fase 3 — JS no navegador',
    title: 'Mudando estilo pelo JS', type: 'theory', xp: 20,
    content: `
      <p>Dá pra mudar classes e estilos em tempo real:</p>
      <pre><code>const box = document.querySelector('.box');
box.classList.add('ativo');       // adiciona classe
box.style.background = 'green';   // muda estilo direto</code></pre>
      <p>Combinar evento + mudança de classe é a base de quase toda interação.</p>`,
    quiz: [
      { q: 'Como adicionar a classe "ativo"?', options: ["classList.add('ativo')", "class = 'ativo'", "addClass('ativo')", "style.ativo"], answer: 0 },
      { q: 'Como mudar o fundo pelo JS?', options: ["style.background = ...", "bg = ...", "color = ...", "background()"], answer: 0 },
      { q: 'A base de interação é:', options: ['só CSS', 'evento + mudança no DOM', 'só HTML', 'recarregar a página'], answer: 1 },
    ],
  },
  {
    id: 'fe-3-4', track: 'frontend', unit: 'Fase 3 — JS no navegador',
    title: 'Projeto: contador', type: 'checklist', xp: 25,
    content: `
      <p>Junte tudo num mini projeto: um botão que conta cliques.</p>
      <ol>
        <li>HTML: um <code>&lt;h1 id="n"&gt;0&lt;/h1&gt;</code> e um <code>&lt;button&gt;+1&lt;/button&gt;</code></li>
        <li>JS: pega os dois com <code>querySelector</code></li>
        <li>No <code>click</code>, soma 1 e atualiza o <code>textContent</code></li>
        <li>CSS: estiliza o botão (cor, padding, borda arredondada)</li>
      </ol>
      <p>Conseguiu o contador funcionando? Marque como concluído.</p>`,
  },
];
