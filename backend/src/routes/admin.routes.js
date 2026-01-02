import express from 'express';
import * as adminController from '../controllers/admin.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { isAdmin } from '../middlewares/admin.middleware.js';

const router = express.Router();

router.use(authenticate, isAdmin);

router.get('/dashboard', adminController.getDashboard);
router.get('/users', adminController.getAllUsers);
router.get('/users/:userId/details', adminController.getUserDetails);
router.get('/suspicious', adminController.getSuspiciousActivity);
router.get('/sessions', adminController.getAllSessions);
router.post('/users/:userId/logout', adminController.forceLogoutUser);
router.post('/users/:userId/toggle-status', adminController.toggleUserStatus);
router.get('/logs/export', adminController.exportSystemLogs);
router.get('/logs', adminController.getSystemLogs);

export default router;