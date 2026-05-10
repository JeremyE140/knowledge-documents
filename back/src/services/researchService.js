const axios = require('axios');

const documentService = require('./documentService');

const RAG_API_URL = process.env.RAG_API_URL;

const askRag = async (question, keywords) => {
    let termsArray = [];

    if (Array.isArray(keywords)) {
        termsArray = keywords;
    } else if (typeof keywords === 'string') {
        termsArray = keywords.split(',').map(t => t.trim()).filter(t => t !== ""); // Cas legacy (postman direct)
    }
    const allDocs = await documentService.search(termsArray);

    const docsForAi = allDocs.filter(doc => doc.type === 'pdf');

    let aiAnswer = "Aucun document texte pertinent pour répondre, mais voici les médias trouvés.";

    if (docsForAi.length > 0) {
        const payload = {
            pdfs: docsForAi.map(doc => ({
                url: doc.path,
                title: doc.name,
                type: 'pdf'
            })),
            question: question
        };

        try {
            const response = await axios.post(RAG_API_URL, payload);
            aiAnswer = response.data.answer;
        } catch (error) {
            console.error("Erreur RAG :", error.message);
            aiAnswer = "Erreur lors de l'analyse des documents textes.";
        }
    } else if (allDocs.length === 0) {
        aiAnswer = "Je n'ai rien trouvé du tout.";
    }

    return {
        answer: aiAnswer,
        foundDocs: allDocs,
        stats: {
            totalFound: allDocs.length,
            analyzedByAi: docsForAi.length
        }
    };

};

module.exports = { askRag };