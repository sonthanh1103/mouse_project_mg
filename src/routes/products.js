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
router.get('/api/product/lookup', lookupController.getProductLookUp); // get all ref fields data

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
router.get('/material',                     isAuthenticated, materialController.materialPage);
router.get('/api/material/get',             isAuthenticated, materialController.getMaterials);
router.post('/api/material/create',         isAuthenticated, materialController.createMaterial);
router.put('/api/material/update/:id',      isAuthenticated, materialController.updateMaterial);
router.post('/api/material/delete',         isAuthenticated, materialController.deleteMaterials);

// front_flare
router.get('/front-flare',                  isAuthenticated, frontFlareController.frontFlarePage);
router.get('/api/front-flare/get',          isAuthenticated, frontFlareController.getFrontFlares);
router.post('/api/front-flare/create',      isAuthenticated, frontFlareController.createFrontFlare);
router.put('/api/front-flare/update/:id',   isAuthenticated, frontFlareController.updateFrontFlare);
router.post('/api/front-flare/delete',      isAuthenticated, frontFlareController.deleteFrontFlares);

// side_curvature
router.get('/side-curvature',                   isAuthenticated, sideCurvatureController.sideCurvaturePage);
router.get('/api/side-curvature/get',           isAuthenticated, sideCurvatureController.getSideCurvatures);
router.post('/api/side-curvature/create',       isAuthenticated, sideCurvatureController.createSideCurvature);
router.put('/api/side-curvature/update/:id',    isAuthenticated, sideCurvatureController.updateSideCurvature);
router.post('/api/side-curvature/delete',       isAuthenticated, sideCurvatureController.deleteSideCurvatures);

// sensor
router.get('/sensor',                   isAuthenticated, sensorController.sensorPage);
router.get('/api/sensor/get',           isAuthenticated, sensorController.getSensors);
router.post('/api/sensor/create',       isAuthenticated, sensorController.createSensor);
router.put('/api/sensor/update/:id',    isAuthenticated, sensorController.updateSensor);
router.post('/api/sensor/delete',       isAuthenticated, sensorController.deleteSensors);

export default router;