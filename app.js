require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('./Models/User');
const Event = require('./models/Event');

const app = express();

app.use(express.json());
app.use(express.static(__dirname));

app.get('/', (req, res) => {
    res.status(200).json({ message: 'Bem-vindo à nossa API!' });
});

app.get("/user/:id", checkToken, getUserById);
app.post('/auth/register', registerUser);
app.post('/auth/login', loginUser);
app.post('/events', createEvent);
app.get('/events', listEvents);
app.get('/events/:id', getEventById);
app.put('/events/:id', updateEvent);
app.delete('/events/:id', deleteEvent);

const dbuser = process.env.DB_USER;
const dbpassword = process.env.DB_PASS;

mongoose.connect(`mongodb+srv://${dbuser}:${dbpassword}@cluster0.vvcbqe7.mongodb.net/?retryWrites=true&w=majority`)
    .then(() => {
        app.listen(3000);
        console.log('Conectou ao banco e servidor rodando na porta 3000');
    })
    .catch(err => console.log(err));

function checkToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) return res.status(401).json({ msg: "Acesso negado!" });

    try {
        const secret = process.env.SECRET;
        jwt.verify(token, secret);
        next();
    } catch (err) {
        res.status(400).json({ msg: "O Token é inválido!" });
    }
}

async function getUserById(req, res) {
    const id = req.params.id;
    const user = await User.findById(id, "-password");
    if (!user) {
        return res.status(404).json({ msg: "Usuário não encontrado!" });
    }
    res.status(200).json({ user });
}

async function registerUser(req, res) {
    const { name, email, password, confirmPassword } = req.body;
    if (!name) return res.status(422).json({ message: "O nome é obrigatório" });
    if (!email) return res.status(422).json({ message: "O email é obrigatório" });
    if (!password) return res.status(422).json({ message: "A senha é obrigatória" });
    if (password != confirmPassword) return res.status(422).json({ msg: "As senhas não conferem" });

    const userExists = await User.findOne({ email: email });
    if (userExists) {
        return res.status(422).json({ msg: "Por favor, utilize outro e-mail!" });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = new User({
        name,
        email,
        password: passwordHash,
    });

    try {
        await user.save();
        res.status(201).json({ msg: "Usuário criado com sucesso!" });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
}

async function loginUser(req, res) {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
        return res.status(400).json({ msg: "E-mail ou senha incorretos." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(400).json({ msg: "E-mail ou senha incorretos." });
    }

    const payload = {
        userId: user.id,
        name: user.name
    };

    const token = jwt.sign(payload, process.env.SECRET, { expiresIn: '1h' });
    res.json({ token });
}

async function createEvent(req, res) {
    try {
        const event = new Event(req.body);
        await event.save();
        res.status(201).json(event);
    } catch (error) {
        res.status(500).send(error.message);
    }
}

async function listEvents(req, res) {
    try {
        const events = await Event.find();
        res.status(200).json(events);
    } catch (error) {
        res.status(500).send(error.message);
    }
}

async function getEventById(req, res) {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).send("Evento não encontrado.");
        res.status(200).json(event);
    } catch (error) {
        res.status(500).send(error.message);
    }
}

async function updateEvent(req, res) {
    try {
        const updatedEvent = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedEvent) return res.status(404).send("Evento não encontrado.");
        res.status(200).json(updatedEvent);
    } catch (error) {
        res.status(500).send(error.message);
    }
}

async function deleteEvent(req, res) {
    try {
        const deletedEvent = await Event.findByIdAndDelete(req.params.id);
        if (!deletedEvent) return res.status(404).send("Evento não encontrado.");
        res.status(200).json({ message: "Evento deletado com sucesso." });
    } catch (error) {
        res.status(500).send(error.message);
    }
}