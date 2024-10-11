// Cargar variables de entorno desde el archivo .env
require('dotenv').config();

const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000; // Cambia esto según tu configuración

// Middleware para parsear JSON
app.use(bodyParser.json());

app.post('/webhook', async (req, res) => {
  const { resource } = req.body;

  // Verificar si el evento es un push a la rama master
  if (resource.refUpdates && resource.refUpdates[0].name === 'refs/heads/master') {
    console.log('Push detected on master branch');

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
  const url = 'https://dev.azure.com/{isf-EmergencyManagementOrganization}/{project}/_apis/git/repositories/{repositoryId}/pullRequests?api-version=6.0';

  const data = {
    sourceRefName: 'refs/heads/master',
    targetRefName: 'refs/heads/dev_bblabs',
    title: 'Auto PR from master to dev_bblabs',
    description: 'This PR was automatically created from blackbird-labs',
    reviewers: [] // Opcional, puedes agregar revisores aquí
  };

  try {
    const response = await axios.post(url, data, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.AZURE_PAT}` // Utiliza el PAT desde la variable de entorno
      }
    });

    console.log('PR created successfully:', response.data);
  } catch (error) {
    console.error('Error creating PR:', error);
    throw error;
  }
}

app.listen(PORT, () => {
  console.log(`Webhook service running on port ${PORT}`);
});
