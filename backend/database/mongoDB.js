const { MongoClient } = require('mongodb');
const url = "mongodb+srv://mongodbdemo:mongodbdemo@cluster0.sg3y69c.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(url);




module.exports = client;