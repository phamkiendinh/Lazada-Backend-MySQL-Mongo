// Dependencies: Nodemon, Cors, Body-parser, Router
// Express App
const express = require('express');
const cors = require('cors'); 
const bodyParser = require('body-parser');

const admin_router = require('./routes/admin_router');
const warehouse_router = require('./routes/warehouse_router');
const product_router  = require('./routes/product_router');
const products_router = require('./routes/products_router');
const orders_router = require('./routes/orders_router');

const app = express();
const port = process.env.PORT || 3001;

// Allow outside origins
app.use(cors());

// Read body from the request
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));



// Group related API endpoints
app.use('/admin', admin_router);
app.use('/admin/warehouse', warehouse_router);

// Customer
app.use('/product', product_router);

// Seller
app.use('/products', products_router)
app.use('/orders', orders_router)

app.listen(port, () => {
    console.log(`Express App is listening on port ${port}`);
});

