import db from '../config/database';
import { getNextSalesEmployeeId } from '../services/salesmanAssignment.service';

export interface Lead {
  id: number;
  name: string;
  number: string;
  source: string;
  address: string;
  state: string;
  substate: string;
  sales_id: number | null;
  budget: number | null;
  notes: string | null;
  created_at: Date;
  updated_at: Date;
  is_created_by_sales: boolean | null;
  notification_id: string | null;
}

export class LeadModel {
  static async getAll(): Promise<Lead[]> {
    const result = await db.query('SELECT * FROM leads');
    return result.rows;
  }

  static async getById(id: number): Promise<Lead | null> {
    const result = await db.query('SELECT * FROM leads WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  static async getBySalesId(salesId: number): Promise<Lead[]> {
    const result = await db.query('SELECT * FROM leads WHERE sales_id = $1', [salesId]);
    return result.rows;
  }
  
  static async create(lead: Omit<Lead, 'id' | 'created_at' | 'updated_at' | 'sales_id'>): Promise<Lead> {
    const { name, number, source, address, state, substate, budget, notes, is_created_by_sales, notification_id } = lead;
    const salesId = await getNextSalesEmployeeId(); // Auto-assign sales ID

    const result = await db.query(
      'INSERT INTO leads (name, number, source, address, state, substate, sales_id, budget, notes, is_created_by_sales, notification_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *',
      [name, number, source, address, state, substate, salesId, budget, notes, is_created_by_sales, notification_id]
    );
    return result.rows[0];
  }

  static async update(id: number, updates: Partial<Lead>): Promise<Lead | null> {
    const { name, number, source, address, state, substate, sales_id, budget, notes, is_created_by_sales, notification_id } = updates;
    const fieldsToUpdate = [];
    const values = [];
    let paramIndex = 1;

    if (name !== undefined) { fieldsToUpdate.push(`name = $${paramIndex++}`); values.push(name); }
    if (number !== undefined) { fieldsToUpdate.push(`number = $${paramIndex++}`); values.push(number); }
    if (source !== undefined) { fieldsToUpdate.push(`source = $${paramIndex++}`); values.push(source); }
    if (address !== undefined) { fieldsToUpdate.push(`address = $${paramIndex++}`); values.push(address); }
    if (state !== undefined) { fieldsToUpdate.push(`state = $${paramIndex++}`); values.push(state); }
    if (substate !== undefined) { fieldsToUpdate.push(`substate = $${paramIndex++}`); values.push(substate); }
    if (sales_id !== undefined) { fieldsToUpdate.push(`sales_id = $${paramIndex++}`); values.push(sales_id); }
    if (budget !== undefined) { fieldsToUpdate.push(`budget = $${paramIndex++}`); values.push(budget); }
    if (notes !== undefined) { fieldsToUpdate.push(`notes = $${paramIndex++}`); values.push(notes); }
    if (is_created_by_sales !== undefined) { fieldsToUpdate.push(`is_created_by_sales = $${paramIndex++}`); values.push(is_created_by_sales); }
    if (notification_id !== undefined) { fieldsToUpdate.push(`notification_id = $${paramIndex++}`); values.push(notification_id); }

    if (fieldsToUpdate.length === 0) {
      return await LeadModel.getById(id);
    }

    values.push(id);
    const query = `UPDATE leads SET ${fieldsToUpdate.join(', ')}, updated_at = NOW() WHERE id = $${paramIndex} RETURNING *`;
    const result = await db.query(query, values);
    return result.rows[0] || null;
  }

  static async delete(id: number): Promise<boolean> {
    const result = await db.query('DELETE FROM leads WHERE id = $1 RETURNING id', [id]);
    return result.rows.length > 0;
  }

  static async transfer(leadId: number, newSalesId: number): Promise<Lead | null> {
    const client = await db.begin();
    try {
      await client.query('UPDATE leads SET sales_id = $1 WHERE id = $2', [newSalesId, leadId]);
      await client.query('UPDATE actions SET sales_id = $1 WHERE customer_id = $2', [newSalesId, leadId]);
      await client.query('UPDATE tasks SET sales_id = $1 WHERE customer_id = $2', [newSalesId, leadId]);
      await db.commit(client);
      return await LeadModel.getById(leadId);
    } catch (error) {
      await db.rollback(client);
      console.error('Error transferring lead:', error);
      return null;
    }
  }
}