const express = require('express');
const orders_router = express.Router();

const orders_controller = require('../controller/orders_controller')

orders_router.post('/insert_orders', orders_controller.insert_inbounded_orders)

module.exports = orders_router