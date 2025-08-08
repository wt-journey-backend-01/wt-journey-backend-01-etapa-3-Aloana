const casosRepository = require("../repositories/casosRepository");
const agentesRepository = require("../repositories/agentesRepository");
const { v4: uuidv4, validate: uuidValidate } = require('uuid');
const { AppError } = require("../utils/errorHandler");
const moment = require('moment');

async function getAllCasos(req, res, next) {
    try {
        let casos = await casosRepository.findAll();

        const { status, agente_id, sortBy, order, keyword } = req.query;

        if (status) {
            casos = casos.filter(c =>
                c.status && c.status.toLowerCase() === status.toLowerCase()
            );
        }

        if (agente_id) {
            casos = casos.filter(c =>
                c.agente_id && c.agente_id === agente_id
            );
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
            if (sortBy === 'dataDeAbertura' || sortBy === 'dataDeFechamento') {
                casos.sort((a, b) => {
                    const dateA = moment(a[sortBy], 'YYYY-MM-DD');
                    const dateB = moment(b[sortBy], 'YYYY-MM-DD');
                    if (!dateA.isValid() || !dateB.isValid()) return 0;
                    return dateA.isBefore(dateB) ? -1 * orderDirection : dateA.isAfter(dateB) ? 1 * orderDirection : 0;
                });
            } else {
                casos.sort((a, b) => {
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

        res.json(casos);
    } catch (error) {
        next(error);
    }
}

async function getCasoById(req, res, next) {
    try {
        const id = req.params.id;

        if (!uuidValidate(id)) throw new AppError("ID inválido", 400);

        const caso = casosRepository.findById(id);

        if (!caso) throw new AppError("Caso não encontrado", 404);

        res.json(caso);
    } catch (error) {
        next(error);
    }
}

async function createCaso(req, res, next) {
    try {
        const newCaso = req.body;
        const statusValidos = ['aberto', 'solucionado'];

        if (!newCaso || typeof newCaso !== 'object' || Array.isArray(newCaso) || Object.keys(newCaso).length === 0)
            throw new AppError("Payload vazio ou inválido", 400);

        if ('id' in newCaso)
            throw new AppError("Não é permitido fornecer o campo 'id' ao criar caso", 400);

        if (!newCaso.titulo || !newCaso.descricao || !newCaso.status || !newCaso.agente_id)
            throw new AppError("Dados do caso incompletos", 400);

        if (!statusValidos.includes(newCaso.status.toLowerCase()))
            throw new AppError("Status inválido. Deve ser 'aberto' ou 'solucionado'", 400);

        if (!uuidValidate(newCaso.agente_id))
            throw new AppError("ID do agente inválido", 400);

        const agenteExiste = agentesRepository.findAll().some(a => a.id === newCaso.agente_id);
        if (!agenteExiste)
            throw new AppError("Agente responsável não encontrado", 404);

        newCaso.id = uuidv4();
        casosRepository.add(newCaso);

        res.status(201).json(newCaso);
    } catch (error) {
        next(error);
    }
}

async function updateCaso(req, res, next) {
    try {
        const id = req.params.id;
        let updatedCaso = req.body;
        const statusValidos = ['aberto', 'solucionado'];

        if (!uuidValidate(id)) throw new AppError("ID inválido", 400);

        if (!updatedCaso || typeof updatedCaso !== 'object' || Array.isArray(updatedCaso) || Object.keys(updatedCaso).length === 0)
            throw new AppError("Payload vazio ou inválido", 400);

        if ('id' in updatedCaso)
            throw new AppError("Não é permitido alterar o campo 'id'", 400);

        if (!updatedCaso.titulo || !updatedCaso.descricao || !updatedCaso.status || !updatedCaso.agente_id)
            throw new AppError("Dados do caso incompletos", 400);

        if (!statusValidos.includes(updatedCaso.status.toLowerCase()))
            throw new AppError("Status inválido. Deve ser 'aberto' ou 'solucionado'", 400);

        if (!uuidValidate(updatedCaso.agente_id))
            throw new AppError("ID do agente inválido", 400);

        const agenteExiste = agentesRepository.findAll().some(a => a.id === updatedCaso.agente_id);
        if (!agenteExiste)
            throw new AppError("Agente responsável não encontrado", 404);

        const index = casosRepository.findAll().findIndex(c => c.id === id);
        if (index === -1)
            throw new AppError("Caso não encontrado", 404);

        updatedCaso.id = id;
        casosRepository.update(index, updatedCaso);

        res.json(updatedCaso);
    } catch (error) {
        next(error);
    }
}

async function partialUpdateCaso(req, res, next) {
    try {
        const id = req.params.id;

        if (!uuidValidate(id))
            throw new AppError("ID inválido", 400);

        const updates = req.body;
        if (!updates || typeof updates !== 'object' || Array.isArray(updates) || Object.keys(updates).length === 0)
            throw new AppError("Payload vazio ou inválido", 400);

        if ('id' in updates)
            throw new AppError("Não é permitido alterar o campo 'id'", 400);

        const casos = casosRepository.findAll();
        const index = casos.findIndex(c => c.id === id);
        if (index === -1)
            throw new AppError("Caso não encontrado", 404);

        Object.assign(casos[index], updates);
        casos[index].id = id;

        casosRepository.update(index, casos[index]);

        res.json(casos[index]);
    } catch (error) {
        next(error);
    }
}

async function removeCaso(req, res, next) {
    try {
        const id = req.params.id;

        if (!uuidValidate(id))
            throw new AppError("ID inválido", 400);

        const index = casosRepository.findAll().findIndex(c => c.id === id);
        if (index === -1)
            throw new AppError("Caso não encontrado", 404);

        casosRepository.remove(index);
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
    removeCaso
};
