import express from 'express';
import userRouters from './users.js';
import chatBotRoutes from './productRoutes.js';

const router = express.Router();
    
router.use('/', userRouters);
router.use('/', chatBotRoutes);

export default router;