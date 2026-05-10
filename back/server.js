require('dotenv').config();

const express = require('express');
const path = require('path');
const cors = require('cors');

const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const researchRoutes = require('./src/routes/researchRoutes'); // On garde celle-ci si c'est l'API externe
const documentRoutes = require('./src/routes/documentRoutes'); // <--- LA NOUVELLE ROUTE UNIQUE

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Knowledge Documents API',
            version: '1.0.0',
            description: 'API pour gérer les documents de recherche (JSON Mode)',
            contact: {
                name: 'group 5'
            }
        },
        servers: [
            {
                url: `http://localhost:${PORT}`,
                description: 'Serveur de développement'
            }
        ]
    },
    apis: ['./src/routes/*.js'],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use('/api/research', researchRoutes);
app.use('/api/documents', documentRoutes);

app.use('/files', express.static(path.join(__dirname, 'files')));

app.get('/', (req, res) => {
    res.json({ status: 'OK', message: 'Server is running in JSON Mode' });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Swagger docs available at http://localhost:${PORT}/api-docs`);
});