# Arquivo de intruções

Neste arquivo você encontrará a estrutura de pastas do projeto as instruções para subir o banco de dados com Docker, executar migrations e rodar seeds.

### 📁 Estrutura dos Diretórios do projeto (pastas) 
```
📦 Meu-REPOSITÓRIO
│
├── package.json
├── package-lock.json
├── server.js
├── .env
├── knexfile.js
├── INSTRUCTIONS.md
├── docker-compose.yml

│
├── db/
│ ├── migrations/
│ ├── seeds/
│ └── db.js
│
├── routes/
│ ├── agentesRoutes.js
│ └── casosRoutes.js
│
├── controllers/
│ ├── agentesController.js
│ └── casosController.js
│
├── repositories/
│ ├── agentesRepository.js
│ └── casosRepository.js
│
├── utils/
│ └── errorHandler.js
│
```

## Subir o banco com Docker

Este projeto possui um arquivo `docker-compose.yml` na raiz. Seu conteúdo é:

```yaml
version: '3.9'

services:
  postgres:
    image: postgres:15
    container_name: postgres_policia
    restart: unless-stopped
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    ports:
      - "5432:5432"
    volumes:
      - dbdata:/var/lib/postgresql/data

volumes:
  dbdata:
```

Para subir o banco, execute o comando correspondente ao seu sistema operacional no terminal:

**Windows**
```sh
docker compose up -d
```

**Linux**
```sh
sudo docker compose up -d
```

Caso seja utilizado outras versões do docker talvez seja necessário acrescentar um " - "(hífen) entre os comandos de docker e composer, como exemplificado a baixo: 

**Windows**
```sh
docker-compose up -d
```

**Linux**
```sh
sudo docker-compose up -d
```

### Executar migrations

Esse projeto possui o arquivo de migration 20250808141740_solution_migrations.js.

As migrações podem ser executas com o comando a baixo:

Para executar a migração:
```sh
 npx knext migrate:latest 
```

Conteúdo:
```js
exports.up = function(knex) {
  return knex.schema
    .createTable('agentes', function (table) {
      table.increments('id').primary();
      table.string('nome').notNullable();
      table.date('dataDeIncorporacao').notNullable();
      table.string('cargo').notNullable();
    })
    .createTable('casos', function (table) {
      table.increments('id').primary();
      table.string('titulo').notNullable();
      table.string('descricao');
      table.enu('status', ['aberto', 'solucionado']).notNullable();
      table.integer('agente_id').unsigned().references('id').inTable('agentes');
    });
};

exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('casos')
    .dropTableIfExists('agentes');
};
```

### Rodar seeds

O projeto conta com dois arquivos de seed, agentes.js e casos.js.

As seeds podem ser executas com o comando a baixo:

Para executar todas as migrações:
```sh
 npx knex seed:run 
```

ou cada uma delas separadamente, como no caso da tabela agentes:
```sh 
 npx knex seed:run seeds/agentes
```

E para a tabela casos: 
```sh 
 npx knex seed:run seeds/casos
```
