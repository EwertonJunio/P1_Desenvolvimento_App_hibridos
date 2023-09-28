const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.send('Olá Docker! Atualização!');
});

module.exports = router;