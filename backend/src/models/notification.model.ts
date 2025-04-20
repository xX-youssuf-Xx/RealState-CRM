import db from '../config/database';

export interface NotificationSubscription {
  id?: number;
  sales_id: number;
  fcm_token: string; // This will store the stringified subscription object
  created_at?: Date;
  updated_at?: Date;
}

export class NotificationModel {
  static async saveSubscription(sales_id: number, subscription: any): Promise<NotificationSubscription> {
    try {
      // Convert subscription object to string
      const fcm_token = JSON.stringify(subscription);
      
      // Create new subscription record (always insert, never update)
      const result = await db.query(
        `INSERT INTO fcm_tokens (sales_id, fcm_token)
         VALUES ($1, $2)
         RETURNING *`,
        [sales_id, fcm_token]
      );
      
      return result.rows[0];
    } catch (error) {
      console.error('Error saving subscription:', error);
      throw error;
    }
  }

  static async getSubscriptionByUserId(sales_id: number): Promise<NotificationSubscription[]> {
    try {
      const result = await db.query(
        'SELECT * FROM fcm_tokens WHERE sales_id = $1',
        [sales_id]
      );
      
      return result.rows;
    } catch (error) {
      console.error('Error fetching subscription:', error);
      throw error;
    }
  }

  static async getAllSubscriptions(): Promise<NotificationSubscription[]> {
    try {
      const result = await db.query('SELECT * FROM fcm_tokens');
      return result.rows;
    } catch (error) {
      console.error('Error fetching all subscriptions:', error);
      throw error;
    }
  }

  static async deleteSubscription(sales_id: number): Promise<boolean> {
    try {
      const result = await db.query(
        'DELETE FROM fcm_tokens WHERE sales_id = $1 RETURNING id',
        [sales_id]
      );
      return result.rows.length > 0;
    } catch (error) {
      console.error('Error deleting subscription:', error);
      throw error;
    }
  }

  static async deleteSubscriptionByToken(fcm_token: string): Promise<boolean> {
    try {
      const result = await db.query(
        'DELETE FROM fcm_tokens WHERE fcm_token LIKE $1 RETURNING id',
        [`%${fcm_token}%`]
      );
      return result.rows.length > 0;
    } catch (error) {
      console.error('Error deleting subscription by token:', error);
      throw error;
    }
  }
} 