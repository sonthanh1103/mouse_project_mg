import express from 'express';
import userRouters from './users.js';
import productRoutes from './products.js';
import home from './home.js'

const router = express.Router();
    
router.use('/', userRouters);
router.use('/', productRoutes);
router.use('/', home);

export default router;