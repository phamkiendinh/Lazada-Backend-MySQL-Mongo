const db = require('../database/mySQL.js')
const async = require('async');

// Create products from product_template 
async function insert_inbounded_orders(req, res) {
    const { pid, quantity, volume } = req.body;
    const query = `CALL insert_product (?, ?);`;
    const values = [ pid, volume ];

    // For loop run the query 'quantity' times
    async.eachSeries(
        Array.from({ length: quantity }, (_, i) => i),
        (i, callback) => {
            db.query(query, values, (err, result) => {
                if (err) {
                    callback(err);
                } else {
                    callback();
                }
            });
        },
        (err) => {
            if (err) {
                res.status(500).json({ error: 'Error creating order' });
            } else {
                res.status(200).json({ message: 'Order created successfully' });
            }
        }
    );
}

module.exports = {
    insert_inbounded_orders
}