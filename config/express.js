const express = require('express');
const mainRoutes = require('../routes/mainRoutes');

const app = express();

// Configurações do Express
app.use(express.json());

// Rotas
app.use('/', mainRoutes);

module.exports = app;