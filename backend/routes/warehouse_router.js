const express = require('express');

const warehouseController = require('../controller/warehouse_controller');

const warehouse_router = express.Router();

warehouse_router.get('/', warehouseController.getAllWareHouse);

module.exports = warehouse_router;