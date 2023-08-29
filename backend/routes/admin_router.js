const express = require('express');
const admin_router = express.Router();

const admin_controller = require('../controller/admin_controller');


admin_router.get('/', admin_controller.getOneAdmin);

// Top Category
admin_router.get('/category', admin_controller.getAllTopCategory);
admin_router.post('/category/create', admin_controller.addTopCategory);
admin_router.delete('/category/:categoryName/delete', admin_controller.deleteTopCategory);
admin_router.post('/category/:categoryName/update', admin_controller.updateTopCategory);
admin_router.get('/category/:categoryName/update', admin_controller.getTopCategory);
admin_router.post('/category/:categoryName', admin_controller.getAllSubCategory);

//Sub-Category
admin_router.post('/category/:categoryName/create', admin_controller.addSubCategory);
admin_router.delete('/category/:categoryName/:subCategoryName/delete', admin_controller.deleteSubCategory);
admin_router.get('/category/:categoryName/:subCategoryName', admin_controller.getSubCategory);
admin_router.post('/category/:categoryName/:subCategoryName/update', admin_controller.updateSubCategory);


module.exports = admin_router;