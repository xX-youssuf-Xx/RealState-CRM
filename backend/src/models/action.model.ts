import db from '../config/database';

export interface Action {
  id: number;
  customer_id: number | null;
  sales_id: number | null;
  created_at: Date;
  updated_at: Date;
  project_id: number | null;
  unit_id: number | null;
  prev_state: string | null;
  prev_substate: string | null;
  new_state: string | null;
  new_substate: string | null;
  notes: string | null;
}

export class ActionModel {
  static async getAll(): Promise<Action[]> {
    const result = await db.query('SELECT * FROM actions');
    return result.rows;
  }

  static async getById(id: number): Promise<Action | null> {
    const result = await db.query('SELECT * FROM actions WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  static async getByCustomerId(customerId: number): Promise<Action[]> {
    const result = await db.query('SELECT * FROM actions WHERE customer_id = $1', [customerId]);
    return result.rows;
  }

  static async getBySalesId(salesId: number): Promise<Action[]> {
    const result = await db.query('SELECT * FROM actions WHERE sales_id = $1', [salesId]);
    return result.rows;
  }

  static async getByProjectId(projectId: number): Promise<Action[]> {
    const result = await db.query('SELECT * FROM actions WHERE project_id = $1', [projectId]);
    return result.rows;
  }

  static async getByUnitId(unitId: number): Promise<Action[]> {
    const result = await db.query('SELECT * FROM actions WHERE unit_id = $1', [unitId]);
    return result.rows;
  }

  static async create(action: Omit<Action, 'id' | 'created_at' | 'updated_at'>): Promise<Action> {
    const { customer_id, sales_id, project_id, unit_id, prev_state, prev_substate, new_state, new_substate, notes } = action;
    const result = await db.query(
      'INSERT INTO actions (customer_id, sales_id, project_id, unit_id, prev_state, prev_substate, new_state, new_substate, notes) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
      [customer_id, sales_id, project_id, unit_id, prev_state, prev_substate, new_state, new_substate, notes]
    );
    return result.rows[0];
  }

  static async update(id: number, updates: Partial<Omit<Action, 'id' | 'created_at' | 'updated_at'>>): Promise<Action | null> {
    const { customer_id, sales_id, project_id, unit_id, prev_state, prev_substate, new_state, new_substate, notes } = updates;
    const fieldsToUpdate = [];
    const values = [];
    let paramIndex = 1;

    if (customer_id !== undefined) { fieldsToUpdate.push(`customer_id = $${paramIndex++}`); values.push(customer_id); }
    if (sales_id !== undefined) { fieldsToUpdate.push(`sales_id = $${paramIndex++}`); values.push(sales_id); }
    if (project_id !== undefined) { fieldsToUpdate.push(`project_id = $${paramIndex++}`); values.push(project_id); }
    if (unit_id !== undefined) { fieldsToUpdate.push(`unit_id = $${paramIndex++}`); values.push(unit_id); }
    if (prev_state !== undefined) { fieldsToUpdate.push(`prev_state = $${paramIndex++}`); values.push(prev_state); }
    if (prev_substate !== undefined) { fieldsToUpdate.push(`prev_substate = $${paramIndex++}`); values.push(prev_substate); }
    if (new_state !== undefined) { fieldsToUpdate.push(`new_state = $${paramIndex++}`); values.push(new_state); }
    if (new_substate !== undefined) { fieldsToUpdate.push(`new_substate = $${paramIndex++}`); values.push(new_substate); }
    if (notes !== undefined) { fieldsToUpdate.push(`notes = $${paramIndex++}`); values.push(notes); }

    if (fieldsToUpdate.length === 0) {
      return await ActionModel.getById(id);
    }

    values.push(id);
    const query = `UPDATE actions SET ${fieldsToUpdate.join(', ')}, updated_at = NOW() WHERE id = $${paramIndex} RETURNING *`;
    const result = await db.query(query, values);
    return result.rows[0] || null;
  }

  static async delete(id: number): Promise<boolean> {
    const result = await db.query('DELETE FROM actions WHERE id = $1 RETURNING id', [id]);
    return result.rows.length > 0;
  }
}