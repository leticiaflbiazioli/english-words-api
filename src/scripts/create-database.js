require('dotenv').config();
const axios = require('axios');
const mongoose = require('mongoose');

const mongoURI = process.env.MONGODB_HOST;
const collectionName = 'entries';

const fileUrl =
  'https://raw.githubusercontent.com/dwyl/english-words/refs/heads/master/words_dictionary.json';

const entrySchema = new mongoose.Schema({
  entry: { type: String, required: true },
});

const Entry = mongoose.model(collectionName, entrySchema);

const main = async () => {
  try {
    await mongoose.connect(mongoURI, {});
    console.log('Conectado ao MongoDB.');

    const response = await axios.get(fileUrl);
    const entries = response.data;

    const wordEntries = Object.keys(entries).map((key) => ({ entry: key }));

    await Entry.insertMany(wordEntries);
    console.log(`Inseridos ${wordEntries.length} palavras no banco de dados.`);

    await mongoose.disconnect();
    console.log('Conexão com MongoDB encerrada.');
  } catch (error) {
    console.error('Erro:', error);
  }
};

main();
