const db = require('../db/db');

async function findAll() {
  return db('casos').select('*');
}

async function findFiltered(queryParams) {
  const { status, agente_id, sortBy, order, keyword } = queryParams;
  const query = db('casos');

  if (status) query.whereILike('status', status);
  if (agente_id) query.where('agente_id', agente_id);
  if (keyword) {
    query.where(function() {
      this.whereILike('titulo', `%${keyword}%`).orWhereILike('descricao', `%${keyword}%`);
    });
  }
  if (sortBy) query.orderBy(sortBy, order === 'desc' ? 'desc' : 'asc');

  return query.select('*');
}

async function findById(id) {
  return db('casos').where({ id }).first();
}

async function add(caso) {
  const result = await db('casos').insert(caso).returning('*');
  return result[0];
}

async function update(id, dados) {
  delete dados.id; // Protege o id!
  const [caso] = await db('casos')
    .where({ id })
    .update(dados)
    .returning('*');
  return caso;
}

async function remove(id) {
  return db('casos').where({ id }).del();
}

module.exports = {
  findAll,
  findFiltered,
  findById,
  add,
  update,
  remove,
};
