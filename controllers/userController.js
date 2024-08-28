import { getUsers } from '../utils/dataLoader.js';

export const getUsername = (req, res) => {
    const users = getUsers();
    const loggedInUserId = req.user.id;
    const user = users.find(user => user.id === loggedInUserId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({ username: user.username });
};
