import express from 'express';
import * as productController from '../controllers/product.js';
import * as brandController from '../controllers/brand.js'
import isAuthenticated from '../helpers/isAuthenticated.js';

const router = express.Router();

// product
router.get('/product',                  isAuthenticated, productController.productPage)    // render view Product Page
router.get('/api/product/get',           productController.getProducts);   // get Products
router.post('/api/product/create',       productController.createProduct); // post
router.put('/api/product/update/:id',    productController.updateProduct); // post
router.post('/api/product/delete',      isAuthenticated, productController.delProducts);   // post

// brand
router.get('/brand', brandController.brandPage);
router.get('/material', brandController.brandPage);
router.get('/front-flare', brandController.brandPage);
router.get('/side-curvature', brandController.brandPage);
router.get('/sensor', brandController.brandPage);
// router.get('/api/brand/get')
// router.get('/api/brand/create')
// router.get('/api/brand/update/:id')
// router.get('/api/brand/delete')

export default router;