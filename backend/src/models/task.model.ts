// task.model.ts
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
  due_date_day_before: Date | null;
  due_date_hour_before: Date | null;
  status_day_before: string | null;
  status_hour_before: string | null;
}

export class TaskModel {
  static async getAll(): Promise<Task[]> {
    const result = await db.query('SELECT * FROM tasks');
    return result.rows.map((task: Task) => ({
      ...task,
      due_date: task.due_date ? new Date(new Date(task.due_date).getTime() - 2 * 60 * 60 * 1000) : null,
      due_date_day_before: task.due_date_day_before ? new Date(new Date(task.due_date_day_before).getTime() - 2 * 60 * 60 * 1000) : null,
      due_date_hour_before: task.due_date_hour_before ? new Date(new Date(task.due_date_hour_before).getTime() - 2 * 60 * 60 * 1000) : null,
    }));
  }

  static async getById(id: number): Promise<Task | null> {
    const result = await db.query('SELECT * FROM tasks WHERE id = $1', [id]);
    const task = result.rows[0] as Task | undefined;
    if (task) {
      task.due_date = task.due_date ? new Date(new Date(task.due_date).getTime() - 2 * 60 * 60 * 1000) : null;
      task.due_date_day_before = task.due_date_day_before ? new Date(new Date(task.due_date_day_before).getTime() - 2 * 60 * 60 * 1000) : null;
      task.due_date_hour_before = task.due_date_hour_before ? new Date(new Date(task.due_date_hour_before).getTime() - 2 * 60 * 60 * 1000) : null;
    }
    return task || null;
  }

  static async getByCustomerId(customerId: number): Promise<Task[]> {
    const result = await db.query('SELECT * FROM tasks WHERE customer_id = $1', [customerId]);
    return result.rows.map((task: Task) => ({
      ...task,
      due_date: task.due_date ? new Date(new Date(task.due_date).getTime() - 2 * 60 * 60 * 1000) : null,
      due_date_day_before: task.due_date_day_before ? new Date(new Date(task.due_date_day_before).getTime() - 2 * 60 * 60 * 1000) : null,
      due_date_hour_before: task.due_date_hour_before ? new Date(new Date(task.due_date_hour_before).getTime() - 2 * 60 * 60 * 1000) : null,
    }));
  }

  static async getBySalesId(salesId: number): Promise<Task[]> {
    const result = await db.query('SELECT * FROM tasks WHERE sales_id = $1', [salesId]);
    return result.rows.map((task: Task) => ({
      ...task,
      due_date: task.due_date ? new Date(new Date(task.due_date).getTime() - 2 * 60 * 60 * 1000) : null,
      due_date_day_before: task.due_date_day_before ? new Date(new Date(task.due_date_day_before).getTime() - 2 * 60 * 60 * 1000) : null,
      due_date_hour_before: task.due_date_hour_before ? new Date(new Date(task.due_date_hour_before).getTime() - 2 * 60 * 60 * 1000) : null,
    }));
  }

  static async getByActionId(actionId: number): Promise<Task[]> {
    const result = await db.query('SELECT * FROM tasks WHERE action_id = $1', [actionId]);
    return result.rows.map((task: Task) => ({
      ...task,
      due_date: task.due_date ? new Date(new Date(task.due_date).getTime() - 2 * 60 * 60 * 1000) : null,
      due_date_day_before: task.due_date_day_before ? new Date(new Date(task.due_date_day_before).getTime() - 2 * 60 * 60 * 1000) : null,
      due_date_hour_before: task.due_date_hour_before ? new Date(new Date(task.due_date_hour_before).getTime() - 2 * 60 * 60 * 1000) : null,
    }));
  }

  static async create(task: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Promise<Task> {
    const {
      name,
      customer_id,
      sales_id,
      action_id,
      due_date,
      due_date_day_before,
      due_date_hour_before,
      status_day_before,
      status_hour_before,
    } = task;

    // Add 2 hours to dates when saving
    const adjustedDueDate = due_date ? new Date(new Date(due_date).getTime() + 2 * 60 * 60 * 1000) : null;
    const adjustedDayBefore = due_date_day_before ? new Date(new Date(due_date_day_before).getTime() + 2 * 60 * 60 * 1000) : null;
    const adjustedHourBefore = due_date_hour_before ? new Date(new Date(due_date_hour_before).getTime() + 2 * 60 * 60 * 1000) : null;

    const result = await db.query(
      `INSERT INTO tasks (name, customer_id, sales_id, action_id, due_date, due_date_day_before, due_date_hour_before, status_day_before, status_hour_before)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [
        name,
        customer_id,
        sales_id,
        action_id,
        adjustedDueDate,
        adjustedDayBefore,
        adjustedHourBefore,
        status_day_before,
        status_hour_before,
      ]
    );

    // Subtract 2 hours when returning the dates
    const taskResult = result.rows[0] as Task;
    if (taskResult) {
      taskResult.due_date = taskResult.due_date ? new Date(new Date(taskResult.due_date).getTime() - 2 * 60 * 60 * 1000) : null;
      taskResult.due_date_day_before = taskResult.due_date_day_before ? new Date(new Date(taskResult.due_date_day_before).getTime() - 2 * 60 * 60 * 1000) : null;
      taskResult.due_date_hour_before = taskResult.due_date_hour_before ? new Date(new Date(taskResult.due_date_hour_before).getTime() - 2 * 60 * 60 * 1000) : null;
    }
    return taskResult;
  }

  static async update(
    id: number,
    updates: Partial<Omit<Task, 'id' | 'created_at' | 'updated_at'>>
  ): Promise<Task | null> {
    const {
      name,
      customer_id,
      sales_id,
      action_id,
      due_date,
      due_date_day_before,
      due_date_hour_before,
      status_day_before,
      status_hour_before,
    } = updates;
    const fieldsToUpdate = [];
    const values = [];
    let paramIndex = 1;

    if (name !== undefined) {
      fieldsToUpdate.push(`name = $${paramIndex++}`);
      values.push(name);
    }
    if (customer_id !== undefined) {
      fieldsToUpdate.push(`customer_id = $${paramIndex++}`);
      values.push(customer_id);
    }
    if (sales_id !== undefined) {
      fieldsToUpdate.push(`sales_id = $${paramIndex++}`);
      values.push(sales_id);
    }
    if (action_id !== undefined) {
      fieldsToUpdate.push(`action_id = $${paramIndex++}`);
      values.push(action_id);
    }
    if (due_date !== undefined) {
      fieldsToUpdate.push(`due_date = $${paramIndex++}`);
      values.push(due_date ? new Date(new Date(due_date).getTime() + 2 * 60 * 60 * 1000) : null);
    }
    if (due_date_day_before !== undefined) {
      fieldsToUpdate.push(`due_date_day_before = $${paramIndex++}`);
      values.push(due_date_day_before ? new Date(new Date(due_date_day_before).getTime() + 2 * 60 * 60 * 1000) : null);
    }
    if (due_date_hour_before !== undefined) {
      fieldsToUpdate.push(`due_date_hour_before = $${paramIndex++}`);
      values.push(due_date_hour_before ? new Date(new Date(due_date_hour_before).getTime() + 2 * 60 * 60 * 1000) : null);
    }
    if (status_day_before !== undefined) {
      fieldsToUpdate.push(`status_day_before = $${paramIndex++}`);
      values.push(status_day_before);
    }
    if (status_hour_before !== undefined) {
      fieldsToUpdate.push(`status_hour_before = $${paramIndex++}`);
      values.push(status_hour_before);
    }

    if (fieldsToUpdate.length === 0) {
      return await TaskModel.getById(id);
    }

    values.push(id);
    const query = `UPDATE tasks SET ${fieldsToUpdate.join(', ')}, updated_at = NOW() WHERE id = $${paramIndex} RETURNING *`;
    const result = await db.query(query, values);
    
    // Subtract 2 hours when returning the dates
    const taskResult = result.rows[0] as Task | undefined;
    if (taskResult) {
      taskResult.due_date = taskResult.due_date ? new Date(new Date(taskResult.due_date).getTime() - 2 * 60 * 60 * 1000) : null;
      taskResult.due_date_day_before = taskResult.due_date_day_before ? new Date(new Date(taskResult.due_date_day_before).getTime() - 2 * 60 * 60 * 1000) : null;
      taskResult.due_date_hour_before = taskResult.due_date_hour_before ? new Date(new Date(taskResult.due_date_hour_before).getTime() - 2 * 60 * 60 * 1000) : null;
    }
    return taskResult || null;
  }

  static async delete(id: number): Promise<boolean> {
    const result = await db.query('DELETE FROM tasks WHERE id = $1 RETURNING id', [id]);
    return result.rows.length > 0;
  }
}