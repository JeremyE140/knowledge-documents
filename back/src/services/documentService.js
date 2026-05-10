const documentModel = require('../model/documentModel');

const search = async(termsArray) => {
    const allDocs = await documentModel.getAll();

    if (!termsArray || termsArray.length === 0) return allDocs;

    const lowerTerms = termsArray.map(t => t.toLowerCase());

    return allDocs.filter(doc => {
        if (!doc.keywords || !Array.isArray(doc.keywords)) return false;
        return doc.keywords.some(docKeyword =>
            lowerTerms.some(term => docKeyword.toLowerCase().includes(term))
        );
    })
};

const addKeywordsToPath = async (path, keywordsArray, type)  => {
    let doc = await documentModel.findByPath(path);

    if (!doc) {

        const fileName = path.split('/').pop();
        doc = {
            id: Date.now(),
            path: path,
            name: fileName,
            type: type,
            keywords: []
        };
    }

    keywordsArray.forEach(newWord => {
        const cleanWord = newWord.trim();
        const exists = doc.keywords.some(k => k.toLowerCase() === cleanWord.toLowerCase());
        if (!exists && cleanWord !== "") {
            doc.keywords.push(cleanWord);
        }
    });
    return await documentModel.upsert(doc);
}

// Fonctions admin

const getAllDocuments = async() => {
    return await documentModel.getAll();
}

const createDocument = async(path, name, type, keywords) => {
    const existingDoc = await documentModel.findByPath(path);
    if (existingDoc) throw new Error("Un document avec de chemin existe déjà");

    const newDoc = {
        id: Date.now(),
        path: path,
        name: name,
        type: type,
        keywords: Array.isArray(keywords) ? keywords : []
    };
    return await documentModel.upsert(newDoc);
};

const updateDocument = async (id, name, type, keywords) => {
    const doc = await documentModel.findById(id);
    if (!doc) throw new Error("Document introuvable");

    if (name) doc.name = name;
    if (type) doc.type = type;
    if (Array.isArray(keywords)) {
        doc.keywords = keywords;
    }
    return await documentModel.upsert(doc);
};

const deleteDocument = async (id) => {
    return await documentModel.remove(id);
}

module.exports = {
    search,
    addKeywordsToPath,
    getAllDocuments,
    createDocument,
    updateDocument,
    deleteDocument
};