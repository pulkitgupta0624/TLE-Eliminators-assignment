import express from 'express';
import * as userController from '../controllers/user.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(authenticate);

router.get('/dashboard', userController.getDashboard);
router.get('/sessions', userController.getUserSessions);
router.delete('/sessions/:sessionId', userController.logoutDevice);
router.post('/sessions/logout-all', userController.logoutAllDevices);

export default router;