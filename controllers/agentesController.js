const moment = require('moment');
const { AppError } = require('../utils/errorHandler');
const agentesRepository = require('../repositories/agentesRepository');

function validateId(id) {
  if (isNaN(Number(id)) || Number(id) <= 0) {
    throw new AppError("ID inválido", 400);
  }
}

async function getAllAgentes(req, res, next) {
  try {
    const agentes = await agentesRepository.findFiltered(req.query);
    res.json(agentes);
  } catch (error) {
    next(error);
  }
}

async function getAgenteById(req, res, next) {
  try {
    const id = req.params.id;
    validateId(id);

    const agente = await agentesRepository.findById(id);
    if (!agente) throw new AppError("Agente não encontrado", 404);

    res.json(agente);
  } catch (error) {
    next(error);
  }
}

async function createAgente(req, res, next) {
  try {
    const { id, nome, dataDeIncorporacao, cargo } = req.body;

    if ('id' in req.body)
      throw new AppError("Não é permitido fornecer o campo 'id' ao criar agente", 400);

    if (!nome || !dataDeIncorporacao || !cargo)
      throw new AppError("Dados do agente incompletos", 400);

    const dataIncorporacao = moment(dataDeIncorporacao, 'YYYY-MM-DD', true);
    if (!dataIncorporacao.isValid() || dataIncorporacao.isAfter(moment(), 'day'))
      throw new AppError("Data de incorporação inválida ou futura", 400);

    const createdAgente = await agentesRepository.add({ nome, dataDeIncorporacao, cargo });
    res.status(201).json(createdAgente);
  } catch (error) {
    next(error);
  }
}

async function updateAgente(req, res, next) {
  try {
    const id = req.params.id;
    validateId(id);

    if ('id' in req.body)
      throw new AppError("Não é permitido alterar o campo 'id'", 400);

    if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body) || Object.keys(req.body).length === 0)
      throw new AppError("Payload inválido", 400);

    const { nome, dataDeIncorporacao, cargo } = req.body;

    if (!nome || !dataDeIncorporacao || !cargo)
      throw new AppError("Dados do agente incompletos", 400);

    const agenteExiste = await agentesRepository.findById(id);
    if (!agenteExiste) throw new AppError("Agente não encontrado", 404);

    const dataValidada = moment(dataDeIncorporacao, 'YYYY-MM-DD', true);
    if (!dataValidada.isValid() || dataValidada.isAfter(moment(), 'day'))
      throw new AppError("Data de incorporação inválida ou futura", 400);

    const result = await agentesRepository.update(id, { nome, dataDeIncorporacao, cargo });
    res.json(result);
  } catch (error) {
    next(error);
  }
}

async function partialUpdateAgente(req, res, next) {
  try {
    const id = req.params.id;
    validateId(id);

    const updates = req.body;
    if ('id' in updates)
      throw new AppError("Não é permitido alterar o campo 'id'", 400);

    if (!updates || typeof updates !== 'object' || Array.isArray(updates) || Object.keys(updates).length === 0)
      throw new AppError("Payload inválido", 400);

    if (updates.dataDeIncorporacao) {
      const dataValidada = moment(updates.dataDeIncorporacao, 'YYYY-MM-DD', true);
      if (!dataValidada.isValid() || dataValidada.isAfter(moment(), 'day'))
        throw new AppError("Data de incorporação inválida ou futura", 400);
    }

    const agente = await agentesRepository.findById(id);
    if (!agente) throw new AppError("Agente não encontrado", 404);

    const result = await agentesRepository.update(id, { ...agente, ...updates });
    res.json(result);
  } catch (error) {
    next(error);
  }
}

async function deleteAgente(req, res, next) {
  try {
    const id = req.params.id;
    validateId(id);

    const agente = await agentesRepository.findById(id);
    if (!agente) throw new AppError("Agente não encontrado", 404);

    await agentesRepository.remove(id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAllAgentes,
  getAgenteById,
  createAgente,
  updateAgente,
  partialUpdateAgente,
  deleteAgente
};
