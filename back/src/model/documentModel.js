const { readDb, writeDb } = require('../config/jsonDb');

const getAll = async () => {
    return await readDb();
};

const findByPath = async (path) => {
    const db = await readDb();
    return db.find(doc => doc.path === path);
};

const upsert = async (newDoc) => {
    const db = await readDb();
    const index = db.findIndex(d => d.path === newDoc.path);

    if (index !== -1) {
        db[index] = newDoc;
    } else {
        db.push(newDoc);
    }

    await writeDb(db);
    return newDoc;
};

// Ajout admin

const findById = async (id) => {
    const db = await readDb();
    return db.find(doc => doc.id === Number(id));
};

const remove = async (id) => {
    const db = await readDb();
    const newDb = db.filter(doc => doc.id !== Number(id));
    await writeDb(newDb);
    return { success: true, id };
}

module.exports = { getAll, findByPath, findById, remove, upsert };