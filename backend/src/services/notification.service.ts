import webpush from 'web-push';
import { NotificationModel } from '../models/notification.model';

// VAPID keys from your configuration
const publicVapidKey = 'BDqL0kJ6w2Z9u9G-KLSWezralCagFYeWtOZaLa5K37iC4uNT07AGIIVwbOxKoIKsNm2TzisaRbFcj3-5AdrFlDo';
const privateVapidKey = '6pLMT-M8Gh9UAI8X2-ll8vhox72GMuK9gu0Wq02gVqs';

// Initialize web-push with VAPID details
webpush.setVapidDetails(
  'mailto:youssufhosam@gmail.com', // Replace with your email
  publicVapidKey,
  privateVapidKey
);

export class NotificationService {
  static async sendNotification(subscription: any, payload: any) {
    try {
      // Simple approach: just stringify the payload and send it
      const stringifiedPayload = JSON.stringify(payload);
      await webpush.sendNotification(subscription, stringifiedPayload);
      return true;
    } catch (error: any) {
      console.error('Error sending notification:', error);
      
      // Check if this is an expired subscription error (410 Gone)
      if (error.statusCode === 410) {
        console.log('Removing expired subscription:', subscription.endpoint);
        try {
          // Extract the endpoint part to identify the subscription in the database
          const endpointParts = subscription.endpoint.split('/');
          const tokenId = endpointParts[endpointParts.length - 1];
          
          // Delete the expired subscription
          await NotificationModel.deleteSubscriptionByToken(tokenId);
          console.log('Expired subscription removed from database');
        } catch (cleanupError) {
          console.error('Error removing expired subscription:', cleanupError);
        }
      }
      
      console.error('Failed subscription endpoint:', subscription.endpoint);
      return false;
    }
  }

  static async sendWelcomeNotification(subscription: any) {
    // Use same format and structure as the task notification that's working
    const payload = {
      title: 'مرحبا بك في نظام العقارات',
      body: 'تم تفعيل الإشعارات بنجاح!',
      icon: '/1logo_no_bg.png',
      badge: '/badge-72x72.png',
      data: {
        url: 'https://amaar.egypt-tech.com/dashboard',
        type: 'welcome'
      }
    };

    // Use the same notification method that works for task notifications
    const result = await this.sendNotification(subscription, payload);
    
    // Log for debugging purposes
    if (result) {
      console.log('Welcome notification sent successfully');
    } else {
      console.error('Failed to send welcome notification');
    }
    
    return result; 
  }

  static async sendTaskNotification(subscription: any, taskName: string, dueDate: string) {
    const dueDateObj = new Date(dueDate);
    
    // Subtract 2 hours from the due date
    const adjustedDate = new Date(dueDateObj);
    adjustedDate.setHours(adjustedDate.getHours() - 2);
    
    // Format date in a user-friendly way with 12-hour format
    const formattedDate = adjustedDate.toLocaleDateString();
    const formattedTime = adjustedDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
    
    // Format payload exactly like welcome notification to ensure Windows compatibility
    const payload = {
      title: 'تذكير للمهمة',
      body: `المهمة ${taskName} موعدها ${formattedDate} الساعة ${formattedTime}`,
      icon: '/1logo_no_bg.png',
      badge: '/badge-72x72.png',
      data: {
        url: 'https://amaar.egypt-tech.com/dashboard',
        type: 'task_reminder'
      }
    };

    // Use the same sendNotification method that works for welcome notification
    return this.sendNotification(subscription, payload);
  }
}