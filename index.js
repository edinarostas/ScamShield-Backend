import express from 'express';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import 'dotenv/config'
import usersData from './data/data.json' assert { type: "json" };

const app = express();
const port = process.env.PORT;

app.use(express.json());
app.use(cors());

const secretKey = process.env.JWT_SECRET;
const users = usersData.map((user) => ({
    id: user.id,
    username: user.username,
    password: user.password,
    adverts: user.adverts || [],
}))

console.log(users);

// Middleware to authenticate JWT tokens
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return res.sendStatus(401); // No token provided

    jwt.verify(token, secretKey, (err, user) => {
        if (err) return res.sendStatus(403); // Invalid token
        req.user = user;
        next();
    });
};

app.post('/signup', (req, res) => {
    const { username, password } = req.body;

    // Check if the username already exists
    const userExists = users.find(user => user.username === username);
    if (userExists) {
        return res.status(400).json({ message: 'Username already taken' });
    }

    // Add new user to the "database"
    const newUser = { id: users.length + 1, username, password, adverts: [] };
    users.push(newUser);

    res.status(201).json({ message: 'User registered successfully' });
});

// Login
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Check if the user exists
    const user = users.find(user => user.username === username && user.password === password);
    if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate a JWT token
    const accessToken = jwt.sign({ username: user.username, id: user.id }, secretKey, { expiresIn: '1h' });

    res.json({ accessToken });
});

app.get('/adverts', authenticateToken, (req, res) => {
    const loggedInUserId = req.user.id;

    // Collect all adverts except those from the logged-in user
    const adverts = users
        .filter(user => user.id !== loggedInUserId)
        .flatMap(user => user.adverts);

    res.json({
        tokenInfo: req.jwtPayload,
        adverts: adverts,
    });
});

app.listen(port, () => {
    console.log(`Listening on ${port}`);
});