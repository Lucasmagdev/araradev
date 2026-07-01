// Trilha Entrevistas / Lógica. IDs prefixados com "logic-".
import type { Lesson } from '../types';

export const LOGIC_LESSONS: Lesson[] = [
  // ===== FASE 1 — Raciocínio =====
  {
    id: 'logic-1-1', track: 'logica', unit: 'Fase 1 — Raciocínio',
    title: 'Pensando como resolver', type: 'theory', xp: 15,
    content: `
      <p>Antes de codar, entenda o problema. Um bom método:</p>
      <ol>
        <li>Leia e repita o problema com suas palavras</li>
        <li>Pense em 1 exemplo de entrada e a saída esperada</li>
        <li>Descreva os passos em português (pseudocódigo)</li>
        <li>Só então escreva o código</li>
      </ol>
      <p>Entrevista testa raciocínio, não decoreba.</p>`,
    quiz: [
      { q: 'Qual o 1º passo pra resolver?', options: ['codar rápido', 'entender o problema', 'copiar da internet', 'otimizar'], answer: 1 },
      { q: 'Pseudocódigo é:', options: ['código que não roda', 'os passos em linguagem natural', 'um bug', 'um teste'], answer: 1 },
      { q: 'Entrevista testa principalmente:', options: ['decoreba', 'raciocínio', 'digitação', 'sorte'], answer: 1 },
    ],
  },
  {
    id: 'logic-1-2', track: 'logica', unit: 'Fase 1 — Raciocínio',
    title: 'Casos de borda', type: 'theory', xp: 15,
    content: `
      <p><strong>Casos de borda</strong> são entradas incomuns que quebram soluções ingênuas:</p>
      <ul>
        <li>lista vazia <code>[]</code></li>
        <li>um único elemento</li>
        <li>números negativos ou zero</li>
        <li>valores repetidos</li>
      </ul>
      <p>Sempre pergunte: "e se a entrada for vazia?"</p>`,
    quiz: [
      { q: 'Caso de borda é:', options: ['a entrada comum', 'uma entrada incomum que pode quebrar', 'um erro de sintaxe', 'um teste automático'], answer: 1 },
      { q: 'Qual é um caso de borda clássico?', options: ['lista com 3 itens', 'lista vazia', 'texto normal', 'número 5'], answer: 1 },
      { q: 'Pensar em bordas ajuda a:', options: ['deixar mais lento', 'evitar bugs', 'escrever menos', 'pular testes'], answer: 1 },
    ],
  },

  // ===== FASE 2 — Padrões comuns =====
  {
    id: 'logic-2-1', track: 'logica', unit: 'Fase 2 — Padrões comuns',
    title: 'Contadores e acumuladores', type: 'code', xp: 20,
    content: `
      <p>Padrão clássico: percorrer uma lista somando ou contando.</p>
      <pre><code>function soma(nums) {
  let total = 0;
  for (const n of nums) total += n;
  return total;
}</code></pre>
      <p>Implemente <code>soma</code> que retorna a soma de todos os números.</p>`,
    funcName: 'soma',
    starter: 'function soma(nums) {\n  // seu código\n}',
    tests: [
      { args: [[1, 2, 3]], expected: 6 },
      { args: [[]], expected: 0 },
      { args: [[-1, 1, 5]], expected: 5 },
    ],
  },
  {
    id: 'logic-2-2', track: 'logica', unit: 'Fase 2 — Padrões comuns',
    title: 'Buscar o maior', type: 'code', xp: 20,
    content: `
      <p>Percorra guardando o maior visto até agora.</p>
      <p>Implemente <code>maior(nums)</code> que retorna o maior número da lista.</p>`,
    funcName: 'maior',
    starter: 'function maior(nums) {\n  // seu código\n}',
    tests: [
      { args: [[1, 9, 3]], expected: 9 },
      { args: [[-5, -2, -9]], expected: -2 },
      { args: [[7]], expected: 7 },
    ],
  },
  {
    id: 'logic-2-3', track: 'logica', unit: 'Fase 2 — Padrões comuns',
    title: 'Contar ocorrências', type: 'code', xp: 20,
    content: `
      <p>Conte quantas vezes um valor aparece na lista.</p>
      <p>Implemente <code>contar(nums, alvo)</code>.</p>`,
    funcName: 'contar',
    starter: 'function contar(nums, alvo) {\n  // seu código\n}',
    tests: [
      { args: [[1, 2, 2, 3, 2], 2], expected: 3 },
      { args: [[1, 2, 3], 9], expected: 0 },
      { args: [[], 1], expected: 0 },
    ],
  },
  {
    id: 'logic-2-4', track: 'logica', unit: 'Fase 2 — Padrões comuns',
    title: 'Inverter uma string', type: 'code', xp: 20,
    content: `
      <p>Pergunta clássica de entrevista.</p>
      <p>Implemente <code>inverter(texto)</code> que retorna o texto de trás pra frente.</p>`,
    funcName: 'inverter',
    starter: 'function inverter(texto) {\n  // seu código\n}',
    tests: [
      { args: ['abc'], expected: 'cba' },
      { args: ['TrilhaDev'], expected: 'veDahlirT' },
      { args: [''], expected: '' },
    ],
  },

  // ===== FASE 3 — Complexidade =====
  {
    id: 'logic-3-1', track: 'logica', unit: 'Fase 3 — Complexidade',
    title: 'Big O (noção)', type: 'theory', xp: 20,
    content: `
      <p><strong>Big O</strong> descreve como o tempo cresce com o tamanho da entrada:</p>
      <ul>
        <li><code>O(1)</code> — constante (não depende do tamanho)</li>
        <li><code>O(n)</code> — 1 loop na lista</li>
        <li><code>O(n²)</code> — loop dentro de loop</li>
      </ul>
      <p>Em entrevista, você comenta a complexidade da sua solução.</p>`,
    quiz: [
      { q: 'Um loop simples na lista é:', options: ['O(1)', 'O(n)', 'O(n²)', 'O(log n)'], answer: 1 },
      { q: 'Loop dentro de loop costuma ser:', options: ['O(1)', 'O(n)', 'O(n²)', 'O(log n)'], answer: 2 },
      { q: 'O(1) significa:', options: ['depende do tamanho', 'tempo constante', 'muito lento', 'sempre 1 segundo'], answer: 1 },
    ],
  },
  {
    id: 'logic-3-2', track: 'logica', unit: 'Fase 3 — Complexidade',
    title: 'Dois números que somam o alvo', type: 'code', xp: 25,
    content: `
      <p>Clássico "Two Sum". Dada uma lista e um alvo, retorne <code>true</code> se existem
      dois números que somam o alvo.</p>
      <p>Implemente <code>temPar(nums, alvo)</code>.</p>`,
    funcName: 'temPar',
    starter: 'function temPar(nums, alvo) {\n  // seu código\n}',
    tests: [
      { args: [[1, 2, 3], 5], expected: true },
      { args: [[1, 2, 3], 7], expected: false },
      { args: [[4, 4], 8], expected: true },
    ],
  },
  {
    id: 'logic-3-3', track: 'logica', unit: 'Fase 3 — Complexidade',
    title: 'Palíndromo', type: 'code', xp: 25,
    content: `
      <p>Um palíndromo é igual de trás pra frente ("arara", "ovo").</p>
      <p>Implemente <code>ehPalindromo(texto)</code> retornando true/false.</p>`,
    funcName: 'ehPalindromo',
    starter: 'function ehPalindromo(texto) {\n  // seu código\n}',
    tests: [
      { args: ['arara'], expected: true },
      { args: ['ovo'], expected: true },
      { args: ['casa'], expected: false },
    ],
  },
  {
    id: 'logic-3-4', track: 'logica', unit: 'Fase 3 — Complexidade',
    title: 'Checklist: mock de entrevista', type: 'checklist', xp: 25,
    content: `
      <p>Simule uma entrevista com um dos exercícios acima:</p>
      <ol>
        <li>Explique o problema em voz alta com suas palavras</li>
        <li>Dê 1 exemplo de entrada e saída</li>
        <li>Descreva a solução em pseudocódigo antes de codar</li>
        <li>Implemente e cite a complexidade (O(n)?)</li>
        <li>Teste com 1 caso de borda (lista vazia)</li>
      </ol>
      <p>Fez os 5 passos? Marque como concluído.</p>`,
  },
];
