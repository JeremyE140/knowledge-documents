const express = require('express');
const router = express.Router();
const documentController = require('../controller/documentController');

/**
 * @swagger
 * tags:
 *   - name: Documents
 *     description: Moteur de recherche hybride et gestion des documents
 */

/**
 * @swagger
 * /api/documents/search:
 *   get:
 *     summary: Recherche intelligente (IA + Mots-clés)
 *     description: |
 *       Point d'entrée principal pour le Frontend.
 *       Prend une phrase utilisateur, la nettoie, cherche les médias (PDF, Youtube, Images)
 *       et interroge le RAG si des PDFs sont trouvés.
 *     tags:
 *       - Documents
 *     parameters:
 *       - in: query
 *         name: keywords
 *         required: true
 *         schema:
 *           type: string
 *         description: 'La question ou phrase de recherche (ex: Je veux une vidéo sur les DAB)'
 *     responses:
 *       200:
 *         description: Succès - Retourne la réponse IA et les documents
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 answer:
 *                   type: string
 *                   description: Réponse textuelle générée par l'IA
 *                   example: Voici les informations trouvées sur les DAB...
 *                 foundDocs:
 *                   type: array
 *                   description: Liste des documents trouvés
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       path:
 *                         type: string
 *                       name:
 *                         type: string
 *                       type:
 *                         type: string
 *                         enum:
 *                           - pdf
 *                           - youtube
 *                           - image
 *                       keywords:
 *                         type: array
 *                         items:
 *                           type: string
 *                 stats:
 *                   type: object
 *                   properties:
 *                     totalFound:
 *                       type: integer
 *                     analyzedByAi:
 *                       type: integer
 */
router.get('/search', documentController.search);

/**
 * @swagger
 * /api/documents/add-keyword:
 *   post:
 *     summary: Ajouter des mots-clés à un document (Admin)
 *     tags:
 *       - Documents
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - path
 *               - keywords
 *               - type
 *             properties:
 *               path:
 *                 type: string
 *                 description: Chemin local ou URL
 *               keywords:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Liste des mots-clés à ajouter
 *               type:
 *                 type: string
 *                 enum:
 *                   - pdf
 *                   - youtube
 *                   - image
 *     responses:
 *       201:
 *         description: Mots-clés ajoutés avec succès
 */
router.post('/add-keyword', documentController.addKeyword);

/**
 * @swagger
 * tags:
 *   - name: Admin
 *     description: CRUD complet des documents
 */

/**
 * @swagger
 * /api/documents/admin/all:
 *   get:
 *     summary: Récupérer tous les documents
 *     tags:
 *       - Admin
 *     responses:
 *       200:
 *         description: Liste complète brute
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   name:
 *                     type: string
 *                   type:
 *                     type: string
 *                   path:
 *                     type: string
 *                   keywords:
 *                     type: array
 *                     items:
 *                       type: string
 */
router.get('/admin/all', documentController.getAll);

/**
 * @swagger
 * /api/documents/admin/create:
 *   post:
 *     summary: Créer manuellement un document
 *     tags:
 *       - Admin
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - path
 *               - name
 *               - type
 *             properties:
 *               path:
 *                 type: string
 *               name:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum:
 *                   - pdf
 *                   - youtube
 *                   - image
 *               keywords:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Créé avec succès
 */
router.post('/admin/create', documentController.create);

/**
 * @swagger
 * /api/documents/admin/update:
 *   post:
 *     summary: Modifier un document existant
 *     tags:
 *       - Admin
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *             properties:
 *               id:
 *                 type: integer
 *               name:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum:
 *                   - pdf
 *                   - youtube
 *                   - image
 *               keywords:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Modifié avec succès
 */
router.post('/admin/update', documentController.update);

/**
 * @swagger
 * /api/documents/admin/delete:
 *   post:
 *     summary: Supprimer un document
 *     tags:
 *       - Admin
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *             properties:
 *               id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Supprimé avec succès
 */
router.post('/admin/delete', documentController.remove);

module.exports = router;
