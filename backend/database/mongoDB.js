const { MongoClient } = require('mongodb');
const url = "mongodb+srv://s3878568:Prolathe19%40%40@learning.tmfbhbx.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(url);




module.exports = client;