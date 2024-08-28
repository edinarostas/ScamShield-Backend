import { getUsers } from '../utils/dataLoader.js';

export const getOtherUserAdverts = (req, res) => {
    const loggedInUserId = req.user.id;
    const users = getUsers();

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
};

export const getAdvertById = (req, res) => {
    const { id } = req.params;
    const users = getUsers();

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
};
