import express from 'express';
import * as productController from '../controllers/product.js';
import * as homeController from '../controllers/home.js'
import isAuthenticated from '../helpers/isAuthenticated.js';

const router = express.Router();

router.get('/product',                  isAuthenticated, productController.productPage)    // render view Product Page
router.get('/api/product/get',          isAuthenticated, productController.getProducts);   // get Products
router.post('/api/product/create',      isAuthenticated, productController.createProduct); // post
router.put('/api/product/update/:id',   isAuthenticated, productController.updateProduct); // post
router.post('/api/product/delete',      isAuthenticated, productController.delProducts);   // post

export default router;