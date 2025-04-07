import db from '../config/database';

export interface Task {
  id: number;
  name: string;
  customer_id: number | null;
  sales_id: number | null;
  created_at: Date;
  updated_at: Date;
  action_id: number | null;
  due_date: Date | null;
}

export class TaskModel {
  static async getAll(): Promise<Task[]> {
    const result = await db.query('SELECT * FROM tasks');
    return result.rows;
  }

  static async getById(id: number): Promise<Task | null> {
    const result = await db.query('SELECT * FROM tasks WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  static async getByCustomerId(customerId: number): Promise<Task[]> {
    const result = await db.query('SELECT * FROM tasks WHERE customer_id = $1', [customerId]);
    return result.rows;
  }

  static async getBySalesId(salesId: number): Promise<Task[]> {
    const result = await db.query('SELECT * FROM tasks WHERE sales_id = $1', [salesId]);
    return result.rows;
  }

  static async getByActionId(actionId: number): Promise<Task[]> {
    const result = await db.query('SELECT * FROM tasks WHERE action_id = $1', [actionId]);
    return result.rows;
  }

  static async create(task: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Promise<Task> {
    const { name, customer_id, sales_id, action_id, due_date } = task;
    const result = await db.query(
      'INSERT INTO tasks (name, customer_id, sales_id, action_id, due_date) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, customer_id, sales_id, action_id, due_date]
    );
    return result.rows[0];
  }

  static async update(id: number, updates: Partial<Omit<Task, 'id' | 'created_at' | 'updated_at'>>): Promise<Task | null> {
    const { name, customer_id, sales_id, action_id, due_date } = updates;
    const fieldsToUpdate = [];
    const values = [];
    let paramIndex = 1;

    if (name !== undefined) { fieldsToUpdate.push(`name = $${paramIndex++}`); values.push(name); }
    if (customer_id !== undefined) { fieldsToUpdate.push(`customer_id = $${paramIndex++}`); values.push(customer_id); }
    if (sales_id !== undefined) { fieldsToUpdate.push(`sales_id = $${paramIndex++}`); values.push(sales_id); }
    if (action_id !== undefined) { fieldsToUpdate.push(`action_id = $${paramIndex++}`); values.push(action_id); }
    if (due_date !== undefined) { fieldsToUpdate.push(`due_date = $${paramIndex++}`); values.push(due_date); }

    if (fieldsToUpdate.length === 0) {
      return await TaskModel.getById(id);
    }

    values.push(id);
    const query = `UPDATE tasks SET ${fieldsToUpdate.join(', ')}, updated_at = NOW() WHERE id = $${paramIndex} RETURNING *`;
    const result = await db.query(query, values);
    return result.rows[0] || null;
  }

  static async delete(id: number): Promise<boolean> {
    const result = await db.query('DELETE FROM tasks WHERE id = $1 RETURNING id', [id]);
    return result.rows.length > 0;
  }
}