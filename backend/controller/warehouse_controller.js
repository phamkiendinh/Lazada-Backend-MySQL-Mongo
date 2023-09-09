const db = require('../database/mySQL');



// Get all warehouse in mySQL servers
async function getAllWareHouse(req, res) {
    var query = `SELECT * FROM warehouse;`;
    db.query(query, async (err, response) => {
        if (err) {
            console.log(err);
            res.send({status : 400});
        }
        else {
            // res.send(response);
            res.send(response);
        }
    });
    // res.send({status: 200});
}

// Get one warehouse
async function getWareHouse(req, res) {
    var warehouseID = req.params.warehouseID;
    var query = `SELECT * FROM warehouse WHERE warehouse.id = ?;`;
    db.query(query,[warehouseID], async (err, response) => {
        if (err) {
            console.log(err);
            res.send({status : 400});
        }
        else {
            res.send(response);
        }
    });
}

// Add new warehouse
async function addWareHouse(req, res) {
    const data = req.body;
    console.log(data);
    var addAddressQuery = `
        INSERT INTO warehouse_address (province, city, district, street, street_number)
        VALUES(?,?,?,?,?);
    `;
    db.query(addAddressQuery, 
        [data.province, data.city, data.district, data.street, data.street_number], 
        async (err, response) => {
        if (err) {
            console.log(err);
            res.send({status : 400});
            return;
        }
        else {
            // res.send(response);
            var findAddressIDQuery = `
                SELECT id
                FROM warehouse_address
                WHERE warehouse_address.province = ?
                AND warehouse_address.city = ?
                AND warehouse_address.district = ?
                AND warehouse_address.street = ?
                AND warehouse_address.street_number = ?;
            `;
            db.query(findAddressIDQuery, 
                [data.province, data.city, data.district, data.street, data.street_number], 
                async (err, response) => {
                    if (err) {
                        console.log(err);
                        res.send({status : 400});
                        return;
                    }
                    else {
                        var addressID = response[0].id;
                        var addWareHouseQuery = `
                            INSERT INTO warehouse(warehouse_name, address_id, volume, current_volume)
                            VALUES (?,?,?,?);
                        `;
                        db.query(addWareHouseQuery, 
                        [data.warehouse_name, addressID, data.volume, data.current_volume],
                        async(err, response) => {
                            if (err) {
                                console.log(err);
                                res.send({status : 400});
                                return;
                            }
                            else {
                                res.send({status : 400});
                                return;
                            }
                        })
                    }
                }
            )
        }
    });
}

// Count products in a warehouse for warehouse deletion/update
async function countProducts(req, res) {
    var warehouseID = req.params.warehouseID;
    var query = `
        SELECT COUNT(product.id) as count
        FROM product
        WHERE product.wid = ?;
    `;
    db.query(query, [warehouseID], async (err, response) => {
        if (err) {
            console.log(err);
            res.send({status : 400});
        }
        else {
            res.send(response[0]);
            return;
        }
    });
}

// Get warehouse address
async function getAddressID(req, res) {
    var warehouseID = req.params.warehouseID;

    var query = `
        SELECT id
        FROM warehouse_address;
    `;
    db.query(query, [warehouseID], async (err, response) => {
        if (err) {
            console.log(err);
            res.send({status : 400});
        }
        else {
            // console.log(response);
            res.send(response);
            return;
        }
    });
}

// Update warehouse when there are no products inside this warehouse
function updateWareHouse(req, res) {
    var warehouseID = req.params.warehouseID;
    var warehouse_name = req.body.warehouse_name;
    var address_id = req.body.address_id;
    var volume = req.body.volume;
    var current_volume = req.body.current_volume;

    var query = `
    UPDATE warehouse
    SET warehouse.warehouse_name = ?, warehouse.address_id = ?, warehouse.volume = ?, warehouse.current_volume = ?
    WHERE warehouse.id = ?;
    `;

    db.query(query, [warehouse_name,address_id,volume,0, warehouseID], async (err, response) => {
        if (err) {
            console.log(err);
            res.send({status: 400});
        }
        else {
            res.send({status: 200});
            return;
        }
    });
} 

// Delete warehouse when there are no products inside this warehouse
function deleteWareHouse (req, res) {
    var warehouseID = req.params.warehouseID;

    var deleteQuery = `
    DELETE FROM warehouse
    WHERE warehouse.id = ?;
    `;
    db.query(deleteQuery, [warehouseID], async (err, response) => {
        if (err) {
            console.log(err);
            res.send({status : 400});
        }
        else {
            res.send({status : 200});
            return;
        }
    });
}

// Get all product inside a warehouse
function getAllProduct(req, res) {
    var warehouseID = req.params.warehouseID;
    var query = `
        SELECT * 
        FROM product
        WHERE product.wid = ?
    `;
    db.query(query, [warehouseID], async (err, response) => {
        if (err) {
            console.log(err);
            res.send({status : 400});
        }
        else {
            res.send(response);
            return;
        }
    });
}

// Move one product from a warehouse to new warehouse
function moveProduct(req, res) {
    var json = req.body;
    var productID = json.productID;
    var old_warehouse_id = json.old_warehouse_id;
    var new_warehouse_id = json.new_warehouse_id;
    var query = `CALL move_product(?, ?, ?)`;
    console.log(json);
    db.query(query, [productID, old_warehouse_id, new_warehouse_id], async (err, response) => {
        if (err) {
            console.log(err);
            res.send({status : 400});
        }
        else {
            console.log(response);
            res.send(response);
            return;
        }
    });
}   

// Get products that exceeded warehouse volume and move the products when there are available volume in warehouses. 
async function getAllWaitingProducts(req, res) {
    var query = `
        SELECT * from product
        WHERE product.wid IS NULL;
    `;
    db.query(query, async (err, response) => {
        if (err) {
            console.log(err);
            res.send({status : 400});
        }
        else {
            console.log(response);
            res.send(response);
            return;
        }
    });
}

// Delete a waiting product
async function deleteProduct(req, res) {
    var productID = req.params.productID;
    var query = `
        DELETE FROM product
        WHERE product.id = ?;
    `;
    db.query(query, [productID], async (err, response) => {
        if (err) {
            console.log(err);
            res.send({status : 400});
        }
        else {
            console.log(response);
            res.send({status : 200});
            return;
        }
    });
} 


module.exports = {
    getAllWareHouse,
    getWareHouse,
    countProducts,
    addWareHouse,
    deleteWareHouse,
    getAddressID,
    getAllProduct,
    moveProduct,
    updateWareHouse,
    getAllWaitingProducts,
    deleteProduct
}