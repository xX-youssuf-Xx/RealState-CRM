import type { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { NotificationService } from '../services/notification.service';
import { NotificationModel } from '../models/notification.model';
import type { AuthRequest } from '../middlewares/auth.middleware';

dotenv.config();
const jwtSecret = process.env.JWT_SECRET || 'fallback_secret';

export class NotificationController {
  static async subscribe(req: Request, res: Response): Promise<void> {
    try {
      const subscription = req.body.subscription;
      console.log('Received subscription:', JSON.stringify(subscription).substring(0, 100) + '...');
      
      // Get the token from the authorization header
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        res.status(401).json({
          success: false,
          message: 'Missing authorization header'
        });
        return;
      }

      const token = authHeader.split(' ')[1]; // Assuming Bearer token
      if (!token) {
        res.status(401).json({
          success: false,
          message: 'Invalid authorization format'
        });
        return;
      }

      // Verify and decode the token
      try {
        const decoded = jwt.verify(token, jwtSecret) as { id: number, role: string };
        console.log('User ID:', decoded.id);
        
        // Save subscription to database
        await NotificationModel.saveSubscription(decoded.id, subscription);
        console.log('Subscription saved to database');
        
        // Send welcome notification
        const welcomeResult = await NotificationService.sendWelcomeNotification(subscription);
        console.log('Welcome notification result:', welcomeResult);
        
        res.status(201).json({
          success: true,
          message: 'Successfully subscribed to notifications',
          notificationSent: welcomeResult
        });
      } catch (jwtError) {
        console.error('JWT verification error:', jwtError);
        res.status(403).json({
          success: false,
          message: 'Invalid token'
        });
      }
    } catch (error) {
      console.error('Error in notification subscription:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to subscribe to notifications'
      });
    }
  }

  static async sendTaskReminder(req: Request, res: Response): Promise<void> {
    try {
      const { subscription, taskName, dueDate } = req.body;
      
      await NotificationService.sendTaskNotification(subscription, taskName, dueDate);
      
      res.status(200).json({
        success: true,
        message: 'Task reminder notification sent successfully'
      });
    } catch (error) {
      console.error('Error sending task reminder:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send task reminder notification'
      });
    }
  }

  static async sendTaskReminderById(req: Request, res: Response): Promise<void> {
    try {
      const { user_id, taskName, dueDate } = req.body;
      
      // Get all subscriptions from database for this user
      const subscriptions = await NotificationModel.getSubscriptionByUserId(user_id);
      
      if (!subscriptions || subscriptions.length === 0) {
        res.status(404).json({
          success: false,
          message: 'No subscriptions found for this user'
        });
        return;
      }
      
      // Send notification to all user devices
      const notificationPromises = subscriptions.map(subscriptionData => {
        // Parse the subscription object from the stored string
        const subscription = JSON.parse(subscriptionData.fcm_token);
        // Send notification
        return NotificationService.sendTaskNotification(subscription, taskName, dueDate);
      });
      
      // Wait for all notifications to be sent
      await Promise.all(notificationPromises);
      
      res.status(200).json({
        success: true,
        message: `Task reminder notifications sent successfully to ${subscriptions.length} devices`
      });
    } catch (error) {
      console.error('Error sending task reminder by ID:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send task reminder notification'
      });
    }
  }
} 