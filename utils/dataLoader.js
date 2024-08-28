import fs from 'fs';

const dataFilePath = './data/data.json';
const cacheDuration = 60000;
let users = [];
let lastUpdate = 0;

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

const getUsers = () => {
    const timeSinceLastUpdate = Date.now() - lastUpdate;
    if (timeSinceLastUpdate > cacheDuration) {
        loadData();
    }
    return users;
};

// Load data initially
loadData();

// Export functions to access data
export { getUsers, loadData };
