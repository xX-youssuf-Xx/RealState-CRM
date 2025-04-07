// src/models/report.model.ts
import db from '../config/database';

export class ReportModel {
  static async getTotalSales(startDate?: Date, endDate?: Date, salesId?: number): Promise<number> {
    let query = 'SELECT COALESCE(SUM(u.price), 0) AS total_sales FROM units u WHERE u.status = \'sold\'';
    const values: any[] = [];
    let paramIndex = 1;

    if (salesId) {
      query += ` AND EXISTS (SELECT 1 FROM leads l WHERE l.id = u.project_id AND l.sales_id = $${paramIndex++})`;
      values.push(salesId);
    }

    if (startDate && endDate) {
      query += ` AND u.sold_date >= $${paramIndex++} AND u.sold_date <= $${paramIndex++}`;
      values.push(startDate, endDate);
    } else if (startDate) {
      query += ` AND u.sold_date >= $${paramIndex++}`;
      values.push(startDate);
    } else if (endDate) {
      query += ` AND u.sold_date <= $${paramIndex++}`;
      values.push(endDate);
    }

    const result = await db.query(query, values);
    return parseFloat(result.rows[0]?.total_sales || 0);
  }

  static async getUnitsSoldCount(startDate?: Date, endDate?: Date, salesId?: number): Promise<number> {
    let query = 'SELECT COUNT(u.id) AS sold_count FROM units u WHERE u.status = \'sold\'';
    const values: any[] = [];
    let paramIndex = 1;

    if (salesId) {
      query += ` AND EXISTS (SELECT 1 FROM leads l WHERE l.id = u.project_id AND l.sales_id = $${paramIndex++})`;
      values.push(salesId);
    }

    if (startDate && endDate) {
      query += ` AND u.sold_date >= $${paramIndex++} AND u.sold_date <= $${paramIndex++}`;
      values.push(startDate, endDate);
    } else if (startDate) {
      query += ` AND u.sold_date >= $${paramIndex++}`;
      values.push(startDate);
    } else if (endDate) {
      query += ` AND u.sold_date <= $${paramIndex++}`;
      values.push(endDate);
    }

    const result = await db.query(query, values);
    return parseInt(result.rows[0]?.sold_count || 0);
  }
}