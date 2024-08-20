import express from 'express';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import fs from 'fs';
import 'dotenv/config';
import { v7 as uuidv7 } from 'uuid';
import { detectScamMessage } from './detectScamMessage.js';

const app = express();
const port = process.env.PORT;
const dataFilePath = './data/data.json';
const cacheDuration = 60000;

let users = [];
let lastUpdate = 0;

app.use(express.json());
app.use(cors());

const secretKey = process.env.JWT_SECRET;

// Middleware to authenticate JWT tokens
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token === null) return res.sendStatus(401); // No token provided

    jwt.verify(token, secretKey, (error, user) => {
        if (error) return res.sendStatus(403); // Invalid token
        req.user = user;
        next();
    });
};

const loadData = () => {
    fs.readFile(dataFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Failed to read data file:', err);
            return;
        }
        try {
            users = JSON.parse(data);
            lastUpdate = Date.now();
        } catch (parseError) {
            console.error('Failed to parse data file:', parseError);
        }
    });
};

loadData();

setInterval(() => {
    const timeSinceLastUpdate = Date.now() - lastUpdate;
    if (timeSinceLastUpdate > cacheDuration) {
        loadData();
    }
}, cacheDuration);

app.post('/signup', (req, res) => {
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
    });
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;

    const user = users.find(user => user.username === username && user.password === password);
    if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
    }

    const accessToken = jwt.sign({ username: user.username, id: user.id }, secretKey, { expiresIn: '5h' });
    const userId = user.id;

    res.json({ accessToken, userId });
});

app.get('/adverts/:id', authenticateToken, (req, res) => {
    const loggedInUserId = req.user.id;

    const adverts = users
        .filter(user => user.id !== loggedInUserId)
        .flatMap(user =>
            user.adverts.map(advert => ({
                ...advert,
                username: user.username
            }))
        );

    res.json({
        tokenInfo: req.user,
        adverts: adverts,
    });
});

app.get('/messages/:id', authenticateToken, (req, res) => {
    const loggedInUserId = req.user.id;

    const loggedInUser = users.find(user => user.id === loggedInUserId);
    if (!loggedInUser) return res.status(404).json({ error: 'User not found' });

    const involvedConversations = users.flatMap(user =>
        user.adverts.flatMap(advert => {
            const userConversations = advert.conversations.filter(conversation =>
                conversation.messages.some(message => message.sender === loggedInUser.username)
            );

            return userConversations.length > 0 ? {
                advertId: advert.id,
                advertTitle: advert.title,
                advertPhoto: advert.photo,
                advertPrice: advert.price,
                username: user.username,
                conversations: userConversations.map(conversation => ({
                    conversationId: conversation.id,
                    messages: conversation.messages.map(message => ({
                        messageId: message.id,
                        timestamp: message.timestamp,
                        sender: message.sender,
                        message: message.message,
                        advertId: advert.id,
                        conversationId: conversation.id,
                        scamAlert: message.scamAlert
                    }))
                }))
            } : null;
        })
    ).filter(advert => advert !== null);

    res.json({
        tokenInfo: req.user,
        adverts: involvedConversations,
    });
});

app.post('/messages/:advertId/conversations/:conversationId', authenticateToken, async (req, res) => {
    const loggedInUserId = req.user.id;
    const { advertId, conversationId } = req.params;
    const { message } = req.body;

    if (!message) return res.status(400).json({ error: 'Message content is required' });

    const user = users.find(user => user.id === loggedInUserId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    let foundAdvert = null;
    let foundConversation = null;

    for (const otherUser of users) {
        const advert = otherUser.adverts.find(advert => advert.id === advertId);
        if (advert) {
            foundAdvert = advert;
            foundConversation = advert.conversations.find(conversation => conversation.id === conversationId);
            if (foundConversation) {
                break;
            }
        }
    }

    if (!foundAdvert) return res.status(404).json({ error: 'Advert not found' });
    if (!foundConversation) {
        foundConversation = {
            id: conversationId,
            messages: []
        };
        foundAdvert.conversations.push(foundConversation);
    }

    const isScam = await detectScamMessage(message);
    const scamAlert = isScam === "I think it is a scam message." ? true : false;

    const newMessage = {
        id: uuidv7(),
        timestamp: new Date().toISOString(),
        sender: user.username,
        message,
        scamAlert
    };

    foundConversation.messages.push(newMessage);

    fs.writeFile(dataFilePath, JSON.stringify(users, null, 2), 'utf8', (writeErr) => {
        if (writeErr) return res.status(500).json({ error: 'Failed to write data file' });

        res.json({
            message: 'Message added successfully',
            conversation: foundConversation,
            scamAlert
        });
    });
});

app.get('/username', authenticateToken, (req, res) => {
    const loggedInUserId = req.user.id;
    const user = users.find(user => user.id === loggedInUserId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({ username: user.username });
});

app.get('/advert/:id', authenticateToken, (req, res) => {
    const { id } = req.params;

    let foundAdvert = null;
    for (const user of users) {
        const advert = user.adverts.find(advert => advert.id === id);
        if (advert) {
            foundAdvert = {
                ...advert,
                username: user.username
            };
            break;
        }
    }

    if (!foundAdvert) {
        return res.status(404).json({ error: 'Advert not found' });
    }

    res.json({ advert: foundAdvert });
});

app.listen(port, () => {
    console.log(`Listening on ${port}`);
});
