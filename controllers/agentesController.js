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
    let agentes = await agentesRepository.findAll();
    const { nome, cargo, dataDeIncorporacao, dataInicial, dataFinal, sortBy, order } = req.query;

    if (nome) {
      agentes = agentes.filter(a => a.nome.toLowerCase().includes(nome.toLowerCase()));
    }
    if (cargo) {
      agentes = agentes.filter(a => a.cargo.toLowerCase() === cargo.toLowerCase());
    }
    if (dataDeIncorporacao && !dataInicial && !dataFinal) {
      agentes = agentes.filter(a => a.dataDeIncorporacao === dataDeIncorporacao);
    }
    if (dataInicial || dataFinal) {
      agentes = agentes.filter(a => {
        const data = moment(a.dataDeIncorporacao, 'YYYY-MM-DD');
        const inicio = dataInicial ? moment(dataInicial, 'YYYY-MM-DD') : null;
        const fim = dataFinal ? moment(dataFinal, 'YYYY-MM-DD') : null;
        return (!inicio || data.isSameOrAfter(inicio, 'day'))
            && (!fim || data.isSameOrBefore(fim, 'day'));
      });
    }
    if (sortBy) {
      const orderDirection = order === 'desc' ? -1 : 1;
      if (sortBy === 'dataDeIncorporacao') {
        agentes.sort((a, b) => {
          const dateA = moment(a.dataDeIncorporacao, 'YYYY-MM-DD');
          const dateB = moment(b.dataDeIncorporacao, 'YYYY-MM-DD');
          if (!dateA.isValid() || !dateB.isValid()) return 0;
          return dateA.isBefore(dateB) ? -1 * orderDirection : dateA.isAfter(dateB) ? 1 * orderDirection : 0;
        });
      } else {
        agentes.sort((a, b) => {
          if (!a[sortBy] || !b[sortBy]) return 0;
          if (typeof a[sortBy] === 'string') {
            return a[sortBy].localeCompare(b[sortBy]) * orderDirection;
          }
          if (typeof a[sortBy] === 'number') {
            return (a[sortBy] - b[sortBy]) * orderDirection;
          }
          return 0;
        });
      }
    }

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
    const { nome, dataDeIncorporacao, cargo } = req.body;

    if (!nome || !dataDeIncorporacao || !cargo)
      throw new AppError("Dados do agente incompletos", 400);

    const dataIncorporacao = moment(dataDeIncorporacao, 'YYYY-MM-DD', true);
    if (!dataIncorporacao.isValid() || dataIncorporacao.isAfter(moment(), 'day'))
      throw new AppError("Data de incorporação inválida ou futura", 400);

    const createdAgente = await agentesRepository.add({
      nome,
      dataDeIncorporacao,
      cargo
    });

    res.status(201).json(createdAgente);
  } catch (error) {
    next(error);
  }
}

async function updateAgente(req, res, next) {
  try {
    const id = req.params.id;
    validateId(id);

    const { nome, dataDeIncorporacao, cargo } = req.body;
    if (!nome || !dataDeIncorporacao || !cargo)
      throw new AppError("Dados do agente incompletos", 400);

    const agenteExiste = await agentesRepository.findById(id);
    if (!agenteExiste) throw new AppError("Agente não encontrado", 404);

    const dataIncorporacao = moment(dataDeIncorporacao, 'YYYY-MM-DD', true);
    if (!dataIncorporacao.isValid() || dataIncorporacao.isAfter(moment(), 'day'))
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
    if (!updates || typeof updates !== 'object' || Array.isArray(updates))
      throw new AppError("Payload inválido", 400);

    const agente = await agentesRepository.findById(id);
    if (!agente) throw new AppError("Agente não encontrado", 404);

    if (updates.dataDeIncorporacao) {
      const dataIncorporacao = moment(updates.dataDeIncorporacao, 'YYYY-MM-DD', true);
      if (!dataIncorporacao.isValid() || dataIncorporacao.isAfter(moment(), 'day'))
        throw new AppError("Data de incorporação inválida ou futura", 400);
    }

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
