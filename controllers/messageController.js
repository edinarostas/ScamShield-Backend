import fs from 'fs';
import { v7 as uuidv7 } from 'uuid';
import { detectScamMessage } from '../detectScamMessage.js';
import { getUsers } from '../utils/dataLoader.js';
const dataFilePath = '../data/data.json';

export const getMessages = (req, res) => {
    const loggedInUserId = req.user.id;
    const users = getUsers();

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
};

export const addMessage = async (req, res) => {
    const users = getUsers();
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
};
