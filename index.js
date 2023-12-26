const express = require('express');
const fs = require('fs');
const { promisify } = require('util');
const pdf = require('pdf-parse');
const Tesseract = require('tesseract.js');

const readFileAsync = promisify(fs.readFile);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

async function extractTextFromPDF(pdfData) {
  const data = await pdf(pdfData);
  return data.text;
}

async function extractTextFromImages(imageBuffer) {
  const result = await Tesseract.recognize(imageBuffer, { lang: 'eng' });
  return result.text;
}

app.get('/', (req, res) => {
  res.send('Welcome to the API!');
});

app.post('/extractText', async (req, res) => {
  try {
    const { pdfData, imageData } = req.body;

    if (pdfData) {
      const text = await extractTextFromPDF(Buffer.from(pdfData, 'base64'));
      res.json({ text });
    } else if (imageData) {
      const text = await extractTextFromImages(Buffer.from(imageData, 'base64'));
      res.json({ text });
    } else {
      res.status(400).json({ error: 'Invalid request. Provide either pdfData or imageData.' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
