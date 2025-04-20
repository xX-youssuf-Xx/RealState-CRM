// project.model.ts
import db from '../config/database';

export interface Project {
  id: number;
  name: string;
  location: string;
  type: string;
  number_of_units: number | null;
  created_at: Date;
  updated_at: Date;
  number_of_sold_items: number;
  benefits?: string | null;
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
    const { name, location, type, number_of_units, number_of_sold_items, benefits } = project;
    const result = await db.query(
      'INSERT INTO projects (name, location, type, number_of_units, number_of_sold_items, benefits) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [name, location, type, number_of_units, number_of_sold_items, benefits]
    );
    return result.rows[0];
  }

  static async update(id: number, updates: Partial<Omit<Project, 'id' | 'created_at' | 'updated_at'>>): Promise<Project | null> {
    try {
      const fieldsToUpdate = [];
      const values = [];
      let paramIndex = 1;
  
      // Log the update operation
      console.log(`Updating project ${id} with:`, updates);
  
      if (updates.name !== undefined) { fieldsToUpdate.push(`name = $${paramIndex++}`); values.push(updates.name); }
      if (updates.location !== undefined) { fieldsToUpdate.push(`location = $${paramIndex++}`); values.push(updates.location); }
      if (updates.type !== undefined) { fieldsToUpdate.push(`type = $${paramIndex++}`); values.push(updates.type); }
      if (updates.number_of_units !== undefined) { fieldsToUpdate.push(`number_of_units = $${paramIndex++}`); values.push(updates.number_of_units); }
      if (updates.number_of_sold_items !== undefined) { fieldsToUpdate.push(`number_of_sold_items = $${paramIndex++}`); values.push(updates.number_of_sold_items); }
      if (updates.benefits !== undefined) { fieldsToUpdate.push(`benefits = $${paramIndex++}`); values.push(updates.benefits); }
  
      if (fieldsToUpdate.length === 0) {
        return await ProjectModel.getById(id);
      }
  
      values.push(id);
      const query = `UPDATE projects SET ${fieldsToUpdate.join(', ')}, updated_at = NOW() WHERE id = $${paramIndex} RETURNING *`;
      console.log("SQL Query:", query);
      console.log("SQL Values:", values);
      
      const result = await db.query(query, values);
      return result.rows[0] || null;
    } catch (error) {
      console.error(`Database error updating project ${id}:`, error);
      throw error; // Re-throw to be caught by the controller
    }
  }

  static async delete(id: number): Promise<boolean> {
    const result = await db.query('DELETE FROM projects WHERE id = $1 RETURNING id', [id]);
    return result.rows.length > 0;
  }
}