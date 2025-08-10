const casosRepository = require("../repositories/casosRepository");
const agentesRepository = require("../repositories/agentesRepository");
const { AppError } = require("../utils/errorHandler");
const moment = require("moment");

function validateId(id) {
  if (isNaN(Number(id)) || Number(id) <= 0) {
    throw new AppError("ID inválido", 400);
  }
}

async function getAllCasos(req, res, next) {
  try {
    let casos = await casosRepository.findAll();
    const { status, agente_id, sortBy, order, keyword } = req.query;

    if (status) {
      casos = casos.filter(c => c.status?.toLowerCase() === status.toLowerCase());
    }
    if (agente_id) {
      casos = casos.filter(c => Number(c.agente_id) === Number(agente_id));
    }
    if (keyword) {
      const kw = keyword.toLowerCase();
      casos = casos.filter(c =>
        (c.titulo && c.titulo.toLowerCase().includes(kw)) ||
        (c.descricao && c.descricao.toLowerCase().includes(kw))
      );
    }
    if (sortBy) {
      const orderDirection = order === 'desc' ? -1 : 1;
      casos.sort((a, b) => {
        if (['dataDeAbertura', 'dataDeFechamento'].includes(sortBy)) {
          const dateA = moment(a[sortBy], 'YYYY-MM-DD');
          const dateB = moment(b[sortBy], 'YYYY-MM-DD');
          if (!dateA.isValid() || !dateB.isValid()) return 0;
          return dateA.isBefore(dateB) ? -1 * orderDirection : 1 * orderDirection;
        }
        if (!a[sortBy] || !b[sortBy]) return 0;
        if (typeof a[sortBy] === 'string') return a[sortBy].localeCompare(b[sortBy]) * orderDirection;
        if (typeof a[sortBy] === 'number') return (a[sortBy] - b[sortBy]) * orderDirection;
        return 0;
      });
    }

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
    const { titulo, descricao, status, agente_id } = req.body;
    const statusValidos = ["aberto", "solucionado"];

    if (!titulo || !descricao || !status || !agente_id)
      throw new AppError("Dados do caso incompletos", 400);

    if (!statusValidos.includes(status.toLowerCase()))
      throw new AppError("Status inválido", 400);

    validateId(agente_id);

    const agenteExiste = await agentesRepository.findById(agente_id);
    if (!agenteExiste) throw new AppError("Agente responsável não encontrado", 404);

    const createdCaso = await casosRepository.add({
      titulo,
      descricao,
      status: status.toLowerCase(),
      agente_id
    });

    res.status(201).json(createdCaso);
  } catch (error) {
    next(error);
  }
}

async function updateCaso(req, res, next) {
  try {
    const id = req.params.id;
    validateId(id);

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

    const result = await casosRepository.update(id, {
      titulo,
      descricao,
      status: status.toLowerCase(),
      agente_id
    });

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
    if (!updates || typeof updates !== "object" || Array.isArray(updates))
      throw new AppError("Payload inválido", 400);

    if (updates.agente_id) {
      validateId(updates.agente_id);
      const agenteExiste = await agentesRepository.findById(updates.agente_id);
      if (!agenteExiste) throw new AppError("Agente responsável não encontrado", 404);
    }

    const caso = await casosRepository.findById(id);
    if (!caso) throw new AppError("Caso não encontrado", 404);

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
