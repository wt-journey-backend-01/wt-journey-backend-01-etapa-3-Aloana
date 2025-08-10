const db = require('../db/db');

async function findAll() {
  return db('agentes').select('*');
}

async function findFiltered(queryParams) {
  const { nome, cargo, dataDeIncorporacao, dataInicial, dataFinal, sortBy, order } = queryParams;
  const query = db('agentes');

  if (nome) query.whereILike('nome', `%${nome}%`);
  if (cargo) query.whereILike('cargo', cargo);
  if (dataDeIncorporacao) query.where('dataDeIncorporacao', dataDeIncorporacao);
  if (dataInicial) query.where('dataDeIncorporacao', '>=', dataInicial);
  if (dataFinal) query.where('dataDeIncorporacao', '<=', dataFinal);

  if (sortBy) query.orderBy(sortBy, order === 'desc' ? 'desc' : 'asc');

  return query.select('*');
}

async function findById(id) {
  return db('agentes').where({ id }).first();
}

async function add(agente) {
  const result = await db('agentes').insert(agente).returning('*');
  return result[0];
}

async function update(id, dados) {
  // Protege o campo id!
  delete dados.id;
  const [agente] = await db('agentes')
    .where({ id })
    .update(dados)
    .returning('*');
  return agente;
}

async function remove(id) {
  return db('agentes').where({ id }).del();
}

module.exports = {
  findAll,
  findFiltered,
  findById,
  add,
  update,
  remove
};
