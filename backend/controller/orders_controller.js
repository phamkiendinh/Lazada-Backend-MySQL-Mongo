const db = require('../database/mySQL.js')
const async = require('async');
async function create_order(req, res) {
    const { pid, quantity } = req.body;
    const query = `INSERT INTO product_order (template_id, product_quantity) VALUES (?, ?);`;
    const values = [ pid, quantity ];

    db.query(query, values, async (err, result) => {
        if (err) {
            console.error('Error creating order:', err);
            res.status(500).json({ error: 'Error creating order' });
        } else {
            res.status(200).json({ message: 'Order created successfully', orderId: result.insertId });
        }
    });
}

async function get_all_orders(req, res) {
    const query = `SELECT o.id as id, p.title as pname, o.product_quantity as quantity, o.order_status as status FROM product_order o, product_template p WHERE o.template_id = p.id;`;
    
    db.query(query, async (err, results) => {
        if (err) {
            console.error('Error fetching order:', err);
            res.status(500).json({ error: 'Error fetching order' });
        } else {
            res.status(200).json(results);
        }
    });
}

async function insert_inbounded_orders(req, res) {
    const { pid, quantity, volume } = req.body;
    const query = `CALL insert_product (?, ?);`;
    const values = [ pid, volume ];

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
    create_order, 
    get_all_orders, 
    insert_inbounded_orders
}