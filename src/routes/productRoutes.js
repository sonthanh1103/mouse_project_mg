import express from 'express';
import * as controller from '../controllers/productController.js';
import * as userController from '../controllers/user.js'
const router = express.Router();

// Định tuyến API cho các thao tác CRUD
router.get('/products', controller.getAllProducts);
router.post('/create', controller.createProduct);
router.put('/update/:id', controller.updateProduct);
router.delete('/delete/:id', controller.deleteProduct);
router.post('/delete', controller.delProducts);



export default router;