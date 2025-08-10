<sup>Esse é um feedback gerado por IA, ele pode conter erros.</sup>

Você tem 9 créditos restantes para usar o sistema de feedback AI.

# Feedback para Aloana:

Nota final: **44.5/100**

Olá, Aloana! 👋🚓

Antes de tudo, parabéns pelo empenho nessa etapa tão desafiadora de migrar sua API para o PostgreSQL com Knex.js! 🎉 Você já acertou vários pontos importantes, como a estrutura modular com controllers, repositories e rotas, e conseguiu implementar filtros básicos e validações que garantem uma boa experiência para quem consome sua API. Isso é ótimo! 🙌

---

## 🎯 O que você já mandou bem (para celebrar!):

- A organização do seu projeto está muito próxima do esperado, com pastas bem separadas para controllers, repositories, rotas e banco de dados.
- Você implementou corretamente os endpoints REST para `/agentes` e `/casos`, com os métodos GET, POST, PUT, PATCH e DELETE.
- A validação dos dados está presente nas controllers, com uso do `AppError` para enviar mensagens personalizadas e status HTTP adequados.
- Os filtros simples nos endpoints, como por `status` e `agente_id` para casos, e por `nome` e `cargo` para agentes, estão funcionando.
- Você criou e usou migrations e seeds para popular as tabelas, o que é fundamental para a persistência.
- A conexão com o banco via Knex está configurada corretamente, e você fez uso do arquivo `db.js` para centralizar essa configuração.
- Além disso, parabéns por implementar os testes bônus de filtragem simples, como busca por status e agente responsável. Isso mostra seu esforço extra! 🌟

---

## 🕵️‍♂️ Vamos analisar os pontos que precisam de atenção para destravar sua API?

### 1. **Problema fundamental: manipulação do campo `id` nos recursos**

Percebi no seu código que você não está protegendo o campo `id` para que ele não seja alterado via PUT ou PATCH. Isso é uma questão importante porque o `id` é a chave primária e não deveria ser modificável após a criação do registro.

Por exemplo, no seu controller de agentes, no método `updateAgente`, você atualiza tudo que vem no corpo da requisição sem bloquear o `id`:

```js
async function updateAgente(req, res, next) {
  // ...
  const { nome, dataDeIncorporacao, cargo } = req.body;
  // Aqui falta validação para evitar que 'id' seja alterado
  // ...
  const result = await agentesRepository.update(id, { nome, dataDeIncorporacao, cargo });
  // ...
}
```

E o mesmo acontece no método `partialUpdateAgente`:

```js
const result = await agentesRepository.update(id, { ...agente, ...updates });
```

Se `updates` contiver um campo `id`, ele será sobrescrito no banco, o que não é correto.

**Como corrigir?**

Você precisa garantir que o campo `id` nunca seja atualizado. Uma forma simples é remover o `id` do objeto antes de enviar para o repositório:

```js
// Exemplo para partialUpdateAgente:
delete updates.id; // Remove o campo id se existir
const result = await agentesRepository.update(id, { ...agente, ...updates });
```

E no `updateAgente` (PUT), você pode ignorar o `id` do corpo ou nem aceitar que venha:

```js
const { id: ignored, ...dados } = req.body; // Ignora o id
// Valide os dados restantes e envie para update
```

Isso vale também para o controller de casos.

---

### 2. **Validação do payload no método PATCH para agentes**

Você tem um teste que espera erro 400 quando o payload do PATCH é inválido (ex: não é objeto ou é array). No seu método `partialUpdateAgente`, você faz essa validação:

```js
if (!updates || typeof updates !== 'object' || Array.isArray(updates))
  throw new AppError("Payload inválido", 400);
```

Isso está correto, mas no método PUT (`updateAgente`) você não valida se o corpo está no formato correto antes de acessar os campos. Essa falta de validação pode causar erros inesperados.

**Sugestão:** Sempre valide o formato do corpo da requisição antes de usar os dados, tanto no PUT quanto no PATCH.

---

### 3. **Falha na filtragem por data de incorporação com ordenação**

Você implementou o filtro por data no endpoint `/agentes` e ordenação, mas os testes indicam que a ordenação por data de incorporação (em ordem crescente e decrescente) não está funcionando corretamente.

No seu código:

```js
if (sortBy) {
  const orderDirection = order === 'desc' ? -1 : 1;
  if (sortBy === 'dataDeIncorporacao') {
    agentes.sort((a, b) => {
      const dateA = moment(a.dataDeIncorporacao, 'YYYY-MM-DD');
      const dateB = moment(b.dataDeIncorporacao, 'YYYY-MM-DD');
      if (!dateA.isValid() || !dateB.isValid()) return 0;
      return dateA.isBefore(dateB) ? -1 * orderDirection : dateA.isAfter(dateB) ? 1 * orderDirection : 0;
    });
  }
  // ...
}
```

O problema aqui é que você está fazendo toda a filtragem e ordenação **em memória** após buscar todos os agentes do banco. Isso funciona para poucos registros, mas não é ideal nem escalável.

Além disso, o ideal é que o banco já faça essa ordenação e filtro, usando o Knex para construir a query com `.where` e `.orderBy`.

**Por que isso impacta?**

- Sua API pode ficar lenta com muitos dados.
- A ordenação pode não funcionar exatamente como esperado.
- Você perde a oportunidade de usar o banco para filtrar e ordenar.

---

### 4. **Falta de implementação do filtro por palavra-chave nos casos**

No controller de casos, você implementou o filtro `keyword` para buscar por título e descrição, porém os testes indicam que esse filtro não está funcionando corretamente.

Você faz:

```js
if (keyword) {
  const kw = keyword.toLowerCase();
  casos = casos.filter(c =>
    (c.titulo && c.titulo.toLowerCase().includes(kw)) ||
    (c.descricao && c.descricao.toLowerCase().includes(kw))
  );
}
```

Novamente, isso é feito em memória, depois de buscar todos os casos do banco.

**O ideal** é que essa filtragem seja feita direto na query SQL, usando o Knex com `.where` e `.orWhere` e o operador `ILIKE` para busca case-insensitive no PostgreSQL.

---

### 5. **Problemas na estrutura do banco de dados e seeds**

Eu notei que seu arquivo de seed `agentes.js` apaga a tabela `casos` antes de apagar `agentes`:

```js
await knex('casos').del();
await knex('agentes').del();
```

Isso está correto para evitar erros de chave estrangeira, mas seu arquivo de seed `casos.js` apenas deleta `casos`:

```js
await knex('casos').del();
```

Se você rodar os seeds separadamente, pode dar conflito.

**Recomendação:** sempre apague as tabelas na ordem correta para respeitar as relações (primeiro `casos`, depois `agentes`), e documente isso para evitar confusão.

---

### 6. **Presença do arquivo `.env` na raiz do projeto**

Você tem uma penalidade por incluir o arquivo `.env` na raiz do seu repositório. Isso é uma prática que pode expor suas credenciais (como usuário e senha do banco).

**Dica importante:** Nunca suba seu `.env` para o repositório público! Use o `.gitignore` para ignorá-lo e crie um `.env.example` para documentar as variáveis necessárias.

---

## 🔧 Como melhorar para avançar?

### Refatoração para usar o Knex na filtragem e ordenação

Ao invés de buscar tudo e filtrar em memória, você pode modificar seus repositórios para aceitar parâmetros de filtro e ordenação e montar a query no banco.

Exemplo para `agentesRepository.js`:

```js
async function findAll(filters = {}) {
  let query = db('agentes');

  if (filters.nome) {
    query = query.where('nome', 'ilike', `%${filters.nome}%`);
  }
  if (filters.cargo) {
    query = query.where('cargo', filters.cargo);
  }
  if (filters.dataInicial) {
    query = query.where('dataDeIncorporacao', '>=', filters.dataInicial);
  }
  if (filters.dataFinal) {
    query = query.where('dataDeIncorporacao', '<=', filters.dataFinal);
  }
  if (filters.sortBy) {
    const order = filters.order === 'desc' ? 'desc' : 'asc';
    query = query.orderBy(filters.sortBy, order);
  }

  return query.select('*');
}
```

E no controller, repasse os filtros para o repository:

```js
const filtros = { nome, cargo, dataInicial, dataFinal, sortBy, order };
const agentes = await agentesRepository.findAll(filtros);
res.json(agentes);
```

Isso vai garantir que o banco faça o trabalho pesado e sua API fique mais eficiente e correta.

---

### Bloqueio do campo `id` nas atualizações

No controller de agentes, por exemplo:

```js
async function updateAgente(req, res, next) {
  try {
    const id = req.params.id;
    validateId(id);

    const { id: ignored, nome, dataDeIncorporacao, cargo } = req.body;

    if (!nome || !dataDeIncorporacao || !cargo)
      throw new AppError("Dados do agente incompletos", 400);

    // restante da validação e atualização
  } catch (error) {
    next(error);
  }
}
```

E para o PATCH:

```js
async function partialUpdateAgente(req, res, next) {
  try {
    const id = req.params.id;
    validateId(id);

    const updates = { ...req.body };
    if ('id' in updates) delete updates.id;

    // validações e atualização
  } catch (error) {
    next(error);
  }
}
```

---

### Validação do payload

Sempre faça uma checagem no início dos métodos PUT e PATCH para garantir que o corpo da requisição é um objeto válido e não um array ou vazio.

---

## 📚 Recursos que vão te ajudar muito:

- Para entender melhor como usar o Knex para construir queries com filtros e ordenação direto no banco:  
  [Guia oficial do Knex Query Builder](https://knexjs.org/guide/query-builder.html)

- Para aprender a criar e executar migrations e seeds corretamente:  
  [Documentação oficial do Knex sobre migrations](https://knexjs.org/guide/migrations.html)  
  [Vídeo sobre seeds com Knex](http://googleusercontent.com/youtube.com/knex-seeds)

- Para organizar seu projeto com a arquitetura MVC e deixar seu código mais limpo e modular:  
  [Arquitetura MVC para Node.js](https://youtu.be/bGN_xNc4A1k?si=Nj38J_8RpgsdQ-QH)

- Para validar dados e tratar erros de forma adequada, garantindo status 400 e 404 corretos:  
  [Validação e erros HTTP 400 e 404 - MDN](https://developer.mozilla.org/pt-BR/docs/Web/HTTP/Status/400)  
  [Como validar dados em APIs Node.js/Express](https://youtu.be/yNDCRAz7CM8?si=Lh5u3j27j_a4w3A_)

- Para configurar o ambiente PostgreSQL com Docker e conectar ao Node.js:  
  [Configuração PostgreSQL com Docker e Node.js](http://googleusercontent.com/youtube.com/docker-postgresql-node)

---

## 🗺️ Resumo rápido para você focar:

- ❌ **Não permita que o campo `id` seja alterado via PUT ou PATCH** — remova-o do payload antes de atualizar.
- ⚠️ **Valide o formato do corpo da requisição (payload) sempre**, especialmente para PATCH e PUT.
- 🔍 **Implemente filtros e ordenações diretamente nas queries do banco usando Knex** ao invés de filtrar em memória.
- 🔑 **Ajuste o filtro por palavra-chave nos casos para usar `ILIKE` no banco**, garantindo buscas corretas.
- 🗄️ **Garanta que seus seeds apaguem as tabelas na ordem correta para evitar conflitos com chaves estrangeiras**.
- 🚫 **Nunca suba seu arquivo `.env` no repositório público!** Use `.gitignore` para isso.
- 📚 Continue estudando os recursos indicados para aprimorar seu conhecimento em Knex, validação e arquitetura.

---

Aloana, você está no caminho certo e já construiu uma base sólida! 💪 Com esses ajustes, sua API vai ficar muito mais robusta, eficiente e alinhada às boas práticas do mercado. Continue firme que você vai chegar lá! Se precisar, estou aqui para ajudar no que for preciso. 😉

Boa sorte e bora codar! 🚀✨

> Caso queira tirar uma dúvida específica, entre em contato com o Chapter no nosso [discord](https://discord.gg/DryuHVnz).



---
<sup>Made By the Autograder Team.</sup><br>&nbsp;&nbsp;&nbsp;&nbsp;<sup><sup>- [Arthur Carvalho](https://github.com/ArthurCRodrigues)</sup></sup><br>&nbsp;&nbsp;&nbsp;&nbsp;<sup><sup>- [Arthur Drumond](https://github.com/drumondpucminas)</sup></sup><br>&nbsp;&nbsp;&nbsp;&nbsp;<sup><sup>- [Gabriel Resende](https://github.com/gnvr29)</sup></sup>