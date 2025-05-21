import express from 'express';
import * as homeController from '../controllers/home.js'

const router = express.Router();

// render UI view
router.get('/', homeController.dashboardPage);
router.get('/compare', homeController.comparePage);
router.get('/find-similar', homeController.findSimilarPage);
router.get('/database', homeController.databasePage);
router.get('/reviews', homeController.reviewPage);
router.get('/discounts', homeController.discountPage);
router.get('/contact', homeController.contactPage);

export default router;