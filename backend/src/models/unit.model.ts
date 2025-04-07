import db from '../config/database';

export interface Unit {
  id: number;
  project_id: number;
  name: string;
  area: number;
  price: number;
  unit_notes: string | null;
  created_at: Date;
  updated_at: Date;
  status: string; // Added status
  sold_date: Date | null; // Added sold_date
}

export class UnitModel {
  static async getAll(): Promise<Unit[]> {
    const result = await db.query('SELECT * FROM units');
    return result.rows;
  }

  static async getById(id: number): Promise<Unit | null> {
    const result = await db.query('SELECT * FROM units WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  static async getByProjectId(projectId: number): Promise<Unit[]> {
    const result = await db.query('SELECT * FROM units WHERE project_id = $1', [projectId]);
    return result.rows;
  }

  static async create(unit: Omit<Unit, 'id' | 'created_at' | 'updated_at'>): Promise<Unit> {
    const { project_id, name, area, price, unit_notes, status, sold_date } = unit;
    const result = await db.query(
      'INSERT INTO units (project_id, name, area, price, unit_notes, status, sold_date) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [project_id, name, area, price, unit_notes, status, sold_date]
    );
    return result.rows[0];
  }

  static async update(id: number, updates: Partial<Omit<Unit, 'id' | 'created_at' | 'updated_at'>>): Promise<Unit | null> {
    const { project_id, name, area, price, unit_notes, status, sold_date } = updates;
    const fieldsToUpdate = [];
    const values = [];
    let paramIndex = 1;

    if (project_id !== undefined) { fieldsToUpdate.push(`project_id = $${paramIndex++}`); values.push(project_id); }
    if (name !== undefined) { fieldsToUpdate.push(`name = $${paramIndex++}`); values.push(name); }
    if (area !== undefined) { fieldsToUpdate.push(`area = $${paramIndex++}`); values.push(area); }
    if (price !== undefined) { fieldsToUpdate.push(`price = $${paramIndex++}`); values.push(price); }
    if (unit_notes !== undefined) { fieldsToUpdate.push(`unit_notes = $${paramIndex++}`); values.push(unit_notes); }
    if (status !== undefined) { fieldsToUpdate.push(`status = $${paramIndex++}`); values.push(status); }
    if (sold_date !== undefined) { fieldsToUpdate.push(`sold_date = $${paramIndex++}`); values.push(sold_date); }

    if (fieldsToUpdate.length === 0) {
      return await UnitModel.getById(id);
    }

    values.push(id);
    const query = `UPDATE units SET ${fieldsToUpdate.join(', ')}, updated_at = NOW() WHERE id = $${paramIndex} RETURNING *`;
    const result = await db.query(query, values);
    return result.rows[0] || null;
  }

  static async delete(id: number): Promise<boolean> {
    const result = await db.query('DELETE FROM units WHERE id = $1 RETURNING id', [id]);
    return result.rows.length > 0;
  }
}