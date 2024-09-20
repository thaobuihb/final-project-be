const mongoose = require('mongoose');
const csvtojson = require('csvtojson');
const fs = require('fs');
const Book = require('./models/Book'); 
require('dotenv').config();

const csvFilePath = './bookData2.csv';
const jsonFilePath = './data.json';

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB Cloud');
    return csvtojson().fromFile(csvFilePath);
  })
  .then((jsonObj) => {
    fs.writeFileSync(jsonFilePath, JSON.stringify(jsonObj, null, 2), 'utf-8');
    console.log('Data has been written to data.json');

    return Book.insertMany(jsonObj);
  })
  .then(() => {
    console.log('Books have been inserted into the database');
    mongoose.disconnect(); 
  })
  .catch((error) => {
    console.error('Error during the process:', error);
  });
