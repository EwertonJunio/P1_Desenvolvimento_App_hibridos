const app = require('./config/express');
const connectToDatabase = require('./config/db');
const port = process.env.PORT || 3000;

connectToDatabase().then(() => {

    app.listen(port, () => {
        console.log(`App rodando na porta: ${port}`);
    });
});