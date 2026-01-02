import express from 'express';
import * as authController from '../controllers/auth.controller.js';
import { extractDeviceInfo } from '../middlewares/device.middleware.js';
import { loginLimiter, signupLimiter } from '../middlewares/rateLimiter.middleware.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/signup', signupLimiter, authController.signup);
router.post('/login', loginLimiter, extractDeviceInfo, authController.login);
router.post('/logout', authenticate, authController.logout);
router.get('/me', authenticate, authController.getCurrentUser);

export default router;
