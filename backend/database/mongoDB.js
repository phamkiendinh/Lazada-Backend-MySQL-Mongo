const { MongoClient } = require('mongodb');

// Update this url if neededd
const url = "mongodb+srv://mongodbdemo:mongodbdemo@cluster0.sg3y69c.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(url);




module.exports = client;