require('dotenv').config();
const axios = require('axios');
const mongoose = require('mongoose');

const mongoURI = process.env.MONGODB_HOST;
const collectionName = 'words';

const fileUrl =
  'https://raw.githubusercontent.com/dwyl/english-words/refs/heads/master/words_dictionary.json';

const wordSchema = new mongoose.Schema({
  word: { type: String, required: true },
});

const Word = mongoose.model(collectionName, wordSchema);

const main = async () => {
  try {
    await mongoose.connect(mongoURI, {});
    console.log('Conectado ao MongoDB.');

    const response = await axios.get(fileUrl);
    const words = response.data;

    const wordEntries = Object.keys(words).map((key) => ({ word: key }));

    await Word.insertMany(wordEntries);
    console.log(`Inseridos ${wordEntries.length} palavras no banco de dados.`);

    await mongoose.disconnect();
    console.log('Conexão com MongoDB encerrada.');
  } catch (error) {
    console.error('Erro:', error);
  }
};

main();
