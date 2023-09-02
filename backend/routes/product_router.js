const express = require('express');
const product_router = express.Router();

const product_controller = require('../controller/product_controller');


product_router.get('/',  product_controller.getAllProduct);
product_router.get('/:templateID/count',  product_controller.countProducts);

product_router.post('/order', product_controller.orderProduct);
product_router.post('/order/finish', product_controller.finishOrder);


module.exports = product_router;