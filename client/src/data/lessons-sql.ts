// Trilha SQL e Banco de Dados. IDs prefixados com "sql-".
import type { Lesson } from '../types';

export const SQL_LESSONS: Lesson[] = [
  // ===== FASE 1 — Fundamentos =====
  {
    id: 'sql-1-1', track: 'sql', unit: 'Fase 1 — Fundamentos',
    title: 'O que é banco de dados', type: 'theory', xp: 15,
    content: `
      <p>Um <strong>banco de dados</strong> guarda informação organizada em <strong>tabelas</strong>
      (parecidas com planilhas): linhas são registros, colunas são campos.</p>
      <table border="1" cellpadding="4"><tr><th>id</th><th>nome</th><th>idade</th></tr>
      <tr><td>1</td><td>Ana</td><td>22</td></tr><tr><td>2</td><td>Léo</td><td>30</td></tr></table>
      <p><strong>SQL</strong> é a linguagem pra consultar e alterar esses dados.</p>`,
    quiz: [
      { q: 'Dados ficam organizados em:', options: ['pastas', 'tabelas', 'variáveis', 'funções'], answer: 1 },
      { q: 'Numa tabela, uma linha é:', options: ['um campo', 'um registro', 'uma coluna', 'um índice'], answer: 1 },
      { q: 'SQL serve pra:', options: ['estilizar', 'consultar/alterar dados', 'criar telas', 'hospedar'], answer: 1 },
    ],
  },
  {
    id: 'sql-1-2', track: 'sql', unit: 'Fase 1 — Fundamentos',
    title: 'SELECT', type: 'theory', xp: 15,
    content: `
      <p><code>SELECT</code> lê dados de uma tabela.</p>
      <pre><code>SELECT nome, idade FROM usuarios;
SELECT * FROM usuarios;   -- todas as colunas</code></pre>
      <p><code>*</code> significa "todas as colunas".</p>`,
    quiz: [
      { q: 'Qual comando lê dados?', options: ['GET', 'SELECT', 'READ', 'SHOW'], answer: 1 },
      { q: 'O que <code>*</code> significa?', options: ['nada', 'todas as colunas', 'multiplicação', 'a primeira linha'], answer: 1 },
      { q: 'De onde vêm os dados no SELECT?', options: ['FROM tabela', 'IN tabela', 'AT tabela', 'OF tabela'], answer: 0 },
    ],
  },
  {
    id: 'sql-1-3', track: 'sql', unit: 'Fase 1 — Fundamentos',
    title: 'WHERE (filtros)', type: 'theory', xp: 15,
    content: `
      <p><code>WHERE</code> filtra as linhas por uma condição.</p>
      <pre><code>SELECT * FROM usuarios WHERE idade &gt;= 18;
SELECT * FROM usuarios WHERE nome = 'Ana';</code></pre>`,
    quiz: [
      { q: 'Qual cláusula filtra linhas?', options: ['FILTER', 'WHERE', 'IF', 'ONLY'], answer: 1 },
      { q: "Filtrar idade maior que 18:", options: ['WHERE idade &gt; 18', 'IF idade &gt; 18', 'idade &gt; 18 ONLY', 'FILTER 18'], answer: 0 },
      { q: 'Texto em SQL vai entre:', options: ['aspas simples', 'colchetes', 'chaves', 'parênteses'], answer: 0 },
    ],
  },
  {
    id: 'sql-1-4', track: 'sql', unit: 'Fase 1 — Fundamentos',
    title: 'ORDER BY e LIMIT', type: 'theory', xp: 15,
    content: `
      <p>Ordenar e limitar resultados:</p>
      <pre><code>SELECT * FROM usuarios
ORDER BY idade DESC   -- do maior pro menor
LIMIT 5;              -- só 5 linhas</code></pre>`,
    quiz: [
      { q: 'O que ordena o resultado?', options: ['SORT', 'ORDER BY', 'ARRANGE', 'GROUP'], answer: 1 },
      { q: '<code>DESC</code> ordena:', options: ['crescente', 'decrescente', 'aleatório', 'alfabético'], answer: 1 },
      { q: 'O que <code>LIMIT 5</code> faz?', options: ['pula 5', 'traz só 5 linhas', 'soma 5', 'apaga 5'], answer: 1 },
    ],
  },

  // ===== FASE 2 — Alterando dados =====
  {
    id: 'sql-2-1', track: 'sql', unit: 'Fase 2 — Alterando dados',
    title: 'INSERT', type: 'theory', xp: 15,
    content: `
      <p><code>INSERT</code> adiciona uma nova linha.</p>
      <pre><code>INSERT INTO usuarios (nome, idade)
VALUES ('Bia', 25);</code></pre>`,
    quiz: [
      { q: 'Qual comando adiciona dados?', options: ['ADD', 'INSERT', 'CREATE', 'PUT'], answer: 1 },
      { q: 'Os valores vão depois de:', options: ['SET', 'VALUES', 'DATA', 'WITH'], answer: 1 },
      { q: 'INSERT cria:', options: ['uma tabela', 'uma nova linha', 'uma coluna', 'um banco'], answer: 1 },
    ],
  },
  {
    id: 'sql-2-2', track: 'sql', unit: 'Fase 2 — Alterando dados',
    title: 'UPDATE e DELETE', type: 'theory', xp: 20,
    content: `
      <p>Alterar e apagar — sempre com <code>WHERE</code>, senão afeta TUDO:</p>
      <pre><code>UPDATE usuarios SET idade = 26 WHERE nome = 'Bia';
DELETE FROM usuarios WHERE id = 3;</code></pre>
      <p>⚠️ <code>UPDATE</code>/<code>DELETE</code> sem <code>WHERE</code> mudam/apagam a tabela inteira.</p>`,
    quiz: [
      { q: 'Qual altera dados existentes?', options: ['CHANGE', 'UPDATE', 'EDIT', 'SET'], answer: 1 },
      { q: 'Por que sempre usar WHERE no DELETE?', options: ['é mais rápido', 'senão apaga tudo', 'é obrigatório', 'ordena'], answer: 1 },
      { q: 'UPDATE usa qual palavra pros novos valores?', options: ['VALUES', 'SET', 'TO', 'WITH'], answer: 1 },
    ],
  },

  // ===== FASE 3 — Relacionamentos =====
  {
    id: 'sql-3-1', track: 'sql', unit: 'Fase 3 — Relacionamentos',
    title: 'Chaves (PK e FK)', type: 'theory', xp: 20,
    content: `
      <p><strong>Chave primária (PK)</strong> identifica cada linha de forma única (ex: <code>id</code>).</p>
      <p><strong>Chave estrangeira (FK)</strong> liga uma tabela a outra (ex: <code>usuario_id</code> na tabela de pedidos aponta pro usuário).</p>`,
    quiz: [
      { q: 'O que identifica cada linha unicamente?', options: ['chave estrangeira', 'chave primária', 'índice', 'coluna'], answer: 1 },
      { q: 'Uma FK serve pra:', options: ['ordenar', 'ligar tabelas', 'apagar', 'filtrar'], answer: 1 },
      { q: 'Um bom PK costuma ser:', options: ['o nome', 'o id', 'a idade', 'a data'], answer: 1 },
    ],
  },
  {
    id: 'sql-3-2', track: 'sql', unit: 'Fase 3 — Relacionamentos',
    title: 'JOIN', type: 'theory', xp: 25,
    content: `
      <p><code>JOIN</code> junta linhas de duas tabelas pela relação entre elas.</p>
      <pre><code>SELECT pedidos.id, usuarios.nome
FROM pedidos
JOIN usuarios ON usuarios.id = pedidos.usuario_id;</code></pre>
      <p>O <code>ON</code> diz como as tabelas se conectam.</p>`,
    quiz: [
      { q: 'JOIN serve pra:', options: ['apagar tabelas', 'juntar tabelas', 'criar índice', 'ordenar'], answer: 1 },
      { q: 'O que o <code>ON</code> define?', options: ['a ordem', 'a condição de junção', 'o limite', 'o filtro final'], answer: 1 },
      { q: 'JOIN conecta tabelas por:', options: ['nomes iguais', 'chaves (PK/FK)', 'ordem alfabética', 'tamanho'], answer: 1 },
    ],
  },
  {
    id: 'sql-3-3', track: 'sql', unit: 'Fase 3 — Relacionamentos',
    title: 'GROUP BY e agregação', type: 'theory', xp: 25,
    content: `
      <p>Funções de agregação resumem dados: <code>COUNT</code>, <code>SUM</code>, <code>AVG</code>, <code>MAX</code>.</p>
      <pre><code>SELECT usuario_id, COUNT(*) AS total
FROM pedidos
GROUP BY usuario_id;</code></pre>
      <p><code>GROUP BY</code> agrupa linhas pra aplicar a agregação por grupo.</p>`,
    quiz: [
      { q: 'O que <code>COUNT(*)</code> faz?', options: ['soma valores', 'conta linhas', 'ordena', 'filtra'], answer: 1 },
      { q: '<code>GROUP BY</code> serve pra:', options: ['ordenar', 'agrupar pra agregar', 'apagar', 'juntar tabelas'], answer: 1 },
      { q: 'Qual calcula a média?', options: ['SUM', 'AVG', 'MAX', 'COUNT'], answer: 1 },
    ],
  },
  {
    id: 'sql-3-4', track: 'sql', unit: 'Fase 3 — Relacionamentos',
    title: 'Projeto: modelar um blog', type: 'checklist', xp: 25,
    content: `
      <p>Modele o banco de um blog simples (no papel ou numa ferramenta):</p>
      <ol>
        <li>Tabela <code>usuarios</code> (id PK, nome, email)</li>
        <li>Tabela <code>posts</code> (id PK, titulo, conteudo, usuario_id FK)</li>
        <li>Escreva um <code>SELECT</code> com <code>JOIN</code> trazendo o título do post + nome do autor</li>
        <li>Escreva um <code>GROUP BY</code> contando posts por usuário</li>
      </ol>
      <p>Fez as 4 partes? Marque como concluído.</p>`,
  },
];
