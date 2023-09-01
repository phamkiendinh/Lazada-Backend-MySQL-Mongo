const client = require('../database/mongoDB.js');
const db = require('../database/mySQL.js');

async function getAllProduct(req, res) {
    const json = req.body;
    const query = `SELECT * from product WHERE product.wid IS NOT NULL`;
    db.query(query, async (err, response) => {
        if (err) {
            console.log(err);
            res.send({status:400});
        }
        else {
            console.log(response);
            res.send(response);
            return;
        }
    });
}


async function countProducts(req, res) {
    const templateID = req.params.templateID;
    const query = `SELECT COUNT(product.id) AS count from product WHERE product.template_id = ?;`;
    db.query(query, [templateID], async (err, response) => {
        if (err) {
            console.log(err);
            res.send({status:400});
        }
        else {
            console.log(response);
            res.send(response);
            return;
        }
    });
}

module.exports = {
    getAllProduct,
    countProducts
}

