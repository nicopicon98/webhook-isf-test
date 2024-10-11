// Cargar variables de entorno desde el archivo .env
require('dotenv').config();

const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000; // Cambia esto según tu configuración

// Middleware para parsear JSON
app.use(bodyParser.json());

app.get("/test", (req, res) => {
  res.send("Hello World!");
});

app.post('/webhook', async (req, res) => {
  const { resource } = req.body;
  console.log("resource: ", resource);
  console.log("req.body:", req.body);

  // Verificar si el evento es un push a la rama master
  if (resource.refUpdates && resource.refUpdates[0].name === 'refs/heads/master') {
    console.log('Push detected on master branch uwu');

    console.log("resource.refUpdates", resource.refUpdates);

    try {
      // Llamar a la función para crear PR en el repositorio destino
      await createPullRequest();
      res.status(200).send('Webhook processed successfully');
    } catch (error) {
      console.error('Error creating pull request:', error);
      res.status(500).send('Failed to process webhook');
    }
  } else {
    res.status(400).send('Not a push to master branch');
  }
});

// Función para crear Pull Request en la organización de destino
async function createPullRequest() {
  const url = 'https://dev.azure.com/ISF-TEST/ARRO-PROYECT/_apis/git/repositories/a896767a-88fd-4f40-9620-480f8e252b51/pullRequests?api-version=6.0';

  const data = {
    sourceRefName: 'refs/heads/master',
    targetRefName: 'refs/heads/dev_bblabs',
    title: 'Auto PR from master to dev_bblabs',
    description: 'This PR was automatically created from blackbird-labs',
    reviewers: []
  };

  const token = process.env.KEVIN_AZURE_PAT;
  const encodedPat = Buffer.from(`:${token}`).toString('base64');

  try {
    const response = await axios.post(url, data, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${encodedPat}`
      }
    });

    console.log('PR created successfully:', response.data);
  } catch (error) {
    console.error('Error creating PR:', error.response ? error.response.data : error.message);
    throw error;
  }
}


app.listen(PORT, () => {
  console.log(`Webhook service running on port ${PORT}`);
});
