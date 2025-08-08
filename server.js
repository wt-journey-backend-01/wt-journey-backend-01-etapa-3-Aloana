const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

const { errorHandler } = require('./utils/errorHandler');

const agentesRoutes = require('./routes/agentesRoutes');
const casosRoutes = require('./routes/casosRoutes');

const { swaggerUi, swaggerSpec } = require('./docs/swagger');

app.use(express.json());

app.use('/agentes', agentesRoutes);
app.use('/casos', casosRoutes);

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get('/', (req, res) => {
  res.send('API do Departamento de Polícia está rodando!');
});

app.use((req, res, next) => {
  res.status(404).json({ message: 'Rota não encontrada' });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚓 Servidor rodando em http://localhost:${PORT}`);
});

module.exports = app;
