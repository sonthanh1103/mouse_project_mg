import express from 'express';
import * as controller from '../controllers/product.js';
import * as homeController from '../controllers/home.js'
const router = express.Router();

// Định tuyến API cho các thao tác CRUD
router.get('/product', homeController.productPage) // render view Product Page
router.get('/api/product/get', controller.getProducts); // get Products
router.post('/api/product/create', controller.createProduct); // post
router.put('/api/product/update/:id', controller.updateProduct); // post
router.post('/api/product/delete', controller.delProducts); // post

export default router;