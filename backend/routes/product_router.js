const express = require('express');
const product_router = express.Router();

const product_controller = require('../controller/product_controller');


product_router.get('/',  product_controller.getAllProduct);





module.exports = product_router;