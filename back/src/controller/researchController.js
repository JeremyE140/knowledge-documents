const researchService = require('../services/researchService');

const ask = async(req,res) => {
    try {
        const { question } = req.body;

        if (!question) {
            return res.status(400).json({ error: "La question est requise."});
        }

        const generatedKeywords = question
            .toLowerCase()
            .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, " ")
            .split(/\s+/)
            .filter(w => w.length > 2);

        console.log(`🔎 Question reçue: "${question}"`);
        console.log(`🔑 Mots-clés générés: [${generatedKeywords.join(', ')}]`);

        const result = await researchService.askRag(question, generatedKeywords);

        res.status(200).json(result);

    } catch(error) {
        console.error("Erreur Research Controller:", error.message);

        if (error.message.includes("IA est indisponible")) {
            return res.status(503).json({ error: error.message});
        }

        res.status(500).json({ error: "Erreur interne lors du traitement de la question."});
    }
};

module.exports = { ask };