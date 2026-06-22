// Conteúdo da trilha. Cada lição: id, unit (fase), title, type (theory|code|checklist), xp, content (HTML), e campos extras por tipo.
import type { Lesson } from '../types';

export const LESSONS: Lesson[] = [

  // ===== FASE 1 — Lógica de programação =====
  {
    id: 'm1-1',
    unit: 'Fase 1 — Lógica de programação',
    title: 'Variáveis e tipos',
    type: 'theory',
    xp: 15,
    content: `
      <p>Uma <strong>variável</strong> é uma caixa com nome que guarda um valor. Você pode trocar o que está dentro dela.</p>
      <pre><code>let x = 5;
x = x + 1; // agora x vale 6</code></pre>
      <p>Tipos básicos:</p>
      <ul>
        <li><strong>número</strong>: 5, -3, 3.14</li>
        <li><strong>string</strong> (texto): "Lucas"</li>
        <li><strong>booleano</strong>: true ou false</li>
      </ul>
    `,
    quiz: [
      { q: 'Depois de <code>let x = 5; x = x + 1;</code>, quanto vale x?', options: ['5', '6', 'x+1', 'Erro'], answer: 1 },
      { q: 'Qual destes é uma string?', options: ['42', 'true', '"Lucas"', '3.14'], answer: 2 },
      { q: '<code>true</code> e <code>false</code> são valores do tipo:', options: ['número', 'string', 'booleano', 'array'], answer: 2 },
    ],
  },
  {
    id: 'm1-2',
    unit: 'Fase 1 — Lógica de programação',
    title: 'Condicionais (if/else)',
    type: 'theory',
    xp: 15,
    content: `
      <p><strong>if/else</strong> decide qual bloco de código roda, baseado numa condição (verdadeiro ou falso).</p>
      <pre><code>if (idade &gt;= 18) {
  console.log("maior de idade");
} else {
  console.log("menor de idade");
}</code></pre>
      <p>Operadores de comparação: <code>==</code> (igual), <code>!=</code> (diferente), <code>&gt;</code>, <code>&lt;</code>, <code>&gt;=</code>, <code>&lt;=</code>.</p>
    `,
    quiz: [
      { q: 'Se <code>idade = 16</code>, qual bloco roda no exemplo acima?', options: ['o if (maior de idade)', 'o else (menor de idade)', 'os dois', 'nenhum'], answer: 1 },
      { q: 'Qual operador testa "maior ou igual"?', options: ['&gt;', '&gt;=', '==', '&lt;='], answer: 1 },
      { q: 'Se a condição do if é falsa e não existe else, o que acontece?', options: ['dá erro', 'nada é executado', 'o programa para'], answer: 1 },
    ],
  },
  {
    id: 'm1-3',
    unit: 'Fase 1 — Lógica de programação',
    title: 'Loops (for/while)',
    type: 'theory',
    xp: 15,
    content: `
      <p>Loops repetem um bloco de código várias vezes.</p>
      <pre><code>for (let i = 0; i &lt; 5; i++) {
  console.log(i);
}
// imprime 0,1,2,3,4</code></pre>
      <p><code>while</code> repete enquanto a condição for verdadeira:</p>
      <pre><code>let n = 0;
while (n &lt; 3) {
  console.log(n);
  n = n + 1;
}</code></pre>
    `,
    quiz: [
      { q: 'Quantas vezes o <code>for (let i = 0; i &lt; 5; i++)</code> executa?', options: ['4', '5', '6', 'infinitas'], answer: 1 },
      { q: 'No exemplo do while, se a linha <code>n = n + 1</code> for removida, o que acontece?', options: ['o loop roda só 1 vez', 'loop infinito', 'erro de sintaxe'], answer: 1 },
      { q: 'Em <code>for (let i = 0; i &lt; 5; i++)</code>, o que <code>i++</code> faz?', options: ['zera i', 'soma 1 em i a cada volta', 'testa se i é par'], answer: 1 },
    ],
  },
  {
    id: 'm1-4',
    unit: 'Fase 1 — Lógica de programação',
    title: 'Acumulador: soma de lista',
    type: 'fill',
    xp: 20,
    content: `
      <p>Um <strong>acumulador</strong> guarda um resultado parcial e é atualizado a cada volta do loop. Complete a linha que soma o item atual no acumulador.</p>
    `,
    fillCode: `function soma(lista) {
  let total = 0;
  for (let i = 0; i < lista.length; i++) {
    total = total ◻;
  }
  return total;
}`,
    fillBlanks: [{ accept: ['+ lista[i]', '+lista[i]'] }],
    fillHint: 'Some o item da posição i: lista[i].',
  },
  {
    id: 'm1-5',
    unit: 'Fase 1 — Lógica de programação',
    title: 'Contar pares',
    type: 'fill',
    xp: 20,
    content: `
      <p>Mesmo padrão de acumulador, mas <strong>contando</strong> em vez de somar. Um número é par quando o resto da divisão por 2 é zero. Complete o teste de "é par".</p>
    `,
    fillCode: `function contarPares(lista) {
  let total = 0;
  for (let i = 0; i < lista.length; i++) {
    if (lista[i] % 2 ◻ 0) total = total + 1;
  }
  return total;
}`,
    fillBlanks: [{ accept: ['===', '=='] }],
    fillHint: 'Compare o resto com 0 usando igualdade estrita.',
  },
  {
    id: 'm1-6',
    unit: 'Fase 1 — Lógica de programação',
    title: 'Funções',
    type: 'theory',
    xp: 15,
    content: `
      <p>Uma <strong>função</strong> é um bloco de código reutilizável. Ela pode receber <strong>parâmetros</strong> (entradas) e devolver um resultado com <code>return</code>.</p>
      <pre><code>function dobro(n) {
  return n * 2;
}

dobro(4);  // 8
dobro(10); // 20</code></pre>
      <p>Vantagem: escreve a lógica uma vez, usa quantas vezes precisar.</p>
    `,
    quiz: [
      { q: 'No exemplo, qual valor <code>dobro(4)</code> retorna?', options: ['4', '8', '2', 'dobro'], answer: 1 },
      { q: 'Pra que serve o <code>return</code>?', options: ['imprime na tela', 'devolve um valor pra quem chamou a função', 'para o programa'], answer: 1 },
      { q: 'Qual a maior vantagem de usar função em vez de copiar e colar o mesmo código?', options: ['o código fica mais bonito', 'reutiliza a lógica e facilita manutenção', 'roda mais rápido'], answer: 1 },
    ],
  },
  {
    id: 'm1-7',
    unit: 'Fase 1 — Lógica de programação',
    title: 'Inverter string',
    type: 'fill',
    xp: 20,
    content: `
      <p>Pra inverter, o loop percorre o texto <strong>de trás pra frente</strong>, acumulando cada caractere. Complete o passo do loop pra ele <strong>diminuir</strong> o índice.</p>
    `,
    fillCode: `function inverter(texto) {
  let resultado = '';
  for (let i = texto.length - 1; i >= 0; i◻) {
    resultado += texto[i];
  }
  return resultado;
}`,
    fillBlanks: [{ accept: ['--'] }],
    fillHint: 'Operador que subtrai 1 do índice a cada volta.',
  },
  {
    id: 'm1-8',
    unit: 'Fase 1 — Lógica de programação',
    title: 'Array vs Objeto',
    type: 'theory',
    xp: 15,
    content: `
      <p><strong>Array (lista)</strong>: valores em sequência, acessados por posição (índice), começando em 0.</p>
      <pre><code>let lista = [10, 20, 30];
lista[0]; // 10
lista[2]; // 30</code></pre>
      <p><strong>Objeto</strong>: valores acessados por nome (chave), não por posição.</p>
      <pre><code>let pessoa = { nome: "Lucas", idade: 21 };
pessoa.nome;  // "Lucas"
pessoa.idade; // 21</code></pre>
    `,
    quiz: [
      { q: 'Como acessar o primeiro item de <code>let lista = [10, 20, 30]</code>?', options: ['lista[0]', 'lista[1]', 'lista.primeiro', 'lista(0)'], answer: 0 },
      { q: 'Como acessar o nome em <code>let pessoa = {nome: "Lucas", idade: 21}</code>?', options: ['pessoa[0]', 'pessoa.nome', 'pessoa->nome', 'pessoa("nome")'], answer: 1 },
      { q: 'Quando faz mais sentido usar objeto em vez de array?', options: ['quando cada valor tem um nome/significado próprio (chave)', 'quando a ordem dos itens é o mais importante', 'nunca, array sempre é melhor'], answer: 0 },
    ],
  },
  {
    id: 'm1-9',
    unit: 'Fase 1 — Lógica de programação',
    title: 'Operadores lógicos',
    type: 'theory',
    xp: 15,
    content: `
      <p>Operadores lógicos combinam condições:</p>
      <ul>
        <li><code>&amp;&amp;</code> (E/AND): verdadeiro só se AMBOS os lados forem verdadeiros</li>
        <li><code>||</code> (OU/OR): verdadeiro se PELO MENOS UM lado for verdadeiro</li>
        <li><code>!</code> (NÃO/NOT): inverte o valor (true vira false e vice-versa)</li>
      </ul>
      <pre><code>let idade = 20;
let temCarteira = true;

if (idade &gt;= 18 &amp;&amp; temCarteira) {
  console.log("pode dirigir");
}</code></pre>
    `,
    quiz: [
      { q: '<code>idade &gt;= 18 &amp;&amp; temCarteira</code> é verdadeiro quando:', options: ['idade&gt;=18 OU temCarteira é true', 'idade&gt;=18 E temCarteira são ambos true', 'apenas temCarteira é true'], answer: 1 },
      { q: '<code>!true</code> resulta em:', options: ['true', 'false', 'erro'], answer: 1 },
      { q: '<code>5 &gt; 3 || 2 &gt; 10</code> resulta em:', options: ['true, porque pelo menos uma condição é verdadeira', 'false, porque uma condição é falsa', 'erro'], answer: 0 },
    ],
  },
  {
    id: 'm1-10',
    unit: 'Fase 1 — Lógica de programação',
    title: 'Loops aninhados',
    type: 'theory',
    xp: 15,
    content: `
      <p>Um loop dentro de outro loop é um <strong>loop aninhado</strong>. O loop interno roda completamente pra cada volta do loop externo.</p>
      <pre><code>for (let i = 1; i &lt;= 3; i++) {
  for (let j = 1; j &lt;= 3; j++) {
    console.log(i, j);
  }
}
// (1,1) (1,2) (1,3) (2,1) (2,2) (2,3) (3,1) (3,2) (3,3)</code></pre>
      <p>Usado pra percorrer combinações, tabelas, matrizes (listas de listas).</p>
    `,
    quiz: [
      { q: 'Quantas vezes o <code>console.log</code> roda no exemplo?', options: ['3', '6', '9', '12'], answer: 2 },
      { q: 'Pra cada volta do loop externo, o que acontece com o loop interno?', options: ['roda só 1 vez', 'roda completamente do início ao fim', 'não roda'], answer: 1 },
      { q: 'Loops aninhados são úteis pra:', options: ['percorrer combinações/matrizes (listas de listas)', 'tornar o código mais lento sem motivo', 'substituir funções'], answer: 0 },
    ],
  },
  {
    id: 'm1-11',
    unit: 'Fase 1 — Lógica de programação',
    title: 'Contar vogais',
    type: 'fill',
    xp: 20,
    content: `
      <p>Pra cada caractere, testamos se ele está na lista de vogais com <code>'aeiou'.includes(...)</code>. Complete o que é passado pro <code>includes</code>.</p>
    `,
    fillCode: `function contarVogais(texto) {
  let total = 0;
  for (let i = 0; i < texto.length; i++) {
    if ('aeiou'.includes(◻)) total++;
  }
  return total;
}`,
    fillBlanks: [{ accept: ['texto[i]'] }],
    fillHint: 'O caractere na posição i do texto.',
  },
  {
    id: 'm1-12',
    unit: 'Fase 1 — Lógica de programação',
    title: 'Menor valor da lista',
    type: 'fill',
    xp: 20,
    content: `
      <p>Guarde um "menor até agora" e atualize sempre que achar um número <strong>menor</strong>. Complete a comparação.</p>
    `,
    fillCode: `function menorValor(lista) {
  let menor = lista[0];
  for (let i = 1; i < lista.length; i++) {
    if (lista[i] ◻ menor) menor = lista[i];
  }
  return menor;
}`,
    fillBlanks: [{ accept: ['<'] }],
    fillHint: 'Quando o item atual é menor que o guardado.',
  },
  {
    id: 'm1-13',
    unit: 'Fase 1 — Lógica de programação',
    title: 'Produto de uma lista',
    type: 'fill',
    xp: 20,
    content: `
      <p>No acumulador de multiplicação, o valor inicial <strong>não</strong> pode ser 0 — senão zera tudo. Complete o valor inicial certo.</p>
    `,
    fillCode: `function produto(lista) {
  let total = ◻;
  for (let i = 0; i < lista.length; i++) {
    total = total * lista[i];
  }
  return total;
}`,
    fillBlanks: [{ accept: ['1'] }],
    fillHint: 'Elemento neutro da multiplicação.',
  },
  {
    id: 'm1-14',
    unit: 'Fase 1 — Lógica de programação',
    title: 'Palíndromo',
    type: 'fill',
    xp: 20,
    content: `
      <p>Palíndromo se lê igual de trás pra frente (ex: "arara"). Invertemos o texto e comparamos com o original. Complete a comparação que devolve <code>true</code>/<code>false</code>.</p>
    `,
    fillCode: `function ehPalindromo(texto) {
  let invertido = '';
  for (let i = texto.length - 1; i >= 0; i--) {
    invertido += texto[i];
  }
  return texto ◻ invertido;
}`,
    fillBlanks: [{ accept: ['===', '=='] }],
    fillHint: 'Igualdade estrita entre original e invertido.',
  },
  {
    id: 'm1-15',
    unit: 'Fase 1 — Lógica de programação',
    title: 'FizzBuzz',
    type: 'theory',
    xp: 20,
    content: `
      <p>Clássico <strong>FizzBuzz</strong>: de 1 até n, múltiplos de 3 viram <code>"Fizz"</code>, de 5 viram <code>"Buzz"</code>, de 3 <strong>e</strong> 5 viram <code>"FizzBuzz"</code>, o resto fica o próprio número.</p>
      <pre><code>for (let i = 1; i &lt;= n; i++) {
  if (i % 15 === 0)      resultado.push("FizzBuzz");
  else if (i % 3 === 0)  resultado.push("Fizz");
  else if (i % 5 === 0)  resultado.push("Buzz");
  else                   resultado.push(i);
}</code></pre>
    `,
    quiz: [
      { q: 'Por que o teste de <code>% 15</code> (ou 3 <strong>e</strong> 5) vem <strong>antes</strong> dos outros?', options: ['por estética', 'senão o número cai em "Fizz" ou "Buzz" e nunca chega em "FizzBuzz"', 'porque 15 é maior', 'tanto faz a ordem'], answer: 1 },
      { q: 'Pra <code>fizzbuzz(5)</code>, qual a saída?', options: ['[1, 2, Fizz, 4, Buzz]', '[Fizz, Buzz, 1, 2, 4]', '[1, 2, 3, 4, 5]', '[1, 2, Buzz, 4, Fizz]'], answer: 0 },
      { q: 'O que <code>i % 3 === 0</code> verifica?', options: ['se i é igual a 3', 'se i é múltiplo de 3 (resto zero)', 'se i é par', 'se i é maior que 3'], answer: 1 },
    ],
  },

  {
    id: 'x1-1',
    unit: 'Fase 1 — Lógica de programação',
    title: 'Média de uma lista',
    type: 'fill',
    xp: 20,
    content: `
      <p>A <strong>média</strong> é a soma dividida pela quantidade. Complete a operação que devolve a média.</p>
    `,
    fillCode: `function media(lista) {
  if (lista.length === 0) return 0;
  let total = 0;
  for (let i = 0; i < lista.length; i++) total += lista[i];
  return total ◻ lista.length;
}`,
    fillBlanks: [{ accept: ['/'] }],
    fillHint: 'Divida a soma pela quantidade de itens.',
  },
  {
    id: 'x1-2',
    unit: 'Fase 1 — Lógica de programação',
    title: 'Contar ocorrências',
    type: 'fill',
    xp: 20,
    content: `
      <p>Conte quantas vezes <code>alvo</code> aparece na lista. Complete o que o item atual deve ser comparado.</p>
    `,
    fillCode: `function contar(lista, alvo) {
  let total = 0;
  for (let i = 0; i < lista.length; i++) {
    if (lista[i] === ◻) total++;
  }
  return total;
}`,
    fillBlanks: [{ accept: ['alvo'] }],
    fillHint: 'O valor procurado, recebido como parâmetro.',
  },
  {
    id: 'x1-3',
    unit: 'Fase 1 — Lógica de programação',
    title: 'Operador módulo (%)',
    type: 'theory',
    xp: 15,
    content: `
      <p>O operador <strong>%</strong> (módulo) devolve o <strong>resto</strong> da divisão.</p>
      <pre><code>7 % 2 // 1  (7 dividido por 2 sobra 1)
10 % 5 // 0  (divisão exata)
8 % 3  // 2</code></pre>
      <p>Uso clássico: <code>n % 2 === 0</code> testa se <code>n</code> é <strong>par</strong> (resto zero).</p>
    `,
    quiz: [
      { q: 'Quanto vale <code>9 % 4</code>?', options: ['1', '2', '2.25', '0'], answer: 0 },
      { q: 'Como testar se <code>n</code> é par?', options: ['n / 2 === 0', 'n % 2 === 0', 'n % 2 === 1', 'n * 2 === 0'], answer: 1 },
      { q: 'Quanto vale <code>6 % 3</code>?', options: ['2', '1', '0', '3'], answer: 2 },
    ],
  },
  {
    id: 'x1-4',
    unit: 'Fase 1 — Lógica de programação',
    title: 'Maior número da lista',
    type: 'fill',
    xp: 20,
    content: `
      <p>Guarde um "maior até agora" e atualize quando achar um número <strong>maior</strong>. Complete a comparação.</p>
    `,
    fillCode: `function maiorDaLista(lista) {
  let maior = lista[0];
  for (let i = 1; i < lista.length; i++) {
    if (lista[i] ◻ maior) maior = lista[i];
  }
  return maior;
}`,
    fillBlanks: [{ accept: ['>'] }],
    fillHint: 'Quando o item atual é maior que o guardado.',
  },
  {
    id: 'x1-5',
    unit: 'Fase 1 — Lógica de programação',
    title: 'Está no intervalo?',
    type: 'fill',
    xp: 20,
    content: `
      <p>Um número está no intervalo se for <code>&gt;= min</code> <strong>e</strong> <code>&lt;= max</code>. Complete o operador que combina as duas condições.</p>
    `,
    fillCode: `function noIntervalo(n, min, max) {
  return n >= min ◻ n <= max;
}`,
    fillBlanks: [{ accept: ['&&'] }],
    fillHint: 'Operador lógico "E" — só true se ambos forem true.',
  },

  // ===== FASE 2 — Estruturas de dados =====
  {
    id: 'm2-1',
    unit: 'Fase 2 — Estruturas de dados',
    title: 'Array: métodos básicos',
    type: 'theory',
    xp: 15,
    content: `
      <p>Arrays têm propriedades e métodos úteis:</p>
      <ul>
        <li><code>lista.length</code> → quantidade de itens</li>
        <li><code>lista.push(x)</code> → adiciona x no final</li>
        <li><code>lista[lista.length - 1]</code> → último item</li>
      </ul>
      <pre><code>let lista = [1, 2, 3];
lista.push(4); // [1,2,3,4]
lista.length;  // 4</code></pre>
    `,
    quiz: [
      { q: 'Depois de <code>let lista = [1,2,3]; lista.push(4);</code>, quanto vale <code>lista.length</code>?', options: ['3', '4', '5'], answer: 1 },
      { q: 'Como acessar o último item de <code>lista</code> sem saber o tamanho fixo?', options: ['lista[lista.length]', 'lista[lista.length - 1]', 'lista[-1]'], answer: 1 },
      { q: '<code>lista.push(x)</code> faz o quê?', options: ['remove x da lista', 'adiciona x no início', 'adiciona x no final'], answer: 2 },
    ],
  },
  {
    id: 'm2-2',
    unit: 'Fase 2 — Estruturas de dados',
    title: 'Filtrar lista',
    type: 'fill',
    xp: 20,
    content: `
      <p>Aqui o acumulador é uma <strong>lista</strong>: adicionamos só os pares. Complete o método que adiciona o item no fim do array.</p>
    `,
    fillCode: `function filtrarPares(lista) {
  let resultado = [];
  for (let i = 0; i < lista.length; i++) {
    if (lista[i] % 2 === 0) resultado.◻(lista[i]);
  }
  return resultado;
}`,
    fillBlanks: [{ accept: ['push'] }],
    fillHint: 'Método de array que adiciona no final.',
  },
  {
    id: 'm2-3',
    unit: 'Fase 2 — Estruturas de dados',
    title: 'Transformar lista',
    type: 'fill',
    xp: 20,
    content: `
      <p>Crie uma nova lista com cada valor <strong>multiplicado por 2</strong>. Complete o que é adicionado ao resultado.</p>
    `,
    fillCode: `function dobrarValores(lista) {
  let resultado = [];
  for (let i = 0; i < lista.length; i++) {
    resultado.push(◻);
  }
  return resultado;
}`,
    fillBlanks: [{ accept: ['lista[i] * 2', 'lista[i]*2', '2 * lista[i]', '2*lista[i]'] }],
    fillHint: 'O item atual vezes 2.',
  },
  {
    id: 'm2-4',
    unit: 'Fase 2 — Estruturas de dados',
    title: 'Objetos na prática',
    type: 'theory',
    xp: 15,
    content: `
      <p>Você pode guardar dados relacionados num objeto, e listas de objetos pra representar "coisas":</p>
      <pre><code>let clientes = [
  { nome: "Ana", idade: 30 },
  { nome: "Bruno", idade: 17 }
];

clientes[0].nome;  // "Ana"
clientes[1].idade; // 17</code></pre>
      <p>É exatamente assim que dados costumam vir de um banco/API: lista de objetos.</p>
    `,
    quiz: [
      { q: 'No exemplo, como acessar a idade do Bruno?', options: ['clientes.idade[1]', 'clientes[1].idade', 'clientes["Bruno"].idade'], answer: 1 },
      { q: 'Uma lista de objetos costuma representar:', options: ['um único valor', 'vários registros com vários atributos cada', 'apenas números'], answer: 1 },
      { q: '<code>clientes[0].nome</code> acessa:', options: ['o nome do item na posição 0', 'o nome da lista inteira', 'um erro, sintaxe inválida'], answer: 0 },
    ],
  },
  {
    id: 'm2-5',
    unit: 'Fase 2 — Estruturas de dados',
    title: 'Maior valor da lista',
    type: 'fill',
    xp: 20,
    content: `
      <p>Acumulador + condicional: quando o item é maior que o guardado, atualizamos. Complete o que o "maior" recebe.</p>
    `,
    fillCode: `function maiorValor(lista) {
  let maior = lista[0];
  for (let i = 1; i < lista.length; i++) {
    if (lista[i] > maior) maior = ◻;
  }
  return maior;
}`,
    fillBlanks: [{ accept: ['lista[i]'] }],
    fillHint: 'O novo maior é o item atual.',
  },
  {
    id: 'm2-6',
    unit: 'Fase 2 — Estruturas de dados',
    title: 'Somar campo de uma lista de objetos',
    type: 'fill',
    xp: 20,
    content: `
      <p>Dados como <code>[{valor: 10}, {valor: 20}]</code> vêm de API/banco. Some o campo <code>valor</code> de cada objeto. Complete o acesso ao campo.</p>
    `,
    fillCode: `function totalPedidos(pedidos) {
  let total = 0;
  for (let i = 0; i < pedidos.length; i++) {
    total += pedidos[i].◻;
  }
  return total;
}`,
    fillBlanks: [{ accept: ['valor'] }],
    fillHint: 'O nome do campo que queremos somar.',
  },
  {
    id: 'm2-7',
    unit: 'Fase 2 — Estruturas de dados',
    title: 'Encontrar item por campo',
    type: 'fill',
    xp: 20,
    content: `
      <p>Percorra a lista de objetos e, ao achar o de <code>nome</code> igual, devolva <strong>o objeto inteiro</strong>. Complete o que é retornado.</p>
    `,
    fillCode: `function encontrarPorNome(lista, nome) {
  for (let i = 0; i < lista.length; i++) {
    if (lista[i].nome === nome) return ◻;
  }
  return null;
}`,
    fillBlanks: [{ accept: ['lista[i]'] }],
    fillHint: 'O objeto da posição atual.',
  },
  {
    id: 'm2-8',
    unit: 'Fase 2 — Estruturas de dados',
    title: 'Contar ocorrências (objeto)',
    type: 'fill',
    xp: 20,
    content: `
      <p>Usamos um objeto como contador. Se a chave ainda não existe, <code>contagem[chave]</code> é <code>undefined</code> — o <code>|| 0</code> faz virar 0. Complete o operador que dá esse "valor padrão".</p>
    `,
    fillCode: `function contarOcorrencias(lista) {
  let contagem = {};
  for (let i = 0; i < lista.length; i++) {
    let chave = lista[i];
    contagem[chave] = (contagem[chave] ◻ 0) + 1;
  }
  return contagem;
}`,
    fillBlanks: [{ accept: ['||'] }],
    fillHint: 'Operador "OU" — usa 0 quando o valor é undefined.',
  },
  {
    id: 'm2-9',
    unit: 'Fase 2 — Estruturas de dados',
    title: 'Remover duplicados',
    type: 'fill',
    xp: 20,
    content: `
      <p>Só adicionamos um item se ele <strong>ainda não estiver</strong> no resultado. Complete o método que testa se o array já contém o item.</p>
    `,
    fillCode: `function removerDuplicados(lista) {
  let resultado = [];
  for (let i = 0; i < lista.length; i++) {
    if (!resultado.◻(lista[i])) resultado.push(lista[i]);
  }
  return resultado;
}`,
    fillBlanks: [{ accept: ['includes'] }],
    fillHint: 'Método de array que retorna true se o valor existe.',
  },
  {
    id: 'm2-10',
    unit: 'Fase 2 — Estruturas de dados',
    title: 'map, filter, reduce',
    type: 'theory',
    xp: 15,
    content: `
      <p>Você já resolveu vários exercícios com loop + acumulador. JavaScript tem métodos prontos pra padrões comuns:</p>
      <ul>
        <li><code>lista.map(fn)</code> → transforma cada item (igual ao seu <code>dobrarValores</code>)</li>
        <li><code>lista.filter(fn)</code> → mantém só os itens que passam um teste (igual ao seu <code>filtrarPares</code>)</li>
        <li><code>lista.reduce(fn, inicial)</code> → acumula tudo num resultado (igual ao seu <code>soma</code>)</li>
      </ul>
      <pre><code>[1,2,3].map(n => n * 2);            // [2,4,6]
[1,2,3,4].filter(n => n % 2 === 0);  // [2,4]
[1,2,3].reduce((total, n) => total + n, 0); // 6</code></pre>
      <p>Você não precisa trocar seu jeito de escrever agora — mas vai ver <code>map/filter/reduce</code> o tempo todo em código gerado por IA, então reconhecer o padrão já ajuda.</p>
    `,
    quiz: [
      { q: '<code>[1,2,3].map(n => n * 2)</code> retorna:', options: ['[1,2,3]', '[2,4,6]', '6', '[2,3,4]'], answer: 1 },
      { q: '<code>[1,2,3,4].filter(n => n % 2 === 0)</code> retorna:', options: ['[1,3]', '[2,4]', '[1,2,3,4]', '10'], answer: 1 },
      { q: '<code>reduce</code> é parecido com qual padrão que você já usou?', options: ['condicional simples', 'acumulador em loop', 'loop aninhado'], answer: 1 },
    ],
  },

  {
    id: 'x2-1',
    unit: 'Fase 2 — Estruturas de dados',
    title: 'Remover duplicados (Set)',
    type: 'fill',
    xp: 20,
    content: `
      <p>Um <strong>Set</strong> guarda só valores únicos. Convertemos a lista em Set e espalhamos de volta num array. Complete a estrutura usada.</p>
    `,
    fillCode: `function semDuplicados(lista) {
  return [...new ◻(lista)];
}`,
    fillBlanks: [{ accept: ['Set'] }],
    fillHint: 'Estrutura que só aceita valores únicos (maiúscula).',
  },
  {
    id: 'x2-2',
    unit: 'Fase 2 — Estruturas de dados',
    title: 'Somar valores de um objeto',
    type: 'fill',
    xp: 20,
    content: `
      <p><code>Object.values(obj)</code> devolve um array com os valores do objeto. Complete o método que extrai os valores.</p>
    `,
    fillCode: `function somaValores(obj) {
  let total = 0;
  let valores = Object.◻(obj);
  for (let i = 0; i < valores.length; i++) total += valores[i];
  return total;
}`,
    fillBlanks: [{ accept: ['values'] }],
    fillHint: 'Object.??? devolve os valores (não as chaves).',
  },
  {
    id: 'x2-3',
    unit: 'Fase 2 — Estruturas de dados',
    title: 'Quando usar Map vs Objeto',
    type: 'theory',
    xp: 15,
    content: `
      <p>Os dois guardam pares <strong>chave → valor</strong>, mas:</p>
      <ul>
        <li><strong>Objeto</strong>: chaves são texto. Bom pra "registro" com campos conhecidos (<code>user.nome</code>).</li>
        <li><strong>Map</strong>: chave pode ser qualquer tipo, mantém ordem de inserção, tem <code>.size</code> e é melhor pra adicionar/remover muito.</li>
      </ul>
      <pre><code>const m = new Map();
m.set('a', 1);
m.get('a'); // 1
m.size;     // 1</code></pre>
    `,
    quiz: [
      { q: 'Qual estrutura tem <code>.size</code> pra contar itens?', options: ['Objeto', 'Map', 'os dois', 'nenhum'], answer: 1 },
      { q: 'Pra um "registro" com campos fixos (nome, idade), o mais natural é:', options: ['Map', 'Objeto', 'Set', 'Array'], answer: 1 },
      { q: 'Como pegar um valor de um Map <code>m</code> na chave "a"?', options: ['m["a"]', 'm.a', 'm.get("a")', 'm.value("a")'], answer: 2 },
    ],
  },
  {
    id: 'x2-4',
    unit: 'Fase 2 — Estruturas de dados',
    title: 'Interseção de duas listas',
    type: 'fill',
    xp: 20,
    content: `
      <p>Interseção = itens em <strong>ambas</strong> as listas, sem repetir. Adicionamos quando o item está em <code>b</code> <strong>e</strong> ainda não está no resultado. Complete o operador.</p>
    `,
    fillCode: `function intersecao(a, b) {
  let resultado = [];
  for (let i = 0; i < a.length; i++) {
    if (b.includes(a[i]) ◻ !resultado.includes(a[i])) resultado.push(a[i]);
  }
  return resultado;
}`,
    fillBlanks: [{ accept: ['&&'] }],
    fillHint: 'Precisa das DUAS condições verdadeiras.',
  },
  {
    id: 'x2-5',
    unit: 'Fase 2 — Estruturas de dados',
    title: 'Agrupar por primeira letra',
    type: 'fill',
    xp: 20,
    content: `
      <p>Objeto como agrupador: a chave é a primeira letra, o valor é um array de palavras. Complete o que é adicionado ao grupo.</p>
    `,
    fillCode: `function agrupar(palavras) {
  let grupos = {};
  for (let i = 0; i < palavras.length; i++) {
    let letra = palavras[i][0];
    if (!grupos[letra]) grupos[letra] = [];
    grupos[letra].push(◻);
  }
  return grupos;
}`,
    fillBlanks: [{ accept: ['palavras[i]'] }],
    fillHint: 'A palavra atual entra no array do grupo.',
  },

  // ===== FASE 3 — Recursão =====
  {
    id: 'rec-1',
    unit: 'Fase 3 — Recursão',
    title: 'O que é recursão',
    type: 'theory',
    xp: 15,
    content: `
      <p><strong>Recursão</strong> é quando uma função chama ela mesma. Toda função recursiva precisa de um <strong>caso base</strong> (condição que para a recursão) — sem isso, ela chama a si mesma pra sempre.</p>
      <pre><code>function fatorial(n) {
  if (n &lt;= 1) return 1;       // caso base
  return n * fatorial(n - 1); // chamada recursiva
}

fatorial(4); // 4 * 3 * 2 * 1 = 24</code></pre>
    `,
    quiz: [
      { q: 'No exemplo, qual é o caso base?', options: ['n * fatorial(n - 1)', 'if (n &lt;= 1) return 1', 'fatorial(4)'], answer: 1 },
      { q: 'O que acontece se uma função recursiva não tiver caso base?', options: ['ela roda mais rápido', 'ela chama a si mesma pra sempre (erro de stack overflow)', 'nada, funciona normal'], answer: 1 },
      { q: '<code>fatorial(4)</code> no exemplo retorna:', options: ['10', '24', '4'], answer: 1 },
    ],
  },
  {
    id: 'rec-2',
    unit: 'Fase 3 — Recursão',
    title: 'Fatorial',
    type: 'fill',
    xp: 20,
    content: `
      <p><code>n! = n × (n-1)!</code>, com caso base <code>n &lt;= 1</code> → 1. Complete a chamada recursiva com o problema <strong>menor</strong>.</p>
    `,
    fillCode: `function fatorial(n) {
  if (n <= 1) return 1;
  return n * fatorial(◻);
}`,
    fillBlanks: [{ accept: ['n - 1', 'n-1'] }],
    fillHint: 'Chame a função com um a menos.',
  },
  {
    id: 'rec-3',
    unit: 'Fase 3 — Recursão',
    title: 'Fibonacci',
    type: 'fill',
    xp: 20,
    content: `
      <p>Cada número é a <strong>soma dos dois anteriores</strong>. Caso base: <code>n &lt; 2</code> retorna o próprio n. Complete o operador que junta as duas chamadas.</p>
    `,
    fillCode: `function fibonacci(n) {
  if (n < 2) return n;
  return fibonacci(n - 1) ◻ fibonacci(n - 2);
}`,
    fillBlanks: [{ accept: ['+'] }],
    fillHint: 'Soma dos dois anteriores.',
  },
  {
    id: 'rec-4',
    unit: 'Fase 3 — Recursão',
    title: 'Soma recursiva',
    type: 'fill',
    xp: 20,
    content: `
      <p>Soma = primeiro item + soma do <strong>resto</strong> da lista. <code>lista.slice(1)</code> devolve a lista sem o primeiro item. Complete o método que pega o resto.</p>
    `,
    fillCode: `function somaRecursiva(lista) {
  if (lista.length === 0) return 0;
  return lista[0] + somaRecursiva(lista.◻(1));
}`,
    fillBlanks: [{ accept: ['slice'] }],
    fillHint: 'Método que corta a lista a partir do índice 1.',
  },
  {
    id: 'rec-5',
    unit: 'Fase 3 — Recursão',
    title: 'Recursão vs loop',
    type: 'theory',
    xp: 15,
    content: `
      <p>Tudo que se faz com recursão pode ser feito com loop, e vice-versa. Quando escolher cada um:</p>
      <ul>
        <li><strong>Loop</strong>: geralmente mais simples de ler e mais eficiente (menos uso de memória)</li>
        <li><strong>Recursão</strong>: brilha em problemas naturalmente "divididos em partes menores" (árvores, listas aninhadas, alguns algoritmos de busca/ordenação)</li>
      </ul>
      <p>Cuidado: recursão sem caso base, ou com entrada muito grande, pode causar <strong>stack overflow</strong> (estouro da pilha de chamadas).</p>
    `,
    quiz: [
      { q: 'Recursão sem caso base corre o risco de:', options: ['ficar mais rápida', 'stack overflow (estouro de pilha)', 'virar um loop automaticamente'], answer: 1 },
      { q: 'Recursão costuma ser mais natural pra:', options: ['problemas divididos em partes menores (árvores, listas aninhadas)', 'somar 2 números', 'imprimir texto fixo'], answer: 0 },
      { q: 'É verdade que tudo feito com recursão pode ser feito com loop?', options: ['sim', 'não, são coisas completamente diferentes'], answer: 0 },
    ],
  },

  {
    id: 'x3-1',
    unit: 'Fase 3 — Recursão',
    title: 'Caso base e caso recursivo',
    type: 'theory',
    xp: 15,
    content: `
      <p>Toda recursão precisa de duas partes:</p>
      <ul>
        <li><strong>Caso base</strong>: quando parar (sem ele, loop infinito → erro de pilha).</li>
        <li><strong>Caso recursivo</strong>: a função chama a si mesma com um problema <em>menor</em>.</li>
      </ul>
      <pre><code>function contagem(n) {
  if (n === 0) return;      // caso base
  console.log(n);
  contagem(n - 1);          // caso recursivo (menor)
}</code></pre>
    `,
    quiz: [
      { q: 'O que evita a recursão rodar pra sempre?', options: ['o caso recursivo', 'o caso base', 'o return', 'o loop'], answer: 1 },
      { q: 'No caso recursivo, o problema deve ficar:', options: ['maior', 'igual', 'menor', 'aleatório'], answer: 2 },
      { q: 'Recursão sem caso base causa:', options: ['resultado errado', 'estouro de pilha', 'nada', 'loop for'], answer: 1 },
    ],
  },
  {
    id: 'x3-2',
    unit: 'Fase 3 — Recursão',
    title: 'Soma recursiva (caso base)',
    type: 'fill',
    xp: 20,
    content: `
      <p>Toda recursão precisa de um <strong>caso base</strong> que para. Aqui, lista vazia deve devolver a soma neutra. Complete o valor retornado no caso base.</p>
    `,
    fillCode: `function somaRec(lista) {
  if (lista.length === 0) return ◻;
  return lista[0] + somaRec(lista.slice(1));
}`,
    fillBlanks: [{ accept: ['0'] }],
    fillHint: 'Soma de uma lista vazia.',
  },
  {
    id: 'x3-3',
    unit: 'Fase 3 — Recursão',
    title: 'Potência recursiva',
    type: 'fill',
    xp: 20,
    content: `
      <p><code>base^exp = base × base^(exp-1)</code>, com caso base <code>exp === 0</code> → 1. Complete o expoente <strong>menor</strong> na chamada recursiva.</p>
    `,
    fillCode: `function potencia(base, exp) {
  if (exp === 0) return 1;
  return base * potencia(base, ◻);
}`,
    fillBlanks: [{ accept: ['exp - 1', 'exp-1'] }],
    fillHint: 'Expoente com um a menos.',
  },
  {
    id: 'x3-4',
    unit: 'Fase 3 — Recursão',
    title: 'Contar dígitos',
    type: 'fill',
    xp: 20,
    content: `
      <p>Cada divisão inteira por 10 "remove" um dígito. Caso base: <code>n &lt; 10</code> tem 1 dígito. Complete o operador da divisão dentro do <code>Math.floor</code>.</p>
    `,
    fillCode: `function contaDigitos(n) {
  if (n < 10) return 1;
  return 1 + contaDigitos(Math.floor(n ◻ 10));
}`,
    fillBlanks: [{ accept: ['/'] }],
    fillHint: 'Divida por 10 e arredonde pra baixo.',
  },
  {
    id: 'x3-5',
    unit: 'Fase 3 — Recursão',
    title: 'Inverter string recursivo',
    type: 'fill',
    xp: 20,
    content: `
      <p>Inverter <code>"abc"</code> = inverter <code>"bc"</code> e colocar o <code>"a"</code> no fim. Caso base: string vazia. Complete o operador que junta o resto invertido com o primeiro caractere.</p>
    `,
    fillCode: `function inverteRec(s) {
  if (s === '') return '';
  return inverteRec(s.slice(1)) ◻ s[0];
}`,
    fillBlanks: [{ accept: ['+'] }],
    fillHint: 'Concatena strings.',
  },

  // ===== FASE 4 — Algoritmos clássicos =====
  {
    id: 'alg-1',
    unit: 'Fase 4 — Algoritmos clássicos',
    title: 'Complexidade (Big O)',
    type: 'theory',
    xp: 15,
    content: `
      <p><strong>Big O</strong> descreve como o tempo (ou memória) de um algoritmo cresce conforme a entrada cresce. Não é tempo exato, é a "forma" do crescimento.</p>
      <ul>
        <li><code>O(1)</code>: tempo constante — ex: acessar <code>lista[0]</code></li>
        <li><code>O(n)</code>: proporcional ao tamanho — ex: 1 loop percorrendo a lista (seu <code>soma</code>, <code>maiorValor</code>)</li>
        <li><code>O(n²)</code>: proporcional ao quadrado — ex: loop aninhado percorrendo a lista duas vezes</li>
      </ul>
      <p>Não precisa calcular fórmula — a ideia é: "se a entrada dobrar, meu código fica 2x mais lento, ou 4x, ou continua igual?"</p>
    `,
    quiz: [
      { q: 'Um loop simples percorrendo uma lista de tamanho n é:', options: ['O(1)', 'O(n)', 'O(n²)'], answer: 1 },
      { q: 'Dois loops aninhados, cada um percorrendo a lista inteira, são aproximadamente:', options: ['O(n)', 'O(n²)', 'O(1)'], answer: 1 },
      { q: 'Acessar <code>lista[0]</code> é:', options: ['O(1) — tempo constante, não importa o tamanho da lista', 'O(n)', 'O(n²)'], answer: 0 },
    ],
  },
  {
    id: 'alg-2',
    unit: 'Fase 4 — Algoritmos clássicos',
    title: 'Busca linear',
    type: 'fill',
    xp: 20,
    content: `
      <p>Percorra a lista do início ao fim; ao achar o alvo, devolva o <strong>índice</strong>. Complete o que é retornado quando encontra.</p>
    `,
    fillCode: `function buscaLinear(lista, alvo) {
  for (let i = 0; i < lista.length; i++) {
    if (lista[i] === alvo) return ◻;
  }
  return -1;
}`,
    fillBlanks: [{ accept: ['i'] }],
    fillHint: 'A posição atual do loop.',
  },
  {
    id: 'alg-3',
    unit: 'Fase 4 — Algoritmos clássicos',
    title: 'Busca binária',
    type: 'theory',
    xp: 20,
    content: `
      <p>Em lista <strong>ordenada</strong>, a busca binária olha o <strong>meio</strong>, descarta metade e repete — <code>O(log n)</code>.</p>
      <pre><code>let lo = 0, hi = lista.length - 1;
while (lo &lt;= hi) {
  let meio = Math.floor((lo + hi) / 2);
  if (lista[meio] === alvo) return meio;
  else if (alvo &lt; lista[meio]) hi = meio - 1; // vai pra esquerda
  else lo = meio + 1;                          // vai pra direita
}
return -1;</code></pre>
    `,
    quiz: [
      { q: 'Pré-requisito pra busca binária funcionar:', options: ['a lista estar ordenada', 'a lista ter números pares', 'a lista ser pequena', 'nenhum'], answer: 0 },
      { q: 'Se o alvo é <strong>menor</strong> que o item do meio, a busca continua:', options: ['na metade da direita', 'na metade da esquerda', 'na lista inteira de novo', 'para com -1'], answer: 1 },
      { q: 'Por que ela é <code>O(log n)</code> e não <code>O(n)</code>?', options: ['porque descarta metade dos itens a cada passo', 'porque usa recursão', 'porque a lista é ordenada', 'porque é mais lenta'], answer: 0 },
    ],
  },
  {
    id: 'alg-4',
    unit: 'Fase 4 — Algoritmos clássicos',
    title: 'Ordenar lista',
    type: 'theory',
    xp: 20,
    content: `
      <p>Ordenar = deixar em ordem crescente. O <code>.sort()</code> nativo resolve, mas tem uma pegadinha com números:</p>
      <pre><code>[10, 2, 1].sort()             // [1, 10, 2]  errado! comparou como texto
[10, 2, 1].sort((a, b) => a - b) // [1, 2, 10]  certo, comparador numérico</code></pre>
      <p>Por baixo, algoritmos simples (como bubble sort) comparam pares e trocam quando estão fora de ordem.</p>
    `,
    quiz: [
      { q: 'Por que <code>[10, 2, 1].sort()</code> devolve <code>[1, 10, 2]</code>?', options: ['bug do JavaScript', 'sem comparador, o sort ordena como texto', 'a lista está corrompida', 'sort() não funciona com números'], answer: 1 },
      { q: 'Qual ordena números corretamente em ordem crescente?', options: ['lista.sort()', 'lista.sort((a, b) => a - b)', 'lista.order()', 'lista.sort((a, b) => b - a)'], answer: 1 },
      { q: 'A ideia central do bubble sort é:', options: ['comparar vizinhos e trocar quando fora de ordem', 'dividir a lista pela metade', 'usar recursão sempre', 'remover duplicados'], answer: 0 },
    ],
  },
  {
    id: 'alg-5',
    unit: 'Fase 4 — Algoritmos clássicos',
    title: 'Sort nativo vs implementar',
    type: 'theory',
    xp: 15,
    content: `
      <p>No dia a dia, você vai usar <code>lista.sort()</code> — não precisa reimplementar ordenação em código de produção.</p>
      <p>Mas entender <strong>como</strong> funciona por dentro ajuda a:</p>
      <ul>
        <li>Debugar quando o resultado vem na ordem errada (ex: <code>sort()</code> em números pode comparar como texto, e <code>[10,2,1]</code> virar <code>[1,10,2]</code> sem um comparador)</li>
        <li>Entender por que algumas operações ficam lentas com listas grandes</li>
        <li>Responder perguntas técnicas em entrevistas</li>
      </ul>
    `,
    quiz: [
      { q: 'Em código de produção, o normal é:', options: ['sempre reimplementar sua própria ordenação', 'usar o sort() nativo da linguagem', 'evitar ordenar listas'], answer: 1 },
      { q: 'Por que <code>[10,2,1].sort()</code> pode dar resultado inesperado em alguns casos?', options: ['sort() às vezes compara como texto, não como número, sem um comparador', 'sort() está com bug', 'listas não podem ser ordenadas'], answer: 0 },
      { q: 'Entender o algoritmo por trás do sort serve principalmente pra:', options: ['nunca usar sort()', 'debugar, entender performance e entrevistas', 'decorar código'], answer: 1 },
    ],
  },

  {
    id: 'x4-1',
    unit: 'Fase 4 — Algoritmos clássicos',
    title: 'Busca binária: passo a passo',
    type: 'theory',
    xp: 20,
    content: `
      <p>Vamos rastrear a busca de <code>alvo = 7</code> em <code>[1, 3, 5, 7, 9]</code> (índices 0 a 4):</p>
      <pre><code>lo=0, hi=4 → meio=2 → lista[2]=5; 7 &gt; 5 → vai pra direita (lo=3)
lo=3, hi=4 → meio=3 → lista[3]=7; achou! → retorna 3</code></pre>
      <p>A cada passo, metade dos candidatos é descartada.</p>
    `,
    quiz: [
      { q: 'No primeiro passo, qual é o índice do meio (lo=0, hi=4)?', options: ['2', '1', '3', '4'], answer: 0 },
      { q: 'Como o alvo 7 é maior que <code>lista[2]=5</code>, o que acontece?', options: ['descarta a metade esquerda (lo vira 3)', 'descarta a metade direita (hi vira 1)', 'retorna -1', 'recomeça do zero'], answer: 0 },
      { q: 'Buscar em uma lista de 1000 itens ordenados leva cerca de quantos passos?', options: ['~10 (log₂ de 1000)', '~1000', '~500', '~1'], answer: 0 },
    ],
  },
  {
    id: 'x4-2',
    unit: 'Fase 4 — Algoritmos clássicos',
    title: 'Bubble sort',
    type: 'theory',
    xp: 20,
    content: `
      <p>O <strong>bubble sort</strong> compara pares vizinhos e troca quando estão fora de ordem, repetindo até ninguém trocar mais:</p>
      <pre><code>for (let i = 0; i &lt; lista.length; i++) {
  for (let j = 0; j &lt; lista.length - 1; j++) {
    if (lista[j] &gt; lista[j + 1]) {
      let tmp = lista[j];
      lista[j] = lista[j + 1];
      lista[j + 1] = tmp;        // troca os dois
    }
  }
}</code></pre>
    `,
    quiz: [
      { q: 'Quando o bubble sort troca dois vizinhos?', options: ['quando o da esquerda é maior que o da direita', 'sempre', 'quando são iguais', 'nunca'], answer: 0 },
      { q: 'Pra que serve a variável <code>tmp</code> na troca?', options: ['guardar um valor enquanto sobrescreve o outro, sem perder', 'contar as trocas', 'acelerar o loop', 'nada, é opcional'], answer: 0 },
      { q: 'Por que bubble sort é considerado <code>O(n²)</code>?', options: ['tem um loop dentro de outro percorrendo a lista', 'usa recursão', 'troca elementos', 'é rápido demais'], answer: 0 },
    ],
  },
  {
    id: 'x4-3',
    unit: 'Fase 4 — Algoritmos clássicos',
    title: 'Entendendo Big O',
    type: 'theory',
    xp: 15,
    content: `
      <p><strong>Big O</strong> descreve como o trabalho cresce conforme a entrada cresce.</p>
      <ul>
        <li><strong>O(1)</strong>: constante — acessar <code>lista[0]</code>.</li>
        <li><strong>O(n)</strong>: linear — um loop simples na lista.</li>
        <li><strong>O(n²)</strong>: loop dentro de loop (ex: bubble sort).</li>
        <li><strong>O(log n)</strong>: corta pela metade — busca binária.</li>
      </ul>
      <p>Pra 1000 itens, O(n) faz ~1000 passos; O(n²) faz ~1.000.000.</p>
    `,
    quiz: [
      { q: 'Busca binária é qual complexidade?', options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'], answer: 2 },
      { q: 'Dois loops aninhados na mesma lista costumam ser:', options: ['O(1)', 'O(n)', 'O(n²)', 'O(log n)'], answer: 2 },
      { q: 'Acessar <code>lista[5]</code> direto é:', options: ['O(1)', 'O(n)', 'O(n²)', 'O(log n)'], answer: 0 },
    ],
  },
  {
    id: 'x4-4',
    unit: 'Fase 4 — Algoritmos clássicos',
    title: 'Dois números que somam o alvo',
    type: 'fill',
    xp: 20,
    content: `
      <p>Clássico de entrevista: dois loops testam cada par (j começa em <code>i + 1</code> pra não repetir o mesmo elemento). Complete o valor com que a soma do par é comparada.</p>
    `,
    fillCode: `function somaPar(lista, alvo) {
  for (let i = 0; i < lista.length; i++) {
    for (let j = i + 1; j < lista.length; j++) {
      if (lista[i] + lista[j] === ◻) return true;
    }
  }
  return false;
}`,
    fillBlanks: [{ accept: ['alvo'] }],
    fillHint: 'O valor que o par precisa somar.',
  },
  {
    id: 'x4-5',
    unit: 'Fase 4 — Algoritmos clássicos',
    title: 'Mínimo e máximo numa passada',
    type: 'fill',
    xp: 20,
    content: `
      <p>Num único loop guardamos o menor e o maior ao mesmo tempo, e devolvemos <code>[min, max]</code>. Complete o segundo item do array retornado.</p>
    `,
    fillCode: `function minMax(lista) {
  let min = lista[0];
  let max = lista[0];
  for (let i = 1; i < lista.length; i++) {
    if (lista[i] < min) min = lista[i];
    if (lista[i] > max) max = lista[i];
  }
  return [min, ◻];
}`,
    fillBlanks: [{ accept: ['max'] }],
    fillHint: 'O maior valor encontrado.',
  },

  // ===== FASE 5 — SQL e modelagem =====
  {
    id: 'm3-1',
    unit: 'Fase 5 — SQL e modelagem',
    title: 'SQL básico',
    type: 'theory',
    xp: 15,
    content: `
      <p>SQL é a linguagem pra consultar bancos de dados. Principais comandos:</p>
      <ul>
        <li><code>SELECT coluna FROM tabela</code> → escolhe quais colunas trazer</li>
        <li><code>WHERE condição</code> → filtra linhas</li>
        <li><code>JOIN</code> → combina dados de duas tabelas relacionadas</li>
        <li><code>GROUP BY</code> → agrupa linhas pra somar/contar por grupo</li>
        <li><code>ORDER BY</code> → ordena o resultado</li>
      </ul>
    `,
    quiz: [
      { q: '<code>SELECT nome FROM clientes WHERE idade &gt; 18;</code> retorna:', options: ['todas as colunas dos clientes maiores de 18', 'só a coluna nome dos clientes maiores de 18', 'a quantidade de clientes maiores de 18'], answer: 1 },
      { q: 'Pra trazer dados de duas tabelas relacionadas (ex: pedidos e clientes) numa só consulta, usa-se:', options: ['WHERE', 'JOIN', 'ORDER BY'], answer: 1 },
      { q: '<code>GROUP BY</code> serve pra:', options: ['ordenar resultados', 'filtrar linhas', 'agrupar linhas pra somar/contar por grupo'], answer: 2 },
    ],
  },
  {
    id: 'm3-2',
    unit: 'Fase 5 — SQL e modelagem',
    title: 'Escrever queries na mão',
    type: 'checklist',
    xp: 10,
    content: `
      <p>Pega um projeto seu (Gontijo ou Codexy) com banco de dados. Sem IA, escreve:</p>
      <ol>
        <li>1 <code>SELECT</code> simples com <code>WHERE</code></li>
        <li>1 consulta com <code>JOIN</code> entre duas tabelas</li>
        <li>1 consulta com <code>GROUP BY</code> (ex: contar pedidos por cliente)</li>
        <li>1 consulta com <code>ORDER BY</code></li>
      </ol>
      <p>Depois roda no banco pra ver se funciona. Marca como concluído quando tiver as 4.</p>
    `,
  },
  {
    id: 'm3-3',
    unit: 'Fase 5 — SQL e modelagem',
    title: 'Modelar schema do zero',
    type: 'checklist',
    xp: 10,
    content: `
      <p>Sem IA, desenha (papel ou diagrama simples) um schema com 3 tabelas relacionadas, ex: <code>clientes</code>, <code>pedidos</code>, <code>produtos</code>.</p>
      <p>Defina: colunas de cada tabela, chave primária (PK) e chaves estrangeiras (FK) que conectam as tabelas.</p>
    `,
  },
  {
    id: 'm3-4',
    unit: 'Fase 5 — SQL e modelagem',
    title: 'Relacionamentos entre tabelas',
    type: 'theory',
    xp: 15,
    content: `
      <p>Tabelas se relacionam de formas diferentes:</p>
      <ul>
        <li><strong>1:1</strong> (um pra um): cada linha de A corresponde a no máximo 1 linha de B. Ex: <code>usuario</code> ↔ <code>perfil</code></li>
        <li><strong>1:N</strong> (um pra muitos): 1 linha de A se relaciona com várias de B. Ex: 1 <code>cliente</code> tem vários <code>pedidos</code></li>
        <li><strong>N:N</strong> (muitos pra muitos): várias linhas de A se relacionam com várias de B, geralmente via uma tabela intermediária. Ex: <code>produtos</code> ↔ <code>pedidos</code></li>
      </ul>
    `,
    quiz: [
      { q: '1 cliente que faz vários pedidos é um relacionamento:', options: ['1:1', '1:N', 'N:N'], answer: 1 },
      { q: 'Produtos que aparecem em vários pedidos, e pedidos com vários produtos, é um relacionamento:', options: ['1:1', '1:N', 'N:N'], answer: 2 },
      { q: 'Relacionamento N:N geralmente precisa de:', options: ['uma tabela intermediária ligando as duas tabelas', 'nada especial, só uma FK', 'duas colunas na mesma tabela'], answer: 0 },
    ],
  },
  {
    id: 'm3-5',
    unit: 'Fase 5 — SQL e modelagem',
    title: 'Índices e performance',
    type: 'theory',
    xp: 15,
    content: `
      <p>Um <strong>índice</strong> é uma estrutura que o banco mantém pra encontrar linhas mais rápido — parecido com o índice de um livro: em vez de ler página por página, você vai direto onde precisa.</p>
      <p>Colunas usadas com frequência em <code>WHERE</code>, <code>JOIN</code> ou <code>ORDER BY</code> são boas candidatas a índice. Chaves primárias já têm índice automático.</p>
      <p>Trade-off: índice acelera leitura, mas deixa escrita (<code>INSERT/UPDATE</code>) um pouco mais lenta — não dá pra indexar tudo.</p>
    `,
    quiz: [
      { q: 'Um índice serve principalmente pra:', options: ['deixar o banco mais bonito', 'encontrar linhas mais rápido em buscas/filtros', 'apagar dados antigos automaticamente'], answer: 1 },
      { q: 'Colunas usadas em <code>WHERE</code> ou <code>JOIN</code> com frequência são:', options: ['más candidatas a índice', 'boas candidatas a índice', 'irrelevantes pra índice'], answer: 1 },
      { q: 'Qual o trade-off de ter muitos índices?', options: ['nenhum, sempre vale colocar índice em tudo', 'escrita (INSERT/UPDATE) fica mais lenta', 'o banco para de funcionar'], answer: 1 },
    ],
  },
  {
    id: 'm3-6',
    unit: 'Fase 5 — SQL e modelagem',
    title: 'Query com subquery',
    type: 'checklist',
    xp: 10,
    content: `
      <p>Uma <strong>subquery</strong> é uma consulta dentro de outra. Ex: "clientes que fizeram pelo menos 1 pedido" pode usar <code>WHERE id IN (SELECT cliente_id FROM pedidos)</code>.</p>
      <p>Sem IA, escreva 1 query com subquery usando dados de um projeto seu (ou um exemplo hipotético com clientes/pedidos). Roda e confere o resultado.</p>
    `,
  },
  {
    id: 'm3-7',
    unit: 'Fase 5 — SQL e modelagem',
    title: 'Normalização básica',
    type: 'checklist',
    xp: 10,
    content: `
      <p>Normalização organiza tabelas pra evitar dados repetidos/inconsistentes. Ideia central das 3 primeiras formas normais:</p>
      <ul>
        <li><strong>1NF</strong>: cada coluna tem um valor só (sem listas dentro de uma célula)</li>
        <li><strong>2NF</strong>: sem dados que dependem só de parte da chave (em tabelas com chave composta)</li>
        <li><strong>3NF</strong>: sem coluna que depende de outra coluna que não é chave</li>
      </ul>
      <p>Pega o schema que você modelou na Fase 5 (cliente-pedido-produto) e verifica se ele respeita essas 3 regras. Ajusta se precisar.</p>
    `,
  },

  // ===== FASE 6 — Debug e leitura de código IA =====
  {
    id: 'm4-1',
    unit: 'Fase 6 — Debug e leitura de código IA',
    title: 'Tipos de erro e debug',
    type: 'theory',
    xp: 15,
    content: `
      <p>Tipos de erro mais comuns:</p>
      <ul>
        <li><strong>Erro de sintaxe</strong>: código escrito errado (faltou <code>)</code>, <code>;</code> etc) — o programa nem roda</li>
        <li><strong>Erro de execução</strong>: o código roda mas quebra no meio, ex: "undefined is not a function"</li>
        <li><strong>Erro de lógica</strong>: o código roda sem erro, mas o resultado está errado</li>
      </ul>
      <p>O <strong>stack trace</strong> mostra onde o erro aconteceu — leia de cima pra baixo; a primeira linha geralmente aponta o arquivo/linha do problema.</p>
    `,
    quiz: [
      { q: 'Um código que roda sem mensagem de erro mas devolve resultado errado tem erro de:', options: ['sintaxe', 'lógica', 'rede'], answer: 1 },
      { q: 'Esquecer um parênteses de fechamento causa erro de:', options: ['sintaxe', 'lógica', 'lógica de negócio'], answer: 0 },
      { q: 'No stack trace, o que geralmente indica onde o problema começou?', options: ['a última linha', 'a primeira linha', 'o nome do arquivo CSS'], answer: 1 },
    ],
  },
  {
    id: 'm4-2',
    unit: 'Fase 6 — Debug e leitura de código IA',
    title: 'Explicar código gerado por IA',
    type: 'checklist',
    xp: 10,
    content: `
      <p>Pega um trecho de código (função/componente) que IA gerou num projeto seu. Sem perguntar pra IA, escreva uma explicação linha a linha do que cada parte faz.</p>
      <p>Se travar numa linha, anota a dúvida — é aí que está o gap a estudar.</p>
    `,
  },
  {
    id: 'm4-3',
    unit: 'Fase 6 — Debug e leitura de código IA',
    title: 'Code kata sem IA',
    type: 'checklist',
    xp: 10,
    content: `
      <p>Escolhe um problema pequeno (ex: "verificar se uma palavra é palíndromo"). Resolve sozinho, sem IA.</p>
      <p>Depois pede pra IA resolver o mesmo problema e compara as duas soluções: o que é diferente? o que você não tinha pensado?</p>
    `,
  },
  {
    id: 'm4-4',
    unit: 'Fase 6 — Debug e leitura de código IA',
    title: 'Ler diffs de código',
    type: 'theory',
    xp: 15,
    content: `
      <p>Um <strong>diff</strong> mostra o que mudou entre duas versões de um arquivo: linhas removidas (geralmente <code>-</code>) e linhas adicionadas (<code>+</code>).</p>
      <pre><code>- function soma(a, b) {
-   return a + b;
+ function soma(a, b, c = 0) {
+   return a + b + c;
}</code></pre>
      <p>Quando IA edita seu código, sempre olhe o diff antes de aceitar: o que exatamente mudou, e isso faz sentido pro que você pediu?</p>
    `,
    quiz: [
      { q: 'No diff do exemplo, o que mudou na assinatura da função?', options: ['nada mudou', 'foi adicionado um parâmetro c com valor padrão 0', 'a função foi removida'], answer: 1 },
      { q: 'Por que olhar o diff antes de aceitar uma mudança de IA?', options: ['pra perder tempo', 'pra confirmar que a mudança é só o que você pediu, sem efeitos colaterais', 'não é necessário, IA nunca erra'], answer: 1 },
      { q: 'Linhas com <code>-</code> num diff geralmente significam:', options: ['linhas adicionadas', 'linhas removidas', 'comentários'], answer: 1 },
    ],
  },
  {
    id: 'm4-5',
    unit: 'Fase 6 — Debug e leitura de código IA',
    title: 'Refatorar função feia',
    type: 'checklist',
    xp: 10,
    content: `
      <p>Pega uma função sua (ou gerada por IA) que está "feia" — nome ruim, muito longa, lógica confusa, repetição. Sem pedir pra IA fazer, refatore você mesmo: renomeie variáveis, quebre em funções menores, simplifique condições.</p>
      <p>Se o projeto tiver testes, roda antes e depois pra confirmar que o comportamento não mudou.</p>
    `,
  },

  {
    id: 'x6-1',
    unit: 'Fase 6 — Debug e leitura de código IA',
    title: 'Ler a mensagem de erro',
    type: 'theory',
    xp: 15,
    content: `
      <p>A mensagem de erro quase sempre diz <strong>o quê</strong> e <strong>onde</strong>. Leia de cima pra baixo:</p>
      <pre><code>TypeError: Cannot read properties of
undefined (reading 'nome')
    at perfil (app.js:42)</code></pre>
      <ul>
        <li><strong>Tipo</strong>: <code>TypeError</code></li>
        <li><strong>Causa</strong>: algo é <code>undefined</code> e você tentou ler <code>.nome</code></li>
        <li><strong>Local</strong>: <code>app.js</code> linha 42</li>
      </ul>
      <p>Antes de pedir pra IA, leia: metade dos bugs se resolve só entendendo a mensagem.</p>
    `,
    quiz: [
      { q: 'No erro acima, qual o provável problema?', options: ['nome está errado', 'o objeto é undefined', 'falta ponto e vírgula', 'app.js não existe'], answer: 1 },
      { q: 'Onde o erro aconteceu?', options: ['linha 1', 'app.js linha 42', 'na IA', 'no navegador'], answer: 1 },
      { q: 'Melhor primeiro passo ao ver um erro:', options: ['pedir pra IA reescrever tudo', 'ler a mensagem com atenção', 'apagar o arquivo', 'ignorar'], answer: 1 },
    ],
  },
  {
    id: 'x6-2',
    unit: 'Fase 6 — Debug e leitura de código IA',
    title: 'Conserte o off-by-one',
    type: 'fill',
    xp: 20,
    content: `
      <p>Esse código deveria somar de 1 até n <strong>inclusive</strong>, mas o operador <code>&lt;</code> faz parar cedo demais (clássico bug "off-by-one"). Complete o operador certo na condição do loop.</p>
    `,
    fillCode: `function somaAteN(n) {
  let total = 0;
  for (let i = 1; i ◻ n; i++) {
    total += i;
  }
  return total;
}`,
    fillBlanks: [{ accept: ['<='] }],
    fillHint: 'Pra incluir o próprio n, use "menor ou igual".',
  },
  {
    id: 'x6-3',
    unit: 'Fase 6 — Debug e leitura de código IA',
    title: '== vs === (a pegadinha)',
    type: 'theory',
    xp: 15,
    content: `
      <p><code>==</code> converte tipos antes de comparar (gera bugs silenciosos). <code>===</code> compara valor <strong>e</strong> tipo.</p>
      <pre><code>0 == ''      // true  (!!)
0 === ''     // false
'5' == 5     // true  (!!)
'5' === 5    // false</code></pre>
      <p>Regra: use <strong>sempre <code>===</code></strong>. Muito bug "que a IA escreveu e funcionou às vezes" é <code>==</code>.</p>
    `,
    quiz: [
      { q: 'Quanto dá <code>"5" === 5</code>?', options: ['true', 'false', 'erro', 'undefined'], answer: 1 },
      { q: 'Qual comparação devo usar por padrão?', options: ['==', '===', 'os dois', 'tanto faz'], answer: 1 },
      { q: '<code>0 == ""</code> retorna:', options: ['false', 'true', 'erro', 'NaN'], answer: 1 },
    ],
  },
  {
    id: 'x6-4',
    unit: 'Fase 6 — Debug e leitura de código IA',
    title: 'Conserte o acesso a undefined',
    type: 'fill',
    xp: 20,
    content: `
      <p><code>users[0].nome</code> quebra quando a lista está <strong>vazia</strong>. Adicionamos uma "guarda" antes. Complete o valor retornado quando não há ninguém.</p>
    `,
    fillCode: `function primeiroNome(users) {
  if (users.length === 0) return ◻;
  return users[0].nome;
}`,
    fillBlanks: [{ accept: ["'ninguém'", '"ninguém"'] }],
    fillHint: 'O texto ninguém entre aspas.',
  },
  {
    id: 'x6-5',
    unit: 'Fase 6 — Debug e leitura de código IA',
    title: 'Revisar código gerado por IA',
    type: 'checklist',
    xp: 10,
    content: `
      <p>Pegue um trecho que a IA gerou pra você (Codexy ou Gontijo). Sem pedir pra IA explicar, responda por escrito:</p>
      <ol>
        <li>O que cada função <strong>recebe</strong> e o que <strong>retorna</strong>?</li>
        <li>Tem algum caso não tratado (lista vazia, <code>null</code>, erro de rede)?</li>
        <li>Tem <code>==</code> onde deveria ser <code>===</code>?</li>
        <li>Você conseguiria reescrever 1 função do zero, sem a IA?</li>
      </ol>
      <p>Marque como concluído quando responder as 4. Isso treina <strong>ler</strong>, não só gerar.</p>
    `,
  },

  // ===== FASE 7 — Testes automatizados =====
  {
    id: 'm5-1',
    unit: 'Fase 7 — Testes automatizados',
    title: 'O que é teste automatizado',
    type: 'theory',
    xp: 15,
    content: `
      <p>Um <strong>teste unitário</strong> é código que verifica se outro código (uma função) está funcionando certo, automaticamente.</p>
      <pre><code>// função
function dobro(n) { return n * 2; }

// teste
test("dobro de 4 é 8", () => {
  expect(dobro(4)).toBe(8);
});</code></pre>
      <p><code>expect(...).toBe(...)</code> é uma <strong>asserção</strong>: afirma o que o resultado deveria ser. Se for diferente, o teste falha e avisa.</p>
    `,
    quiz: [
      { q: 'O que <code>expect(dobro(4)).toBe(8)</code> faz?', options: ['imprime 8 na tela', 'afirma que dobro(4) deve ser igual a 8, e falha se não for', 'define dobro como 8'], answer: 1 },
      { q: 'Qual a maior vantagem de ter testes automatizados?', options: ['o código fica mais bonito', 'detectar quando uma mudança quebra algo que funcionava', 'o código roda mais rápido'], answer: 1 },
      { q: 'Testes automatizados substituem a necessidade de entender o código?', options: ['sim, totalmente', 'não — ajudam a verificar, mas você ainda precisa entender a lógica'], answer: 1 },
    ],
  },
  {
    id: 'm5-2',
    unit: 'Fase 7 — Testes automatizados',
    title: 'Escrever 1 teste',
    type: 'checklist',
    xp: 10,
    content: `
      <p>Escolhe 1 função simples de um projeto seu (ou uma das que você escreveu nessa trilha, como <code>soma</code>).</p>
      <p>Escreva, sem pedir pra IA gerar, um teste unitário pra ela usando o framework do seu projeto (Jest, Vitest etc).</p>
    `,
  },
  {
    id: 'm5-3',
    unit: 'Fase 7 — Testes automatizados',
    title: 'Rodar suite existente',
    type: 'checklist',
    xp: 10,
    content: `
      <p>Se algum projeto seu já tem testes, roda a suite (<code>npm test</code> ou equivalente) e leia pelo menos 3 testes existentes.</p>
      <p>Pra cada um, escreva em 1 frase o que ele está verificando.</p>
    `,
  },
  {
    id: 'm5-4',
    unit: 'Fase 7 — Testes automatizados',
    title: 'Tipos de teste',
    type: 'theory',
    xp: 15,
    content: `
      <p>Existem níveis diferentes de teste automatizado:</p>
      <ul>
        <li><strong>Unitário</strong>: testa 1 função/peça isolada (ex: <code>soma([1,2,3])</code> retorna 6)</li>
        <li><strong>Integração</strong>: testa várias peças funcionando juntas (ex: API + banco de dados)</li>
        <li><strong>End-to-end (E2E)</strong>: testa o sistema inteiro como o usuário usaria (ex: abrir o site, clicar em botões)</li>
      </ul>
      <p>Regra geral: muitos testes unitários (rápidos e baratos), menos de integração, poucos E2E (lentos e caros).</p>
    `,
    quiz: [
      { q: 'Testar se <code>soma([1,2,3])</code> retorna 6 é um teste:', options: ['unitário', 'de integração', 'end-to-end'], answer: 0 },
      { q: 'Testar o sistema inteiro abrindo o navegador e clicando em botões é:', options: ['unitário', 'end-to-end (E2E)', 'não é teste'], answer: 1 },
      { q: 'Qual tipo de teste costuma ser mais rápido e barato de manter?', options: ['unitário', 'end-to-end', 'nenhum, todos custam igual'], answer: 0 },
    ],
  },
  {
    id: 'm5-5',
    unit: 'Fase 7 — Testes automatizados',
    title: 'Média (pensando em edge cases)',
    type: 'fill',
    xp: 20,
    content: `
      <p>O <strong>caso de borda</strong> aqui é a lista vazia: dividir por zero dá problema, então tratamos antes. Complete o tamanho que dispara o retorno antecipado.</p>
    `,
    fillCode: `function media(lista) {
  if (lista.length === ◻) return 0;
  let total = 0;
  for (let i = 0; i < lista.length; i++) total += lista[i];
  return total / lista.length;
}`,
    fillBlanks: [{ accept: ['0'] }],
    fillHint: 'Tamanho de uma lista vazia.',
  },

  {
    id: 'x7-1',
    unit: 'Fase 7 — Testes automatizados',
    title: 'Arrange, Act, Assert',
    type: 'theory',
    xp: 15,
    content: `
      <p>Um bom teste tem 3 partes (padrão <strong>AAA</strong>):</p>
      <ul>
        <li><strong>Arrange</strong>: prepara os dados de entrada.</li>
        <li><strong>Act</strong>: chama a função que está sendo testada.</li>
        <li><strong>Assert</strong>: verifica se o resultado é o esperado.</li>
      </ul>
      <pre><code>const lista = [1, 2, 3];        // arrange
const r = soma(lista);          // act
expect(r).toBe(6);              // assert</code></pre>
    `,
    quiz: [
      { q: 'Em qual etapa você chama a função testada?', options: ['Arrange', 'Act', 'Assert', 'nenhuma'], answer: 1 },
      { q: 'Verificar o resultado esperado é o:', options: ['Arrange', 'Act', 'Assert', 'Setup'], answer: 2 },
      { q: 'Preparar os dados de entrada é o:', options: ['Arrange', 'Act', 'Assert', 'Run'], answer: 0 },
    ],
  },
  {
    id: 'x7-2',
    unit: 'Fase 7 — Testes automatizados',
    title: 'Casos de borda',
    type: 'theory',
    xp: 15,
    content: `
      <p>O "caminho feliz" quase sempre passa. Bugs moram nos <strong>casos de borda</strong>:</p>
      <ul>
        <li>Lista <strong>vazia</strong> <code>[]</code></li>
        <li><strong>Um</strong> único item</li>
        <li>Valores <strong>negativos</strong> ou <strong>zero</strong></li>
        <li><code>null</code> / <code>undefined</code></li>
        <li>Valores <strong>repetidos</strong></li>
      </ul>
      <p>Pra cada função, pergunte: "o que acontece se a entrada for vazia ou estranha?"</p>
    `,
    quiz: [
      { q: 'Qual destes é um caso de borda clássico?', options: ['lista com 3 itens normais', 'lista vazia', 'lista com nomes', 'lista ordenada'], answer: 1 },
      { q: 'Por que testar casos de borda?', options: ['é onde bugs se escondem', 'pra demorar mais', 'não precisa', 'só por enfeite'], answer: 0 },
      { q: 'Um valor de borda comum em números é:', options: ['100', 'zero', '7', '42'], answer: 1 },
    ],
  },
  {
    id: 'x7-3',
    unit: 'Fase 7 — Testes automatizados',
    title: 'Implemente pra passar nos testes',
    type: 'fill',
    xp: 20,
    content: `
      <p>Invertemos a string e comparamos com a original (string vazia conta como palíndromo). Complete a comparação final.</p>
    `,
    fillCode: `function ehPalindromo(s) {
  let invertido = '';
  for (let i = s.length - 1; i >= 0; i--) invertido += s[i];
  return s ◻ invertido;
}`,
    fillBlanks: [{ accept: ['===', '=='] }],
    fillHint: 'Igualdade estrita entre original e invertido.',
  },
  {
    id: 'x7-4',
    unit: 'Fase 7 — Testes automatizados',
    title: 'Conserte a validação de email',
    type: 'fill',
    xp: 20,
    content: `
      <p>Um email válido precisa de algo antes do <code>@</code>, algo entre <code>@</code> e <code>.</code>, e o ponto <strong>não</strong> pode ser o último caractere. Complete a comparação que garante que o ponto não é o último.</p>
    `,
    fillCode: `function emailValido(s) {
  let arroba = s.indexOf('@');
  let ponto = s.lastIndexOf('.');
  return arroba > 0 && ponto > arroba + 1 && ponto ◻ s.length - 1;
}`,
    fillBlanks: [{ accept: ['<'] }],
    fillHint: 'O ponto tem que vir antes da última posição.',
  },
  {
    id: 'x7-5',
    unit: 'Fase 7 — Testes automatizados',
    title: 'Escrever testes de uma função sua',
    type: 'checklist',
    xp: 10,
    content: `
      <p>Pegue uma função de um projeto seu (Codexy/Gontijo). Sem IA, escreva no papel ou em comentário:</p>
      <ol>
        <li>1 teste do <strong>caminho feliz</strong> (entrada normal).</li>
        <li>1 teste de <strong>caso de borda</strong> (vazio, zero, null...).</li>
        <li>1 teste de entrada <strong>inválida</strong> (o que deveria acontecer?).</li>
      </ol>
      <p>Para cada um: entrada → saída esperada. Marque concluído quando tiver os 3.</p>
    `,
  },

  // ===== FASE 8 — Arquitetura e segurança =====
  {
    id: 'm6-1',
    unit: 'Fase 8 — Arquitetura e segurança',
    title: 'Camadas e API',
    type: 'theory',
    xp: 15,
    content: `
      <p>Sistemas web costumam ter camadas:</p>
      <ul>
        <li><strong>Frontend</strong>: interface que o usuário vê (navegador)</li>
        <li><strong>Backend/API</strong>: recebe pedidos, aplica regras de negócio</li>
        <li><strong>Banco de dados</strong>: guarda os dados</li>
      </ul>
      <p>O frontend fala com o backend através de uma <strong>API</strong> (geralmente HTTP: GET, POST etc), e o backend fala com o banco.</p>
    `,
    quiz: [
      { q: 'Quem normalmente acessa o banco de dados diretamente?', options: ['o frontend', 'o backend', 'o navegador do usuário'], answer: 1 },
      { q: 'Uma API é:', options: ['um tipo de banco de dados', 'a forma como frontend e backend se comunicam', 'um framework de CSS'], answer: 1 },
      { q: 'Por que separar em camadas (frontend/backend/banco)?', options: ['porque é tradição', 'facilita organizar responsabilidades e trocar uma parte sem quebrar as outras', 'pra deixar o código maior'], answer: 1 },
    ],
  },
  {
    id: 'm6-2',
    unit: 'Fase 8 — Arquitetura e segurança',
    title: 'Mapear arquitetura de 1 projeto',
    type: 'checklist',
    xp: 10,
    content: `
      <p>Escolhe 1 projeto seu (Gontijo ou Codexy). Liste: quais camadas existem (frontend, backend, banco, outros serviços), como elas se comunicam, e onde fica cada coisa (pastas/arquivos principais).</p>
    `,
  },
  {
    id: 'm6-3',
    unit: 'Fase 8 — Arquitetura e segurança',
    title: 'Segurança básica (OWASP)',
    type: 'theory',
    xp: 15,
    content: `
      <p>Alguns riscos de segurança comuns:</p>
      <ul>
        <li><strong>SQL Injection</strong>: usuário digita SQL malicioso num campo de formulário, que vai direto pra query sem proteção</li>
        <li><strong>XSS</strong> (Cross-Site Scripting): usuário injeta código (ex: <code>&lt;script&gt;</code>) que é exibido pra outros usuários sem ser tratado</li>
        <li>Defesa básica: nunca confiar em dados do usuário — sempre validar/escapar</li>
      </ul>
    `,
    quiz: [
      { q: 'SQL Injection acontece quando:', options: ['o banco está muito lento', 'entrada do usuário é colocada direto numa query SQL sem proteção', 'o servidor está fora do ar'], answer: 1 },
      { q: 'XSS é um ataque que:', options: ['derruba o servidor', 'injeta código que roda no navegador de outros usuários', 'apaga o banco de dados inteiro'], answer: 1 },
      { q: 'Regra de ouro de segurança com dados de usuário:', options: ['confiar sempre, o usuário sabe o que faz', 'nunca confiar — validar e tratar antes de usar'], answer: 1 },
    ],
  },
  {
    id: 'm6-4',
    unit: 'Fase 8 — Arquitetura e segurança',
    title: 'Revisar 1 projeto',
    type: 'checklist',
    xp: 10,
    content: `
      <p>Revise 1 projeto seu procurando: algum lugar onde dado do usuário vai direto pra uma query SQL (risco de injection) ou é exibido na tela sem tratamento (risco de XSS).</p>
      <p>Anote o que encontrou — mesmo que seja "não encontrei nada óbvio".</p>
    `,
  },
  {
    id: 'm6-5',
    unit: 'Fase 8 — Arquitetura e segurança',
    title: 'Autenticação vs Autorização',
    type: 'theory',
    xp: 15,
    content: `
      <p>Dois conceitos que se confundem:</p>
      <ul>
        <li><strong>Autenticação</strong>: confirmar <em>quem</em> é o usuário (login, senha, token)</li>
        <li><strong>Autorização</strong>: confirmar <em>o que</em> esse usuário tem permissão de fazer (ex: admin vs usuário comum)</li>
      </ul>
      <p>Um usuário pode estar autenticado (logado) mas não autorizado a fazer determinada ação (ex: deletar outro usuário).</p>
    `,
    quiz: [
      { q: 'Confirmar a identidade do usuário (login/senha) é:', options: ['autenticação', 'autorização', 'nenhum dos dois'], answer: 0 },
      { q: 'Verificar se um usuário logado pode acessar uma área de admin é:', options: ['autenticação', 'autorização', 'criptografia'], answer: 1 },
      { q: 'Um usuário pode estar logado (autenticado) e ainda assim:', options: ['ter acesso a tudo automaticamente', 'não ter permissão (autorização) pra certas ações', 'não existir no sistema'], answer: 1 },
    ],
  },
  {
    id: 'm6-6',
    unit: 'Fase 8 — Arquitetura e segurança',
    title: 'Variáveis de ambiente e segredos',
    type: 'theory',
    xp: 15,
    content: `
      <p><strong>Variáveis de ambiente</strong> guardam configurações que variam por ambiente (dev/produção) e <strong>segredos</strong> (senhas de banco, chaves de API) fora do código — geralmente num arquivo <code>.env</code> que <strong>não</strong> vai pro git.</p>
      <pre><code>// .env (não commitado)
DATABASE_URL=postgres://...
API_KEY=abc123

// código
const apiKey = process.env.API_KEY;</code></pre>
      <p>Nunca coloque senha/chave direto escrita no código-fonte — quem tiver acesso ao repositório (ou ao histórico do git) teria acesso ao segredo.</p>
    `,
    quiz: [
      { q: 'Por que segredos (senhas, chaves de API) não devem ficar escritos direto no código?', options: ['porque deixa o código mais lento', 'porque quem acessar o repositório/histórico veria o segredo', 'porque dá erro de sintaxe'], answer: 1 },
      { q: 'Arquivo <code>.env</code> deve:', options: ['ser commitado no git pra todo mundo ver', 'ficar fora do controle de versão (não commitado)', 'ser deletado depois de usar'], answer: 1 },
      { q: '<code>process.env.API_KEY</code> serve pra:', options: ['ler o valor da variável de ambiente API_KEY', 'criar uma nova chave de API', 'apagar a chave'], answer: 0 },
    ],
  },
  {
    id: 'm6-7',
    unit: 'Fase 8 — Arquitetura e segurança',
    title: 'Revisar segredos expostos',
    type: 'checklist',
    xp: 10,
    content: `
      <p>Revise 1 projeto seu: tem alguma senha, token ou chave de API escrita direto no código (não em <code>.env</code>)? O <code>.env</code> está no <code>.gitignore</code> (não vai pro repositório)?</p>
      <p>Se encontrar algo exposto, mova pra variável de ambiente e, se já foi commitado, troque a chave/senha (ela deve ser considerada vazada).</p>
    `,
  },

  {
    id: 'x8-1',
    unit: 'Fase 8 — Arquitetura e segurança',
    title: 'Separação de responsabilidades',
    type: 'theory',
    xp: 15,
    content: `
      <p>Cada parte do código deve ter <strong>um trabalho só</strong>. Misturar tudo numa função vira bola de neve impossível de manter.</p>
      <p>Padrão comum em backend:</p>
      <ul>
        <li><strong>Rota/Controller</strong>: recebe a requisição, responde.</li>
        <li><strong>Serviço</strong>: regra de negócio.</li>
        <li><strong>Repositório/DAO</strong>: fala com o banco.</li>
      </ul>
      <p>Sinal de alerta: uma função que valida, consulta o banco, formata HTML e manda email — tudo junto.</p>
    `,
    quiz: [
      { q: 'Quem deveria falar diretamente com o banco?', options: ['o controller da rota', 'a camada de repositório', 'o componente de UI', 'qualquer um'], answer: 1 },
      { q: 'Uma função que faz 5 coisas diferentes indica:', options: ['bom desempenho', 'falta de separação de responsabilidades', 'código seguro', 'nada'], answer: 1 },
      { q: 'O objetivo de separar em camadas é:', options: ['deixar mais lento', 'facilitar manter e testar', 'usar mais arquivos por enfeite', 'esconder bugs'], answer: 1 },
    ],
  },
  {
    id: 'x8-2',
    unit: 'Fase 8 — Arquitetura e segurança',
    title: 'Nunca confie no input do usuário',
    type: 'theory',
    xp: 15,
    content: `
      <p>Todo dado que vem de fora (formulário, URL, API) pode estar errado ou ser <strong>malicioso</strong>. Sempre <strong>valide no servidor</strong> — validar só no front não protege nada (dá pra burlar).</p>
      <ul>
        <li>Tipo e formato certos? (email é email, número é número)</li>
        <li>Tamanho dentro do limite?</li>
        <li>Em SQL, use <strong>queries parametrizadas</strong> (evita SQL injection) — nunca concatene texto do usuário direto na query.</li>
      </ul>
    `,
    quiz: [
      { q: 'Validar dados só no frontend é suficiente?', options: ['sim', 'não, dá pra burlar — valide no servidor', 'sim se usar React', 'só pra senha'], answer: 1 },
      { q: 'O que evita SQL injection?', options: ['concatenar strings', 'queries parametrizadas', 'confiar no usuário', 'usar GET'], answer: 1 },
      { q: 'Dado vindo do usuário deve ser tratado como:', options: ['sempre confiável', 'potencialmente perigoso', 'irrelevante', 'já validado'], answer: 1 },
    ],
  },
  {
    id: 'x8-3',
    unit: 'Fase 8 — Arquitetura e segurança',
    title: 'Senhas: hash, nunca texto puro',
    type: 'theory',
    xp: 15,
    content: `
      <p>Senha <strong>jamais</strong> é salva como texto puro no banco. Salva-se um <strong>hash</strong> (ex: <code>bcrypt</code>) — uma transformação de via única.</p>
      <pre><code>const hash = await bcrypt.hash(senha, 10);
// no login:
await bcrypt.compare(senhaDigitada, hash); // true/false</code></pre>
      <p>Assim, mesmo se vazar o banco, ninguém lê as senhas. (O TrilhaDev faz exatamente isso.)</p>
    `,
    quiz: [
      { q: 'Como senha deve ser guardada?', options: ['texto puro', 'hash (ex: bcrypt)', 'em maiúsculas', 'na URL'], answer: 1 },
      { q: 'No login, como conferir a senha?', options: ['comparar texto puro', 'bcrypt.compare com o hash', 'olhar no banco', 'perguntar pra IA'], answer: 1 },
      { q: 'Se o banco vazar e as senhas forem hash:', options: ['todas expostas em texto', 'continuam protegidas', 'viram públicas', 'somem'], answer: 1 },
    ],
  },
  {
    id: 'x8-4',
    unit: 'Fase 8 — Arquitetura e segurança',
    title: 'Segredos fora do código',
    type: 'theory',
    xp: 15,
    content: `
      <p>Senhas de banco, chaves de API e tokens <strong>nunca</strong> ficam no código que vai pro Git. Ficam em <strong>variáveis de ambiente</strong> (arquivo <code>.env</code>), que entra no <code>.gitignore</code>.</p>
      <pre><code>// .env (NÃO vai pro git)
DB_PASS=segredo123

// no código:
process.env.DB_PASS</code></pre>
      <p>Se um segredo vazar no Git ou num chat, considere-o <strong>comprometido</strong> e troque.</p>
    `,
    quiz: [
      { q: 'Onde guardar a senha do banco?', options: ['no código', 'numa variável de ambiente (.env)', 'num comentário', 'no README'], answer: 1 },
      { q: 'O <code>.env</code> deve estar no:', options: ['git, commitado', '.gitignore (fora do git)', 'README', 'frontend'], answer: 1 },
      { q: 'Se uma chave de API vazou num chat, você deve:', options: ['ignorar', 'trocá-la (está comprometida)', 'commitar', 'nada'], answer: 1 },
    ],
  },
  {
    id: 'x8-5',
    unit: 'Fase 8 — Arquitetura e segurança',
    title: 'Auditoria de segurança de um projeto',
    type: 'checklist',
    xp: 10,
    content: `
      <p>Pegue um projeto seu (Codexy/Gontijo) e revise sem IA:</p>
      <ol>
        <li>Tem alguma <strong>senha/chave hardcoded</strong> no código? (move pro <code>.env</code>)</li>
        <li>O <code>.env</code> está no <code>.gitignore</code>?</li>
        <li>Input do usuário é <strong>validado no servidor</strong>?</li>
        <li>Senhas estão com <strong>hash</strong>?</li>
        <li>A API usa <strong>HTTPS</strong>?</li>
      </ol>
      <p>Anote o que falhou e o plano de correção. Marque concluído quando revisar os 5.</p>
    `,
  },

  // ===== FASE 9 — APIs REST e HTTP =====
  {
    id: 'api-1',
    unit: 'Fase 9 — APIs REST e HTTP',
    title: 'HTTP: verbos e status codes',
    type: 'theory',
    xp: 15,
    content: `
      <p><strong>HTTP</strong> é o protocolo de comunicação da web. Cada requisição tem um <strong>verbo</strong> que diz o que você quer fazer:</p>
      <ul>
        <li><strong>GET</strong> — buscar dados (sem alterar nada)</li>
        <li><strong>POST</strong> — criar algo novo (envia dados no corpo)</li>
        <li><strong>PUT/PATCH</strong> — atualizar (PUT troca tudo, PATCH atualiza parte)</li>
        <li><strong>DELETE</strong> — remover</li>
      </ul>
      <p>A resposta sempre vem com um <strong>status code</strong>:</p>
      <ul>
        <li><strong>2xx</strong> — sucesso (200 OK, 201 Created, 204 No Content)</li>
        <li><strong>4xx</strong> — erro do cliente (400 Bad Request, 401 Unauthorized, 404 Not Found)</li>
        <li><strong>5xx</strong> — erro do servidor (500 Internal Server Error)</li>
      </ul>
      <pre><code>// Exemplo de fetch GET
fetch('https://api.exemplo.com/usuarios')
  .then(res =&gt; res.json())
  .then(dados =&gt; console.log(dados));</code></pre>
    `,
    quiz: [
      { q: 'Qual verbo HTTP usar para buscar a lista de pedidos sem alterar nada?', options: ['POST', 'DELETE', 'GET', 'PUT'], answer: 2 },
      { q: 'Status 404 significa:', options: ['sucesso', 'erro no servidor', 'recurso não encontrado', 'sem autorização'], answer: 2 },
      { q: 'Qual a diferença principal entre PUT e PATCH?', options: ['não há diferença', 'PUT troca o recurso inteiro, PATCH atualiza só parte', 'PATCH cria, PUT atualiza'], answer: 1 },
    ],
  },
  {
    id: 'api-2',
    unit: 'Fase 9 — APIs REST e HTTP',
    title: 'REST: recursos e endpoints',
    type: 'theory',
    xp: 15,
    content: `
      <p><strong>REST</strong> é uma convenção pra organizar endpoints de API. A ideia central: URL representa um <strong>recurso</strong>, verbo HTTP representa a <strong>ação</strong>.</p>
      <pre><code>GET    /usuarios          → lista todos usuários
GET    /usuarios/42        → busca usuário id=42
POST   /usuarios          → cria novo usuário
PUT    /usuarios/42        → atualiza usuário id=42
DELETE /usuarios/42        → remove usuário id=42</code></pre>
      <p>Boas práticas:</p>
      <ul>
        <li>Use substantivos no plural (<code>/pedidos</code>, não <code>/getPedidos</code>)</li>
        <li>Não coloque o verbo na URL — o verbo HTTP já faz isso</li>
        <li>Aninhe quando faz sentido: <code>/usuarios/42/pedidos</code> = pedidos do usuário 42</li>
      </ul>
    `,
    quiz: [
      { q: 'Endpoint correto para buscar pedidos do usuário 7:', options: ['/getPedidosDoUsuario7', '/usuarios/7/pedidos', '/pedidos?action=get&userId=7'], answer: 1 },
      { q: 'Por que não colocar o verbo na URL (ex: /criarUsuario)?', options: ['porque fica mais longo', 'porque o verbo HTTP (POST/GET/etc) já representa a ação', 'não tem motivo, é só convenção estética'], answer: 1 },
      { q: 'O que <code>DELETE /produtos/15</code> deve fazer?', options: ['listar produtos a partir do id 15', 'remover o produto de id 15', 'criar produto com id 15'], answer: 1 },
    ],
  },
  {
    id: 'api-3',
    unit: 'Fase 9 — APIs REST e HTTP',
    title: 'JSON: estrutura e parsing',
    type: 'theory',
    xp: 15,
    content: `
      <p><strong>JSON</strong> (JavaScript Object Notation) é o formato padrão de troca de dados em APIs. É texto puro — qualquer linguagem lê.</p>
      <pre><code>{
  "id": 42,
  "nome": "Lucas",
  "ativo": true,
  "tags": ["dev", "junior"],
  "endereco": {
    "cidade": "BH",
    "uf": "MG"
  }
}</code></pre>
      <p>Em JavaScript:</p>
      <pre><code>// Texto → objeto
const obj = JSON.parse('{"nome":"Lucas"}');
console.log(obj.nome); // "Lucas"

// Objeto → texto (pra enviar na API)
const texto = JSON.stringify({ nome: "Lucas" });</code></pre>
      <p>Cuidado: JSON não aceita <code>undefined</code>, <code>function</code> ou comentários.</p>
    `,
    quiz: [
      { q: 'Para converter um objeto JS em string JSON:', options: ['JSON.parse(obj)', 'JSON.stringify(obj)', 'obj.toString()'], answer: 1 },
      { q: 'Para converter texto JSON recebido de uma API em objeto JS:', options: ['JSON.parse(texto)', 'JSON.stringify(texto)', 'new JSON(texto)'], answer: 0 },
      { q: 'JSON aceita qual destes valores?', options: ['undefined', 'function() {}', 'true'], answer: 2 },
    ],
  },
  {
    id: 'api-4',
    unit: 'Fase 9 — APIs REST e HTTP',
    title: 'Autenticação: token vs sessão',
    type: 'theory',
    xp: 15,
    content: `
      <p>APIs precisam saber quem está fazendo a requisição. Dois modelos principais:</p>
      <p><strong>Sessão (session):</strong> servidor guarda estado do usuário na memória. O cliente recebe um cookie com ID de sessão. Funciona bem pra aplicações web tradicionais, mas escala mal em múltiplos servidores.</p>
      <p><strong>Token (JWT):</strong> servidor gera um token assinado com todas as infos do usuário. O cliente guarda o token e envia em toda requisição (geralmente no header <code>Authorization</code>). O servidor só valida a assinatura — sem estado guardado.</p>
      <pre><code>// Enviando token num fetch
fetch('/api/perfil', {
  headers: {
    'Authorization': 'Bearer eyJhbGciOi...'
  }
});</code></pre>
      <p><strong>Nunca</strong> guarde tokens em <code>localStorage</code> se houver risco de XSS. Prefira <code>httpOnly cookie</code>.</p>
    `,
    quiz: [
      { q: 'Qual vantagem do token (JWT) sobre sessão?', options: ['é mais simples de implementar', 'servidor não precisa guardar estado — escala melhor', 'token nunca expira'], answer: 1 },
      { q: 'Token JWT geralmente é enviado em:', options: ['URL da requisição', 'header Authorization', 'body do GET'], answer: 1 },
      { q: 'Por que evitar guardar token em localStorage?', options: ['localStorage é lento', 'vulnerável a XSS — JS malicioso na página consegue ler', 'localStorage não existe no browser'], answer: 1 },
    ],
  },
  {
    id: 'api-5',
    unit: 'Fase 9 — APIs REST e HTTP',
    title: 'Exercício: extrair dados de JSON',
    type: 'fill',
    xp: 25,
    content: `
      <p>De uma lista de produtos, queremos os <strong>nomes</strong> dos que custam mais de 50. Complete o campo do produto que entra no resultado.</p>
    `,
    fillCode: `function nomesCaros(produtos) {
  let resultado = [];
  for (let i = 0; i < produtos.length; i++) {
    if (produtos[i].preco > 50) resultado.push(produtos[i].◻);
  }
  return resultado;
}`,
    fillBlanks: [{ accept: ['nome'] }],
    fillHint: 'Queremos o nome, não o preço.',
  },
  {
    id: 'api-6',
    unit: 'Fase 9 — APIs REST e HTTP',
    title: 'Exercício: agrupar por status',
    type: 'fill',
    xp: 25,
    content: `
      <p>Conte os pedidos por <strong>status</strong> num objeto. O <code>(contagem[s] || 0)</code> garante começar em 0. Complete o operador que <strong>incrementa</strong> a contagem.</p>
    `,
    fillCode: `function contarPorStatus(pedidos) {
  let contagem = {};
  for (let i = 0; i < pedidos.length; i++) {
    let s = pedidos[i].status;
    contagem[s] = (contagem[s] || 0) ◻ 1;
  }
  return contagem;
}`,
    fillBlanks: [{ accept: ['+'] }],
    fillHint: 'Some 1 ao valor atual.',
  },
  {
    id: 'api-7',
    unit: 'Fase 9 — APIs REST e HTTP',
    title: 'Explorar API pública',
    type: 'checklist',
    xp: 10,
    content: `
      <p>Faça uma requisição GET numa API pública usando Postman, Insomnia ou o próprio browser. Sugestões:</p>
      <ul>
        <li><code>https://viacep.com.br/ws/30140071/json/</code> — CEP brasileiro</li>
        <li><code>https://api.github.com/users/seu-usuario</code> — perfil GitHub</li>
        <li><code>https://jsonplaceholder.typicode.com/posts/1</code> — API fake pra testes</li>
      </ul>
      <p>Observe: qual o status code? Qual a estrutura do JSON retornado? Quais campos existem?</p>
    `,
  },

  // ===== FASE 10 — Git e versionamento =====
  {
    id: 'git-1',
    unit: 'Fase 10 — Git e versionamento',
    title: 'O que é Git e por que usar',
    type: 'theory',
    xp: 15,
    content: `
      <p><strong>Git</strong> é um sistema de controle de versão: guarda o histórico completo de mudanças no código, permite voltar a qualquer ponto anterior e facilita trabalho em equipe.</p>
      <p>Sem Git você tem <code>projeto_final_v2_revisado_AGORA.zip</code>. Com Git você tem um histórico limpo de o que mudou, quando e por quê.</p>
      <p>Conceitos básicos:</p>
      <ul>
        <li><strong>Repositório (repo)</strong>: a pasta do projeto rastreada pelo Git</li>
        <li><strong>Commit</strong>: um snapshot (foto) do estado do projeto num momento</li>
        <li><strong>Branch</strong>: linha paralela de desenvolvimento</li>
        <li><strong>Remote</strong>: cópia do repo num servidor (GitHub, GitLab etc)</li>
      </ul>
      <pre><code>git init          # inicializa repo na pasta atual
git status        # vê o que mudou
git log           # histórico de commits</code></pre>
    `,
    quiz: [
      { q: 'O que é um commit no Git?', options: ['um arquivo de configuração', 'um snapshot do estado do projeto num momento', 'uma branch secundária'], answer: 1 },
      { q: 'Qual comando mostra o que mudou no projeto desde o último commit?', options: ['git log', 'git status', 'git push'], answer: 1 },
      { q: 'Para que serve um remote (ex: GitHub)?', options: ['rodar o código remotamente', 'guardar uma cópia do repo num servidor externo', 'criar branches automaticamente'], answer: 1 },
    ],
  },
  {
    id: 'git-2',
    unit: 'Fase 10 — Git e versionamento',
    title: 'Staging e commits',
    type: 'theory',
    xp: 15,
    content: `
      <p>Antes de commitar, você escolhe quais mudanças incluir usando <strong>staging</strong> (<code>git add</code>).</p>
      <pre><code>git add arquivo.js        # adiciona arquivo específico ao stage
git add .                  # adiciona tudo (cuidado!)
git commit -m "mensagem"   # grava o commit

git push origin main       # envia pro remote</code></pre>
      <p><strong>Boas mensagens de commit:</strong></p>
      <ul>
        <li>Escreva no imperativo: "Adiciona validação de CPF", não "Adicionei"</li>
        <li>Seja específico: "Corrige bug de cálculo de juros no mês 13" em vez de "fix"</li>
        <li>Uma ideia por commit — não misture refatoração com bugfix</li>
      </ul>
    `,
    quiz: [
      { q: 'O que <code>git add arquivo.js</code> faz?', options: ['commita o arquivo', 'adiciona o arquivo à área de staging', 'envia pro GitHub'], answer: 1 },
      { q: 'Qual mensagem de commit é melhor?', options: ['"fix"', '"Corrige cálculo de desconto quando quantidade é zero"', '"mudanças diversas"'], answer: 1 },
      { q: 'Por que evitar <code>git add .</code> sem verificar primeiro?', options: ['porque é mais lento', 'pode incluir arquivos sensíveis (.env) ou temporários sem querer', 'não tem motivo, é sempre seguro'], answer: 1 },
    ],
  },
  {
    id: 'git-3',
    unit: 'Fase 10 — Git e versionamento',
    title: 'Branches e merge',
    type: 'theory',
    xp: 15,
    content: `
      <p><strong>Branch</strong> é uma linha paralela de desenvolvimento. Você cria uma branch pra cada feature ou bugfix — assim o <code>main</code> fica sempre estável.</p>
      <pre><code>git checkout -b feature/login   # cria e muda pra nova branch
# ... faz commits ...
git checkout main               # volta pro main
git merge feature/login         # traz as mudanças pro main</code></pre>
      <p>Fluxo básico de feature branch:</p>
      <ol>
        <li>Cria branch a partir do <code>main</code> atualizado</li>
        <li>Desenvolve e commita na branch</li>
        <li>Abre Pull Request (PR) no GitHub pra revisão</li>
        <li>Merge aprovado → branch deletada</li>
      </ol>
    `,
    quiz: [
      { q: 'Por que criar uma branch pra cada feature em vez de commitar direto no main?', options: ['branches são obrigatórias no Git', 'main fica estável — feature em desenvolvimento não afeta código de produção', 'commits em main não funcionam'], answer: 1 },
      { q: '<code>git merge feature/login</code> executado na branch main faz o quê?', options: ['deleta a branch feature/login', 'traz os commits de feature/login pro main', 'cria uma nova branch'], answer: 1 },
      { q: 'O que é um Pull Request (PR)?', options: ['solicitar que alguém revise e aprove o merge da sua branch', 'baixar código do remote', 'deletar uma branch remota'], answer: 0 },
    ],
  },
  {
    id: 'git-4',
    unit: 'Fase 10 — Git e versionamento',
    title: 'Conflitos de merge',
    type: 'theory',
    xp: 15,
    content: `
      <p>Conflito acontece quando duas branches editaram a <strong>mesma linha</strong> do mesmo arquivo. Git não sabe qual versão usar — te pede pra decidir.</p>
      <pre><code>&lt;&lt;&lt;&lt;&lt;&lt;&lt; HEAD (sua branch)
  return preco * 1.1;
=======
  return preco * 1.12;
&gt;&gt;&gt;&gt;&gt;&gt;&gt; feature/ajuste-imposto</code></pre>
      <p>O que fazer:</p>
      <ol>
        <li>Abra o arquivo — procure os marcadores <code>&lt;&lt;&lt;&lt;&lt;&lt;&lt;</code></li>
        <li>Escolha qual versão manter (ou combine as duas) e apague os marcadores</li>
        <li><code>git add arquivo.js</code> pra marcar como resolvido</li>
        <li><code>git commit</code> pra finalizar o merge</li>
      </ol>
      <p>Conflitos frequentes = branches vivendo muito tempo separadas. Mergeie cedo e com frequência.</p>
    `,
    quiz: [
      { q: 'Quando ocorre um conflito de merge?', options: ['sempre que você usa merge', 'quando duas branches editaram a mesma linha do mesmo arquivo', 'quando o remote está offline'], answer: 1 },
      { q: 'O que você deve fazer após resolver o conflito manualmente?', options: ['git push direto', 'git add arquivo + git commit', 'deletar a branch e recomeçar'], answer: 1 },
      { q: 'Como reduzir a frequência de conflitos?', options: ['nunca usar branches', 'mergeiar as branches cedo e com frequência — evitar divergência longa', 'só commitar arquivos novos'], answer: 1 },
    ],
  },
  {
    id: 'git-5',
    unit: 'Fase 10 — Git e versionamento',
    title: 'Exercício: sequência de comandos',
    type: 'theory',
    xp: 20,
    content: `
      <p>Teste de sequência: coloque os passos no fluxo correto.</p>
    `,
    quiz: [
      { q: 'Ordem correta pra criar e enviar uma feature pro GitHub:', options: ['git push → git add → git commit → git checkout -b', 'git checkout -b feature/x → git add → git commit → git push', 'git commit → git checkout -b → git add → git push'], answer: 1 },
      { q: 'Você editou <code>app.js</code> e quer salvar só esse arquivo no próximo commit. Comando correto:', options: ['git add .', 'git commit app.js', 'git add app.js'], answer: 2 },
      { q: 'Pra ver o histórico de commits da branch atual:', options: ['git status', 'git log', 'git diff'], answer: 1 },
    ],
  },
  {
    id: 'git-6',
    unit: 'Fase 10 — Git e versionamento',
    title: 'Checklist: fluxo em projeto real',
    type: 'checklist',
    xp: 10,
    content: `
      <p>Abra um projeto seu (Gontijo, Codexy, qualquer um com Git). Execute o fluxo completo de feature branch:</p>
      <ol>
        <li>Atualize o main: <code>git pull origin main</code></li>
        <li>Crie uma branch: <code>git checkout -b feature/teste-araradev</code></li>
        <li>Faça qualquer pequena mudança (ex: adiciona comentário num arquivo)</li>
        <li>Stage + commit com mensagem descritiva</li>
        <li>Push: <code>git push origin feature/teste-araradev</code></li>
        <li>Abra um PR no GitHub (pode fechar sem merge se for só treino)</li>
      </ol>
    `,
  },

  // ===== FASE 11 — Assíncrono: Promises e async/await =====
  {
    id: 'async-1',
    unit: 'Fase 11 — Assíncrono',
    title: 'Síncrono vs assíncrono',
    type: 'theory',
    xp: 15,
    content: `
      <p>Código <strong>síncrono</strong> roda linha por linha, esperando cada uma terminar antes da próxima. Código <strong>assíncrono</strong> dispara uma tarefa que demora (buscar dados na rede, ler arquivo) e <strong>continua</strong> sem travar o programa — o resultado chega depois.</p>
      <pre><code>console.log("1");
setTimeout(() =&gt; console.log("2"), 1000); // só roda depois de 1s
console.log("3");
// imprime: 1, 3, 2</code></pre>
      <p>Por que importa: se o JavaScript travasse a tela esperando cada requisição de rede, o app congelaria. Assíncrono deixa a interface responsiva enquanto espera.</p>
    `,
    quiz: [
      { q: 'No exemplo, qual a ordem que aparece no console?', options: ['1, 2, 3', '1, 3, 2', '3, 2, 1', '2, 1, 3'], answer: 1 },
      { q: 'Operações assíncronas são úteis principalmente pra:', options: ['deixar o código mais curto', 'não travar o programa enquanto espera tarefas demoradas (rede, arquivo)', 'rodar mais rápido a CPU'], answer: 1 },
      { q: 'Código síncrono se caracteriza por:', options: ['rodar tudo de uma vez sem ordem', 'rodar linha por linha, esperando cada uma terminar', 'nunca terminar'], answer: 1 },
    ],
  },
  {
    id: 'async-2',
    unit: 'Fase 11 — Assíncrono',
    title: 'Promises',
    type: 'theory',
    xp: 15,
    content: `
      <p>Uma <strong>Promise</strong> é um objeto que representa um valor que vai chegar <em>no futuro</em>. Ela tem 3 estados: <strong>pendente</strong>, <strong>resolvida</strong> (deu certo) ou <strong>rejeitada</strong> (deu erro).</p>
      <pre><code>buscarUsuario(42)
  .then(usuario =&gt; console.log(usuario.nome)) // sucesso
  .catch(erro =&gt; console.log("falhou:", erro)) // erro
  .finally(() =&gt; console.log("acabou")); // sempre roda</code></pre>
      <p><code>.then()</code> recebe o valor quando a Promise resolve. <code>.catch()</code> captura erro se ela rejeitar. Você pode encadear vários <code>.then()</code>.</p>
    `,
    quiz: [
      { q: 'Quais são os 3 estados de uma Promise?', options: ['início, meio, fim', 'pendente, resolvida, rejeitada', 'aberta, fechada, perdida'], answer: 1 },
      { q: 'O que <code>.catch()</code> faz numa Promise?', options: ['roda quando a Promise resolve com sucesso', 'captura o erro quando a Promise é rejeitada', 'cancela a Promise'], answer: 1 },
      { q: '<code>.then(valor =&gt; ...)</code> recebe:', options: ['o erro da Promise', 'o valor quando a Promise resolve com sucesso', 'nada, é só decoração'], answer: 1 },
    ],
  },
  {
    id: 'async-3',
    unit: 'Fase 11 — Assíncrono',
    title: 'async / await',
    type: 'theory',
    xp: 15,
    content: `
      <p><strong>async/await</strong> é uma forma mais legível de trabalhar com Promises — parece código síncrono, mas é assíncrono por baixo.</p>
      <pre><code>async function mostrarUsuario(id) {
  try {
    const usuario = await buscarUsuario(id); // espera a Promise resolver
    console.log(usuario.nome);
  } catch (erro) {
    console.log("falhou:", erro);
  }
}</code></pre>
      <ul>
        <li><code>async</code> antes da função: ela passa a retornar uma Promise e pode usar <code>await</code> dentro.</li>
        <li><code>await</code> pausa a função até a Promise resolver, e devolve o valor.</li>
        <li><code>try/catch</code> trata o erro (faz o papel do <code>.catch()</code>).</li>
      </ul>
    `,
    quiz: [
      { q: 'O que <code>await</code> faz?', options: ['cancela a Promise', 'pausa a função até a Promise resolver e devolve o valor', 'transforma código assíncrono em síncrono de verdade'], answer: 1 },
      { q: 'Pra usar <code>await</code> dentro de uma função, ela precisa ser:', options: ['marcada como async', 'uma arrow function', 'declarada com var'], answer: 0 },
      { q: 'Com async/await, o erro é tratado normalmente com:', options: ['.catch() obrigatório', 'try/catch', 'um if no final'], answer: 1 },
    ],
  },
  {
    id: 'async-4',
    unit: 'Fase 11 — Assíncrono',
    title: 'fetch e tratamento de erro',
    type: 'theory',
    xp: 15,
    content: `
      <p><code>fetch</code> é a função do navegador pra fazer requisições HTTP. Ela retorna uma Promise.</p>
      <pre><code>async function carregarPosts() {
  const res = await fetch("https://api.exemplo.com/posts");
  if (!res.ok) throw new Error("HTTP " + res.status); // 4xx/5xx
  const dados = await res.json(); // converte o corpo em objeto
  return dados;
}</code></pre>
      <p>Detalhe importante: <code>fetch</code> <strong>não</strong> rejeita a Promise em erro HTTP (404, 500). Ela só rejeita se a rede falhar. Por isso você checa <code>res.ok</code> manualmente.</p>
    `,
    quiz: [
      { q: '<code>fetch</code> retorna:', options: ['o JSON pronto', 'uma Promise', 'o status code direto'], answer: 1 },
      { q: 'Por que checar <code>res.ok</code> mesmo usando try/catch?', options: ['porque fetch não rejeita sozinho em erro HTTP (404/500), só em falha de rede', 'porque res.ok é obrigatório na sintaxe', 'não precisa, é redundante'], answer: 0 },
      { q: '<code>await res.json()</code> serve pra:', options: ['enviar dados pro servidor', 'converter o corpo da resposta em objeto JavaScript', 'fechar a conexão'], answer: 1 },
    ],
  },
  {
    id: 'async-5',
    unit: 'Fase 11 — Assíncrono',
    title: 'Consolidar resultados',
    type: 'fill',
    xp: 25,
    content: `
      <p>De uma lista tipo <code>[{ok: true, valor: 10}, ...]</code>, some <code>valor</code> só onde <code>ok</code> for <code>true</code>. Complete a comparação que filtra os sucessos.</p>
    `,
    fillCode: `function somarSucessos(resultados) {
  let total = 0;
  for (let i = 0; i < resultados.length; i++) {
    if (resultados[i].ok ◻ true) total += resultados[i].valor;
  }
  return total;
}`,
    fillBlanks: [{ accept: ['===', '=='] }],
    fillHint: 'Compare o campo ok com true (igualdade estrita).',
  },
  {
    id: 'async-6',
    unit: 'Fase 11 — Assíncrono',
    title: 'Fazer um fetch real',
    type: 'checklist',
    xp: 10,
    content: `
      <p>Num projeto seu (ou num arquivo de teste), escreva uma função <code>async</code> que:</p>
      <ol>
        <li>Faz <code>fetch</code> numa API pública (ex: <code>https://viacep.com.br/ws/30140071/json/</code>)</li>
        <li>Checa <code>res.ok</code> e lança erro se falhar</li>
        <li>Converte com <code>res.json()</code> e dá <code>console.log</code> no resultado</li>
        <li>Envolve tudo em <code>try/catch</code></li>
      </ol>
      <p>Rode e veja o objeto no console. Depois force um erro (URL inválida) pra ver o <code>catch</code> disparar.</p>
    `,
  },

  // ===== FASE 12 — React e componentes =====
  {
    id: 'react-1',
    unit: 'Fase 12 — React e componentes',
    title: 'Componentes e JSX',
    type: 'theory',
    xp: 15,
    content: `
      <p>No React, a tela é montada com <strong>componentes</strong>: funções que retornam <strong>JSX</strong> (parece HTML dentro do JavaScript).</p>
      <pre><code>function Saudacao() {
  return &lt;h1&gt;Olá, TrilhaDev!&lt;/h1&gt;;
}</code></pre>
      <p>Um componente é reutilizável e pode ser usado dentro de outro, como se fosse uma tag:</p>
      <pre><code>function App() {
  return (
    &lt;div&gt;
      &lt;Saudacao /&gt;
      &lt;Saudacao /&gt;
    &lt;/div&gt;
  );
}</code></pre>
      <p>Regra: o nome do componente começa com <strong>letra maiúscula</strong> — é assim que o React distingue componente de tag HTML comum.</p>
    `,
    quiz: [
      { q: 'Um componente React é basicamente:', options: ['um arquivo CSS', 'uma função que retorna JSX', 'uma tabela do banco'], answer: 1 },
      { q: 'JSX é:', options: ['um banco de dados', 'sintaxe parecida com HTML escrita dentro do JavaScript', 'um framework separado do React'], answer: 1 },
      { q: 'Por que o nome do componente começa com letra maiúscula?', options: ['é só estética', 'pro React distinguir componente de tag HTML comum', 'senão dá erro de sintaxe no navegador'], answer: 1 },
    ],
  },
  {
    id: 'react-2',
    unit: 'Fase 12 — React e componentes',
    title: 'Props',
    type: 'theory',
    xp: 15,
    content: `
      <p><strong>Props</strong> são os parâmetros de um componente — dados que vêm "de fora" pra deixá-lo configurável.</p>
      <pre><code>function Saudacao(props) {
  return &lt;h1&gt;Olá, {props.nome}!&lt;/h1&gt;;
}

// uso:
&lt;Saudacao nome="Lucas" /&gt;
&lt;Saudacao nome="Ana" /&gt;</code></pre>
      <p>Dentro do JSX, <code>{ }</code> insere valores JavaScript. Props são <strong>somente leitura</strong>: o componente não deve alterar suas próprias props.</p>
    `,
    quiz: [
      { q: 'Props servem pra:', options: ['guardar estilos CSS', 'passar dados de fora pra dentro de um componente, deixando-o configurável', 'conectar no banco de dados'], answer: 1 },
      { q: 'No JSX, pra inserir um valor JavaScript (ex: uma variável) você usa:', options: ['colchetes [ ]', 'chaves { }', 'parênteses ( )'], answer: 1 },
      { q: 'Um componente pode alterar as próprias props?', options: ['sim, à vontade', 'não — props são somente leitura', 'só se for async'], answer: 1 },
    ],
  },
  {
    id: 'react-3',
    unit: 'Fase 12 — React e componentes',
    title: 'Estado (useState)',
    type: 'theory',
    xp: 15,
    content: `
      <p><strong>Estado</strong> é um dado que pertence ao componente e pode mudar com o tempo (ex: um contador). Quando o estado muda, o React <strong>re-renderiza</strong> o componente automaticamente.</p>
      <pre><code>import { useState } from "react";

function Contador() {
  const [contagem, setContagem] = useState(0);
  return (
    &lt;button onClick={() =&gt; setContagem(contagem + 1)}&gt;
      Cliquei {contagem} vezes
    &lt;/button&gt;
  );
}</code></pre>
      <p><code>useState(0)</code> devolve um par: o valor atual e uma função pra atualizá-lo. Nunca altere o estado direto (<code>contagem = 5</code> não funciona) — sempre use a função <code>setContagem</code>.</p>
    `,
    quiz: [
      { q: 'Quando o estado de um componente muda, o React:', options: ['ignora', 're-renderiza o componente automaticamente', 'recarrega a página inteira'], answer: 1 },
      { q: '<code>const [x, setX] = useState(0)</code> — o que é <code>setX</code>?', options: ['o valor atual do estado', 'a função que atualiza o estado e dispara o re-render', 'um valor fixo'], answer: 1 },
      { q: 'Pra mudar o estado corretamente você deve:', options: ['atribuir direto: contagem = 5', 'usar a função setadora: setContagem(5)', 'recarregar a página'], answer: 1 },
    ],
  },
  {
    id: 'react-4',
    unit: 'Fase 12 — React e componentes',
    title: 'Renderizar listas',
    type: 'theory',
    xp: 15,
    content: `
      <p>Pra exibir uma lista de itens no React, você usa <code>.map()</code> transformando cada dado em JSX.</p>
      <pre><code>function ListaTarefas({ tarefas }) {
  return (
    &lt;ul&gt;
      {tarefas.map(t =&gt; (
        &lt;li key={t.id}&gt;{t.titulo}&lt;/li&gt;
      ))}
    &lt;/ul&gt;
  );
}</code></pre>
      <p>Cada item precisa de uma prop <strong><code>key</code> única</strong> (geralmente o <code>id</code>). A key ajuda o React a saber qual item mudou, foi adicionado ou removido — sem ela, listas grandes re-renderizam errado e ficam lentas.</p>
    `,
    quiz: [
      { q: 'Pra renderizar uma lista de dados em JSX, normalmente se usa:', options: ['um for solto dentro do return', '.map() transformando cada item em JSX', '.push() dentro do JSX'], answer: 1 },
      { q: 'Pra que serve a prop <code>key</code> numa lista?', options: ['estilizar o item', 'ajudar o React a identificar qual item mudou/foi adicionado/removido', 'definir a ordem alfabética'], answer: 1 },
      { q: 'Uma boa <code>key</code> costuma ser:', options: ['o índice sempre, em qualquer caso', 'um id único de cada item', 'o próprio texto traduzido'], answer: 1 },
    ],
  },
  {
    id: 'react-5',
    unit: 'Fase 12 — React e componentes',
    title: 'Lógica de um componente',
    type: 'fill',
    xp: 25,
    content: `
      <p>Componentes montam a <code>className</code> conforme o estado. Começa com <code>"btn"</code> e vai <strong>acrescentando</strong> conforme as flags. Complete o operador que acumula no texto.</p>
    `,
    fillCode: `function classeBotao(ativo, desabilitado) {
  let c = 'btn';
  if (ativo) c += ' ativo';
  if (desabilitado) c ◻ ' off';
  return c;
}`,
    fillBlanks: [{ accept: ['+='] }],
    fillHint: 'Mesmo operador usado na linha de cima (acumula texto).',
  },
  {
    id: 'react-6',
    unit: 'Fase 12 — React e componentes',
    title: 'Mapear um componente real',
    type: 'checklist',
    xp: 10,
    content: `
      <p>Abra um projeto React seu (ou o próprio TrilhaDev). Escolha 1 componente e, sem IA, identifique no código:</p>
      <ol>
        <li>Quais <strong>props</strong> ele recebe?</li>
        <li>Ele tem <strong>estado</strong> (<code>useState</code>)? O que esse estado representa?</li>
        <li>Onde ele decide <strong>o que renderizar</strong> (condicionais, <code>.map()</code>)?</li>
        <li>Quem é o "pai" que usa esse componente e passa as props?</li>
      </ol>
      <p>Escreva as respostas em 4 frases. Isso treina ler código de componente em vez de só gerar com IA.</p>
    `,
  },
];
