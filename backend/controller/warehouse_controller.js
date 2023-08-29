const db = require('../database/mySQL');




async function getAllWareHouse(req, res) {
    var query = `SELECT * FROM warehouse;`;
    db.query(query, async (err, response) => {
        if (err) {
            console.log(err);
            res.send({"status" : 404});
        }
        else {
            // res.send(response);
            res.send(response);
        }
    });
    // res.send({status: 200});
}




module.exports = {
    getAllWareHouse : getAllWareHouse
}