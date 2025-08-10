const casosRepository = require("../repositories/casosRepository");
const agentesRepository = require("../repositories/agentesRepository");
const { AppError } = require("../utils/errorHandler");

function validateId(id) {
  if (isNaN(Number(id)) || Number(id) <= 0) {
    throw new AppError("ID inválido", 400);
  }
}

async function getAllCasos(req, res, next) {
  try {
    const casos = await casosRepository.findFiltered(req.query);
    res.json(casos);
  } catch (error) {
    next(error);
  }
}

async function getCasoById(req, res, next) {
  try {
    const id = req.params.id;
    validateId(id);

    const caso = await casosRepository.findById(id);
    if (!caso) throw new AppError("Caso não encontrado", 404);

    res.json(caso);
  } catch (error) {
    next(error);
  }
}

async function createCaso(req, res, next) {
  try {
    const { id, titulo, descricao, status, agente_id } = req.body;
    const statusValidos = ["aberto", "solucionado"];

    if ('id' in req.body)
      throw new AppError("Não é permitido fornecer o campo 'id' ao criar caso", 400);

    if (!titulo || !descricao || !status || !agente_id)
      throw new AppError("Dados do caso incompletos", 400);

    if (!statusValidos.includes(status.toLowerCase()))
      throw new AppError("Status inválido", 400);

    validateId(agente_id);

    const agenteExiste = await agentesRepository.findById(agente_id);
    if (!agenteExiste) throw new AppError("Agente responsável não encontrado", 404);

    const createdCaso = await casosRepository.add({ titulo, descricao, status: status.toLowerCase(), agente_id });
    res.status(201).json(createdCaso);
  } catch (error) {
    next(error);
  }
}

async function updateCaso(req, res, next) {
  try {
    const id = req.params.id;
    validateId(id);

    if ('id' in req.body)
      throw new AppError("Não é permitido alterar o campo 'id'", 400);

    if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body) || Object.keys(req.body).length === 0)
      throw new AppError("Payload inválido", 400);

    const { titulo, descricao, status, agente_id } = req.body;
    const statusValidos = ["aberto", "solucionado"];

    if (!titulo || !descricao || !status || !agente_id)
      throw new AppError("Dados do caso incompletos", 400);

    if (!statusValidos.includes(status.toLowerCase()))
      throw new AppError("Status inválido", 400);

    validateId(agente_id);

    const agenteExiste = await agentesRepository.findById(agente_id);
    if (!agenteExiste) throw new AppError("Agente responsável não encontrado", 404);

    const casoExiste = await casosRepository.findById(id);
    if (!casoExiste) throw new AppError("Caso não encontrado", 404);

    const result = await casosRepository.update(id, { titulo, descricao, status: status.toLowerCase(), agente_id });
    res.json(result);
  } catch (error) {
    next(error);
  }
}

async function partialUpdateCaso(req, res, next) {
  try {
    const id = req.params.id;
    validateId(id);

    const updates = req.body;
    if ('id' in updates)
      throw new AppError("Não é permitido alterar o campo 'id'", 400);

    if (!updates || typeof updates !== "object" || Array.isArray(updates) || Object.keys(updates).length === 0)
      throw new AppError("Payload inválido", 400);

    const caso = await casosRepository.findById(id);
    if (!caso) throw new AppError("Caso não encontrado", 404);

    if (updates.agente_id) {
      validateId(updates.agente_id);
      const agenteExiste = await agentesRepository.findById(updates.agente_id);
      if (!agenteExiste) throw new AppError("Agente responsável não encontrado", 404);
    }

    const result = await casosRepository.update(id, { ...caso, ...updates });
    res.json(result);
  } catch (error) {
    next(error);
  }
}

async function removeCaso(req, res, next) {
  try {
    const id = req.params.id;
    validateId(id);

    const caso = await casosRepository.findById(id);
    if (!caso) throw new AppError("Caso não encontrado", 404);

    await casosRepository.remove(id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAllCasos,
  getCasoById,
  createCaso,
  updateCaso,
  partialUpdateCaso,
  removeCaso,
};
