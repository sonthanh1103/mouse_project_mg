import express from 'express';
import * as userController from '../controllers/user.js';
import isAuthenticated from "../helpers/isAuthenticated.js";
import isAdmin from '../helpers/isAdmin.js';

const router = express.Router();

// =====================user routes==================================
router.get('/users',                userController.userPage);     // render view
router.get('/api/users',            userController.getUsers);     // get data json
router.get('/api/users/:id',        userController.getUser);      // get data json
router.post('/api/users/create',                              userController.createUser);   //post
router.put('/api/users/update/:id', userController.updateUser);   // post
router.post('/api/users/delete',    userController.deleteUsers);  // post

router.get('/signup', userController.signUpPage);       // render view
router.get('/login', userController.logInPage);         // render view
router.post('/api/users/login', userController.logIn);  // post

router.get('/login/identify', userController.forgotPasswordPage);               // render view
router.post('/api/users/forgot', userController.forgotPassword);                // post
router.get('/reset-password/:token', userController.resetPasswordPage);         // render view
router.post('/api/users/reset-password/:token', userController.resetPassword);  // post


export default router;