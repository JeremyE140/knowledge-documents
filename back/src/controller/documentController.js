const documentService = require('../services/documentService');
const researchService = require('../services/researchService');

const search = async (req, res) => {
    try {
        const rawQuestion = req.query.keywords;

        if (!rawQuestion) {
            return res.status(200).json({ answer: "", foundDocs: [] });
        }

        const stopWords = [
            "quelle", "quelles", "quel", "quels", "est", "sont",
            "comment", "pourquoi", "lorsque", "puisque",
            "cette", "votre", "notre", "leurs", "avoir", "faire",
            "les", "des", "une", "dans", "pour", "sur"
        ];

        const generatedKeywords = rawQuestion
            .toLowerCase()
            .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, " ")
            .split(/\s+/)
            .map(w => w.trim())
            .filter(w => w.length > 2 && !stopWords.includes(w));

        console.log(`🔎 (GET) Question: "${rawQuestion}"`);
        console.log(`🔑 Mots-clés: [${generatedKeywords.join(', ')}]`);

        const result = await researchService.askRag(rawQuestion, generatedKeywords);

        res.status(200).json(result);

    } catch (error) {
        console.error(error);
        res.status(500).json({error: "Erreur serveur"});
    }
};

const addKeyword = async(req, res) => {
    try {
        const { path, keywords, type } = req.body;

        if (!path || !keywords || !Array.isArray(keywords) || !type ) {
            return res.status(400).json({error: "Path et word requis"});
        }
        const result = await documentService.addKeywordsToPath(path, keywords, type);

        res.status(201).json({
            message: "Mot clé ajouté avec succès",
            data: result
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({error: "Erreur serveur"});
    }
};

// Admin

const getAll = async(req, res) => {
    try {
        const docs = await documentService.getAllDocuments();
        res.status(200).json(docs);
    } catch (error) {
        res.status(500).json({error: "Erreur serveur"});
    }
}

const create = async (req, res) => {
    try {
        const { path, name, type, keywords } = req.body;
        if (!path || !name || !type) return res.status(400).json({error: "Champs requis"});

        const doc = await documentService.createDocument(path, name, type, keywords);
        res.status(201).json(doc);
    } catch (error) {
        res.status(500).json({error: error.message});
    }
};

const update = async (req, res) => {
    try {
        const { id, name, type, keywords } = req.body;
        if (!id) return res.status(400).json({error: "ID requis"});

        const doc = await documentService.updateDocument(id, name, type, keywords);
        res.status(200).json(doc);
    } catch (error) {
        res.status(500).json({error: error.message});
    }
}

const remove = async (req, res) => {
    try {
        const { id } = req.body;
        if (!id) return res.status(400).json({error: "ID requis"});

        await documentService.deleteDocument(id);
        res.status(200).json({message: "Document supprimé"});
    } catch(error) {
        res.status(500).json({error: error.message});
    }
}

module.exports = { search, getAll, create, update, remove, addKeyword };