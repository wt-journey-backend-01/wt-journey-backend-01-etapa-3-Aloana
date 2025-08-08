const db = require('../db/db');
const agentesRepository = require('./agentesRepository');

const agentes = agentesRepository.findAll();


async function findAll() {
    return db('casos').select();
}

async function findById(id) {
  return db('casos').where({ id }).first();
}

async function add(caso) {
    const [createdCaso] = await db('casos').insert(caso).returning('*');
  return createdCaso;
}

async function update(id, casoAtualizado) {
  const [updatedCaso] = await db('casos').where({ id }).update(casoAtualizado).returning('*');
  return updatedCaso;
}

async function remove(id) {
  return db('casos').where({ id }).del();
}

module.exports = {
    findAll,
    findById,
    add,
    update,
    remove
}
