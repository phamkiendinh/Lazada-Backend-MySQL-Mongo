const db = require('../database/mySQL');




async function getAllWareHouse(req, res) {
    var query = `SELECT * FROM warehouse;`;
    db.query(query, async (err, response) => {
        if (err) {
            console.log(err);
            res.send(400);
        }
        else {
            // res.send(response);
            res.send(response);
        }
    });
    // res.send({status: 200});
}

async function getWareHouse(req, res) {
    var warehouseID = req.params.warehouseID;
    var query = `SELECT * FROM warehouse WHERE warehouse.id = ?;`;
    db.query(query,[warehouseID], async (err, response) => {
        if (err) {
            console.log(err);
            res.send(400);
        }
        else {
            res.send(response);
        }
    });
}

async function addWareHouse(req, res) {
    const data = req.body;
    // console.log(data);
    var addAddressQuery = `
        INSERT INTO warehouse_address (province, city, district, street, street_number)
        VALUES(?,?,?,?,?);
    `;
    db.query(addAddressQuery, 
        [data.province, data.city, data.district, data.street, data.street_number], 
        async (err, response) => {
        if (err) {
            console.log(err);
            res.send(400);
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
                        res.send(400);
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
                                res.send(400);
                                return;
                            }
                            else {
                                res.send(200);
                                return;
                            }
                        })
                    }
                }
            )
        }
    });
}

function updateWareHouse(req, res) {

}

function deleteWareHouse (req, res) {
    var warehouseID = req.params.warehouseID;
    console.log(warehouseID);
    var query = `
    DELETE FROM warehouse
    WHERE warehouse.id = ?;
    `;
    db.query(query, [warehouseID], async (err, response) => {
        if (err) {
            console.log(err);
            res.send(400);
        }
        else {
            res.send(200);
            return;
        }
    });
}

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
            res.send(400);
        }
        else {
            res.send(response);
            return;
        }
    });
}

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
    getAllWareHouse,
    getWareHouse,
    addWareHouse,
    deleteWareHouse,
    getAllProduct,
    moveProduct,
    updateWareHouse
}