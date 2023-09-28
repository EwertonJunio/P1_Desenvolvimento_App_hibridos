const mongoose = require('mongoose');
require('dotenv').config();

const dbUsername = process.env.DB_USER;
const dbPassword = process.env.DB_PASS;
const dbName = 'nome_do_seu_banco';
const dbCluster = 'cluster.mongodb.net';

const DB_URI = `mongodb+srv://${dbUsername}:${dbPassword}@${dbCluster}/${dbName}?retryWrites=true&w=majority`;

const connectToDatabase = async() => {
    try {
        await mongoose.connect(DB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true,
            useFindAndModify: false
        });
        console.log('Conexão com o MongoDB estabelecida com sucesso!');
    } catch (error) {
        console.error('Erro na conexão com o MongoDB:', error.message);
        process.exit(1);
    }
};

module.exports = connectToDatabase;