const fs = require('fs').promises;
const path = require('path');

const dbPath = path.join(__dirname, 'db.json');

const readDb = async () => {
    try {
        const data = await fs.readFile(dbPath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
};

const writeDb = async (data) => {
    await fs.writeFile(dbPath, JSON.stringify(data, null, 4)); // 4 = indentation jolie
};

module.exports = { readDb, writeDb };