import db from '../config/database';

export interface Project {
  id: number;
  name: string;
  location: string;
  type: string;
  pics: string | null;
  number_of_units: number | null;
  created_at: Date;
  updated_at: Date;
  number_of_sold_items: number; // Added number_of_sold_items
}

export class ProjectModel {
  static async getAll(): Promise<Project[]> {
    const result = await db.query('SELECT * FROM projects');
    return result.rows;
  }

  static async getById(id: number): Promise<Project | null> {
    const result = await db.query('SELECT * FROM projects WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  static async create(project: Omit<Project, 'id' | 'created_at' | 'updated_at'>): Promise<Project> {
    const { name, location, type, pics, number_of_units, number_of_sold_items } = project;
    const result = await db.query(
      'INSERT INTO projects (name, location, type, pics, number_of_units, number_of_sold_items) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [name, location, type, pics, number_of_units, number_of_sold_items]
    );
    return result.rows[0];
  }

  static async update(id: number, updates: Partial<Omit<Project, 'id' | 'created_at' | 'updated_at'>>): Promise<Project | null> {
    const { name, location, type, pics, number_of_units, number_of_sold_items } = updates;
    const fieldsToUpdate = [];
    const values = [];
    let paramIndex = 1;

    if (name !== undefined) { fieldsToUpdate.push(`name = $${paramIndex++}`); values.push(name); }
    if (location !== undefined) { fieldsToUpdate.push(`location = $${paramIndex++}`); values.push(location); }
    if (type !== undefined) { fieldsToUpdate.push(`type = $${paramIndex++}`); values.push(type); }
    if (pics !== undefined) { fieldsToUpdate.push(`pics = $${paramIndex++}`); values.push(pics); }
    if (number_of_units !== undefined) { fieldsToUpdate.push(`number_of_units = $${paramIndex++}`); values.push(number_of_units); }
    if (number_of_sold_items !== undefined) { fieldsToUpdate.push(`number_of_sold_items = $${paramIndex++}`); values.push(number_of_sold_items); }

    if (fieldsToUpdate.length === 0) {
      return await ProjectModel.getById(id);
    }

    values.push(id);
    const query = `UPDATE projects SET ${fieldsToUpdate.join(', ')}, updated_at = NOW() WHERE id = $${paramIndex} RETURNING *`;
    const result = await db.query(query, values);
    return result.rows[0] || null;
  }

  static async delete(id: number): Promise<boolean> {
    const result = await db.query('DELETE FROM projects WHERE id = $1 RETURNING id', [id]);
    return result.rows.length > 0;
  }
}