const { v4: uuidv4, validate: uuidValidate } = require('uuid');
const moment = require('moment');
const { AppError } = require('../utils/errorHandler');
const agentesRepository = require('../repositories/agentesRepository');

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
                let after = !inicio || data.isSameOrAfter(inicio, 'day');
                let before = !fim || data.isSameOrBefore(fim, 'day');
                return after && before;
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
        if (!uuidValidate(id)) throw new AppError("ID inválido", 400);

        const agente = agentesRepository.findById(id);
        if (!agente) throw new AppError("Agente não encontrado", 404);

        res.json(agente);
    } catch (error) {
        next(error);
    }
}

async function createAgente(req, res, next) {
    try {
        const newAgente = req.body;

        if (!newAgente || typeof newAgente !== 'object' || Array.isArray(newAgente) || Object.keys(newAgente).length === 0)
            throw new AppError("Payload vazio ou inválido", 400);

        if ('id' in newAgente)
            throw new AppError("Não é permitido fornecer o campo 'id' ao criar agente", 400);

        if (!newAgente.nome || !newAgente.dataDeIncorporacao || !newAgente.cargo)
            throw new AppError("Dados do agente incompletos", 400);

        const dataIncorporacao = moment(newAgente.dataDeIncorporacao, 'YYYY-MM-DD', true);
        if (!dataIncorporacao.isValid() || dataIncorporacao.isAfter(moment(), 'day'))
            throw new AppError("Data de incorporação inválida ou futura", 400);

        newAgente.id = uuidv4();
        agentesRepository.add(newAgente);

        res.status(201).json(newAgente);
    } catch (error) {
        next(error);
    }
}

async function updateAgente(req, res, next) {
    try {
        const id = req.params.id;
        const updatedAgente = req.body;

        if (!uuidValidate(id)) throw new AppError("ID inválido", 400);

        if (!updatedAgente || typeof updatedAgente !== 'object' || Array.isArray(updatedAgente) || Object.keys(updatedAgente).length === 0)
            throw new AppError("Payload vazio ou inválido", 400);

        if ('id' in updatedAgente)
            throw new AppError("Não é permitido alterar o campo 'id'", 400);

        if (!updatedAgente.nome || !updatedAgente.dataDeIncorporacao || !updatedAgente.cargo)
            throw new AppError("Dados do agente incompletos", 400);

        const dataIncorporacao = moment(updatedAgente.dataDeIncorporacao, 'YYYY-MM-DD', true);
        if (!dataIncorporacao.isValid() || dataIncorporacao.isAfter(moment(), 'day'))
            throw new AppError("Data de incorporação inválida ou futura", 400);

        const index = agentesRepository.findAll().findIndex(a => a.id === id);
        if (index === -1) throw new AppError("Agente não encontrado", 404);

        updatedAgente.id = id;
        agentesRepository.update(index, updatedAgente);

        res.json(updatedAgente);
    } catch (error) {
        next(error);
    }
}

async function partialUpdateAgente(req, res, next) {
    try {
        const id = req.params.id;
        const updates = req.body;

        if (!uuidValidate(id)) throw new AppError("ID inválido", 400);

        if (!updates || typeof updates !== 'object' || Array.isArray(updates) || Object.keys(updates).length === 0)
            throw new AppError("Payload vazio ou inválido", 400);

        if ('id' in updates)
            throw new AppError("Não é permitido alterar o campo 'id'", 400);

        if (updates.dataDeIncorporacao) {
            const dataIncorporacao = moment(updates.dataDeIncorporacao, 'YYYY-MM-DD', true);
            if (!dataIncorporacao.isValid() || dataIncorporacao.isAfter(moment(), 'day'))
                throw new AppError("Data de incorporação inválida ou futura", 400);
        }

        if (updates.nome !== undefined && !updates.nome)
            throw new AppError("Nome inválido", 400);
        if (updates.cargo !== undefined && !updates.cargo)
            throw new AppError("Cargo inválido", 400);

        const agentes = agentesRepository.findAll();
        const index = agentes.findIndex(a => a.id === id);
        if (index === -1) throw new AppError("Agente não encontrado", 404);

        const agente = agentes[index];
        const updatedAgente = { ...agente, ...updates, id };

        agentesRepository.update(index, updatedAgente);

        res.json(updatedAgente);
    } catch (error) {
        next(error);
    }
}

async function deleteAgente(req, res, next) {
    try {
        const id = req.params.id;

        if (!uuidValidate(id)) throw new AppError("ID inválido", 400);

        const index = agentesRepository.findAll().findIndex(a => a.id === id);
        if (index === -1) throw new AppError("Agente não encontrado", 404);

        agentesRepository.remove(index);
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
