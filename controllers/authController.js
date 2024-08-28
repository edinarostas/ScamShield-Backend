import fs from 'fs';
import jwt from 'jsonwebtoken';
import { v7 as uuidv7 } from 'uuid';
import { getUsers, loadData } from '../utils/dataLoader.js';

const secretKey = process.env.JWT_SECRET;
const dataFilePath = '../data/data.json';

export const signup = (req, res) => {
    let users = getUsers();

    const { username, password } = req.body;

    const userExists = users.find(user => user.username === username);
    if (userExists) {
        return res.status(400).json({ message: 'Username already taken' });
    }

    const newUser = {
        id: uuidv7(),
        username,
        password,
        adverts: []
    };
    users.push(newUser);

    fs.writeFile(dataFilePath, JSON.stringify(users, null, 2), 'utf8', (writeErr) => {
        if (writeErr) {
            console.error('Failed to write data file:', writeErr);
            return res.status(500).json({ error: 'Failed to save user data' });
        }

        const accessToken = jwt.sign({ username: newUser.username, id: newUser.id }, secretKey, { expiresIn: '5h' });
        const userId = newUser.id;
        res.status(201).json({ accessToken, userId });

        loadData();
    });
};

export const login = (req, res) => {
    const users = getUsers();

    const { username, password } = req.body;

    const user = users.find(user => user.username === username && user.password === password);
    if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
    }

    const accessToken = jwt.sign({ username: user.username, id: user.id }, secretKey, { expiresIn: '5h' });
    const userId = user.id;

    res.json({ accessToken, userId });
};
