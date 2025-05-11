import express from 'express';
import * as productController from '../controllers/product.js';
import * as brandController from '../controllers/brand.js';
import * as materialController from '../controllers/material.js';
import * as frontFlareController from '../controllers/frontFlare.js';
import * as sideCurvatureController from '../controllers/sideCurvature.js';
import * as sensorController from '../controllers/sensor.js';
import * as lookupController from '../controllers/lookupController.js';
import isAuthenticated from '../helpers/isAuthenticated.js';

const router = express.Router();

// general
router.get('/api/product/lookup', lookupController.getProductLookUp);

// product
router.get('/product',                  isAuthenticated, productController.productPage)    // render view Product Page
router.get('/api/product/get',          isAuthenticated, productController.getProducts);   // get Products
router.post('/api/product/create',      isAuthenticated, productController.createProduct); // post
router.put('/api/product/update/:id',   isAuthenticated, productController.updateProduct); // post
router.post('/api/product/delete',      isAuthenticated, productController.delProducts);   // post

// brand
router.get('/brand',                    isAuthenticated, brandController.brandPage);
router.get('/api/brand/get',            isAuthenticated, brandController.getBrands);
router.post('/api/brand/create',        isAuthenticated, brandController.createBrand);
router.put('/api/brand/update/:id',     isAuthenticated, brandController.updateBrand);
router.post('/api/brand/delete',        isAuthenticated, brandController.deleteBrands);

// material
router.get('/material',                     materialController.materialPage);
router.get('/api/material/get',             materialController.getMaterials);
router.post('/api/material/create',          materialController.createMaterial);
router.put('/api/material/update/:id',      materialController.updateMaterial);
router.post('/api/material/delete',          materialController.deleteMaterials);

// front_flare
router.get('/front-flare',                  frontFlareController.frontFlarePage);
router.get('/api/front-flare/get',          frontFlareController.getFrontFlares);
router.post('/api/front-flare/create',       frontFlareController.createFrontFlare);
router.put('/api/front-flare/update/:id',   frontFlareController.updateFrontFlare);
router.post('/api/front-flare/delete',       frontFlareController.deleteFrontFlares);

// side_curvature
router.get('/side-curvature',                   sideCurvatureController.sideCurvaturePage);
router.get('/api/side-curvature/get',           sideCurvatureController.getSideCurvatures);
router.post('/api/side-curvature/create',        sideCurvatureController.createSideCurvature);
router.put('/api/side-curvature/update/:id',    sideCurvatureController.updateSideCurvature);
router.post('/api/side-curvature/delete',        sideCurvatureController.deleteSideCurvatures);

// sensor
router.get('/sensor',                   sensorController.sensorPage);
router.get('/api/sensor/get',           sensorController.getSensors);
router.post('/api/sensor/create',        sensorController.createSensor);
router.put('/api/sensor/update/:id',    sensorController.updateSensor);
router.post('/api/sensor/delete',        sensorController.deleteSensors);

export default router;