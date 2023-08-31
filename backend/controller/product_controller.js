const client = require('../database/mongoDB.js');
const db = require('../database/mySQL.js');

async function getAllProduct(req, res) {
    const json = req.body;
    const query = `SELECT * from product`;
    db.query(query, async (err, response) => {
        if (err) {
            console.log(err);
            res.send(400);
        }
        else {
            console.log(response);
            res.send(response);
            return;
        }
    });
}

module.exports = {
    getAllProduct
}