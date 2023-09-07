const express = require('express');
const orders_router = express.Router();

const orders_controller = require('../controller/orders_controller')

orders_router.get('/', orders_controller.get_all_orders)
orders_router.post('/', orders_controller.create_order)
orders_router.post('/insert_orders', orders_controller.insert_inbounded_orders)

module.exports = orders_router