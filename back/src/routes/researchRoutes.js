const express = require('express');
const router = express.Router();
const researchController = require('../controller/researchController');

/**
 * @swagger
 * tags:
 *   - name: Research
 *     description: Tests directs du module RAG (Debug)
 */

/**
 * @swagger
 * /api/research/ask:
 *   post:
 *     summary: Tester le RAG (Méthode POST)
 *     description: |
 *       Route de test alternative.
 *       Fonctionne exactement comme le GET /search
 *       mais permet d'envoyer la question dans le body JSON.
 *     tags:
 *       - Research
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - question
 *             properties:
 *               question:
 *                 type: string
 *                 example: Quelle est la surprise de la monétique ?
 *     responses:
 *       200:
 *         description: Réponse structurée (IA + Documents)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 answer:
 *                   type: string
 *                   description: Réponse de l'assistant
 *                 foundDocs:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                       path:
 *                         type: string
 *                       type:
 *                         type: string
 *                 stats:
 *                   type: object
 *       503:
 *         description: Service IA indisponible (mais retourne quand même les docs si possible)
 */
router.post('/ask', researchController.ask);

module.exports = router;
