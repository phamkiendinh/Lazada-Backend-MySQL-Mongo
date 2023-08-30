const express = require('express');

const warehouseController = require('../controller/warehouse_controller');

const warehouse_router = express.Router();

warehouse_router.get('/', warehouseController.getAllWareHouse);
warehouse_router.get('/:warehouseID', warehouseController.getWareHouse);
warehouse_router.post('/create', warehouseController.addWareHouse);
warehouse_router.delete('/:warehouseID/delete', warehouseController.deleteWareHouse);
warehouse_router.put('/:warehouseID/update', warehouseController.updateWareHouse);

warehouse_router.get('/:warehouseID/products', warehouseController.getAllProduct);
warehouse_router.post('/:warehouseID/products/move', warehouseController.moveProduct);

module.exports = warehouse_router;