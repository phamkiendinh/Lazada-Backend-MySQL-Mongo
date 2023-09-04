const db = require('../database/mySQL.js')

async function create_order(req, res) {
    const { pid, quantity, status } = req.body;
    const query = `INSERT INTO product_order (pid, quantity, status) VALUES (?, ?, ?);`;
    const values = [ pid, quantity, status ];

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

module.exports = {
    create_order, 
    get_all_orders
}