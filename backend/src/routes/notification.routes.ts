import express, { Router } from 'express';
import { NotificationController } from '../controllers/notification.controller';
import { authenticate } from '../middlewares/auth.middleware';

// Create router with explicit typing
const router: Router = express.Router();

// Subscribe to notifications - requires authentication
router.post('/subscribe', authenticate, (req, res) => {
  return NotificationController.subscribe(req, res);
});

// Send task reminder notification
router.post('/task-reminder', (req, res) => {
  return NotificationController.sendTaskReminder(req, res);
});

// Send task reminder notification by user ID
router.post('/task-reminder-by-id', (req, res) => {
  return NotificationController.sendTaskReminderById(req, res);
});

export default router; 