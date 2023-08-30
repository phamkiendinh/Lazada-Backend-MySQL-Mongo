const { MongoClient } = require('mongodb');
const url = "mongodb+srv://dinhkiennpham:RaidenShogun070599%3A)@lazada.hgeaaoj.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(url);




module.exports = client;