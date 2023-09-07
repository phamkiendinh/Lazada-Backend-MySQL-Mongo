const express = require('express');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, '../frontend/seller/Assets');
    },
    filename: (req, file, cb) => {
      const filename = Date.now() + path.extname(file.originalname);
      cb(null, filename);
    }
});
  
const upload = multer({ storage });
const products_router = express.Router();

const products_controller = require('../controller/products_controller')

products_router.post('/', upload.single('image'), products_controller.create_product)
products_router.get('/', products_controller.get_all_products)

products_router.put('/:id', upload.single('image'), products_controller.update_product)
products_router.delete('/:id', products_controller.delete_product)
products_router.get('/:id', products_controller.get_product)

products_router.get('/category/:id', products_controller.get_category_attributes)

module.exports = products_router;