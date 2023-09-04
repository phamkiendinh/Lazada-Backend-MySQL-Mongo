const express = require('express');
const orders_router = express.Router();

const orders_controller = require('../controller/orders_controller')

orders_router.get('/', orders_controller.get_all_orders)
orders_router.post('/', orders_controller.create_order)


module.exports = orders_router