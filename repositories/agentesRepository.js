const db = require('../db');

async function findAll() {
    return db.agentes.select('*');
}

async function findById(id) {
  return db('agentes').where({ id }).first();
}

async function add(agente) {
    const [createdAgente] = await db('agentes').insert(agente).returning('*');
  return createdAgente;
}

async function update(id, agenteAtualizado) {
    const [agenteAtualizado] = await db('agentes').where({ id }).update(agenteAtualizado).returning('*');
  return agenteAtualizado;
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