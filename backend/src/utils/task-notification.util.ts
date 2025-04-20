import { TaskModel } from '../models/task.model';
import { NotificationModel } from '../models/notification.model';
import { NotificationService } from '../services/notification.service';
import { EmployeeModel } from '../models/employee.model';

export class TaskNotificationUtil {
  /**
   * Check for upcoming tasks and send notifications
   */
  static async checkTasksAndSendNotifications(): Promise<void> {
    try {
      console.log(`[${new Date().toISOString()}] Checking for tasks to send notifications...`);
      
      // Get all tasks
      const tasks = await TaskModel.getAll();
      
      // Get current time and add 2 hours to account for timezone difference
      const now = new Date();
      now.setHours(now.getHours() + 2);
      
      // Process each task
      for (const task of tasks) {
        try {
          // Skip tasks without due dates
          if (!task.due_date) continue;
          
          // Add 2 hours to due date for proper comparison (if not already adjusted in the model)
          const adjustedDueDate = new Date(task.due_date);
          adjustedDueDate.setHours(adjustedDueDate.getHours() + 2);

          
          // Check for hour-before notification
          if (task.due_date_hour_before) {
            // Add 2 hours to hour-before date
            const adjustedHourBefore = new Date(task.due_date_hour_before);
            adjustedHourBefore.setHours(adjustedHourBefore.getHours() + 2);
            
            
            if (task.status_hour_before !== 'SENT' && isWithinTimeRange(now, adjustedHourBefore, 11)) {
              // Send notification
              if (task.sales_id) {
                const sent = await this.sendNotificationToUser(
                  task.sales_id, 
                  task.name, 
                  formatDate(adjustedDueDate)
                );

                
                if (sent) {
                  // Update task status
                  await TaskModel.update(task.id, { status_hour_before: 'SENT' });
                  console.log(`Sent hour-before notification for task ${task.id}`);
                }
              }
            }
          }
          
          // Check for day-before notification
          if (task.due_date_day_before) {
            // Add 2 hours to day-before date
            const adjustedDayBefore = new Date(task.due_date_day_before);
            
            
            if (task.status_day_before !== 'SENT' && isWithinTimeRange(now, adjustedDayBefore, 11)) {
              // Send notification
              if (task.sales_id) {
                const sent = await this.sendNotificationToUser(
                  task.sales_id, 
                  task.name, 
                  formatDate(adjustedDueDate)
                );
                
                if (sent) {
                  // Update task status 
                  await TaskModel.update(task.id, { status_day_before: 'SENT' });
                  console.log(`Sent day-before notification for task ${task.id}`);
                }
              }
            }
          }
        } catch (taskError) {
          console.error(`Error processing task ${task.id}:`, taskError);
        }
      }
      
      console.log(`[${new Date().toISOString()}] Task notification check completed`);
    } catch (error) {
      console.error('Error checking tasks for notifications:', error);
    }
  }
  
  /**
   * Send notification to a specific user
   */
  private static async sendNotificationToUser(
    userId: number, 
    taskName: string, 
    dueDate: string
  ): Promise<boolean> {
    try {
      // Get user subscriptions
      const subscriptions = await NotificationModel.getSubscriptionByUserId(userId);
      
      if (!subscriptions || subscriptions.length === 0) {
        console.log(`No subscriptions found for user ${userId}`);
        return false;
      }
      
      // Get employee name
      const employee = await EmployeeModel.getById(userId);
      const employeeName = employee ? employee.name : 'User';
      
      // Track successful notifications
      let successCount = 0;
      
      // Send notification to all user devices
      for (const subscription of subscriptions) {
        try {
          // Parse subscription object
          const subscriptionObj = JSON.parse(subscription.fcm_token);
          
          // Send notification
          const success = await NotificationService.sendTaskNotification(
            subscriptionObj,
            taskName,
            dueDate
          );
          
          if (success) {
            successCount++;
          }
        } catch (subError) {
          console.error(`Error sending to a specific subscription for user ${userId}:`, subError);
          // Continue with other subscriptions even if one fails
        }
      }
      
      console.log(`Notifications sent to ${employeeName} (ID: ${userId}) for task: ${taskName}. Success: ${successCount}/${subscriptions.length} devices`);
      return successCount > 0; // Consider successful if at least one notification was sent
    } catch (error) {
      console.error(`Error sending notification to user ${userId}:`, error);
      return false;
    }
  }
}

/**
 * Check if a date is within a certain number of minutes of another date
 */
function isWithinTimeRange(currentTime: Date, targetTime: Date, minutesRange: number): boolean {
  const diffMs = Math.abs(targetTime.getTime() - currentTime.getTime());
  const diffMinutes = Math.floor(diffMs / 60000);
  return diffMinutes <= minutesRange;
}

/**
 * Format a date for display
 */
function formatDate(date: Date): string {
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
} 