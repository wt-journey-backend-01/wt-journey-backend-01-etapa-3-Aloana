const db = require('../db/db');

async function findAll() {
    return db('agentes').select('*');
}

async function findById(id) {
  return db('agentes').where({ id }).first();
}

async function add(agente) {
    const [createdAgente] = await db('agentes').insert(agente).returning('*');
  return createdAgente;
}

async function update(id, dadosAtualizados) {
  const [agente] = await db('agentes')
    .where({ id })
    .update(dadosAtualizados)
    .returning('*');
  return agente;
}

function remove(id) {
    return db('agentes').where({ id }).del();
}

module.exports = {
    findAll,
    findById,
    add,
    update,
    remove
}