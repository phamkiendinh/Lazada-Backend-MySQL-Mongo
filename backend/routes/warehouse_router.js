const express = require('express');

const warehouseController = require('../controller/warehouse_controller');

const warehouse_router = express.Router();

warehouse_router.get('/', warehouseController.getAllWareHouse);
warehouse_router.get('/:warehouseID', warehouseController.getWareHouse);
warehouse_router.post('/create', warehouseController.addWareHouse);
warehouse_router.delete('/:warehouseID/delete', warehouseController.deleteWareHouse);
warehouse_router.put('/:warehouseID/update', warehouseController.updateWareHouse);
warehouse_router.get('/:warehouseID/update/address', warehouseController.getAddressID);


warehouse_router.get('/:warehouseID/products', warehouseController.getAllProduct);
warehouse_router.post('/:warehouseID/products/move', warehouseController.moveProduct);
warehouse_router.get('/products/waiting', warehouseController.getAllWaitingProducts);
warehouse_router.delete('/products/waiting/:productID', warehouseController.deleteProduct);

warehouse_router.get('/:warehouseID/products/count', warehouseController.countProducts);


module.exports = warehouse_router;