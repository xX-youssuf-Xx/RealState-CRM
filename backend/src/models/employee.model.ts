import db from '../config/database';
import bcryptjs from 'bcryptjs'; // Changed import

export interface Employee {
  id: number;
  name: string;
  number: string;
  role: string;
  created_at: Date;
  updated_at: Date;
  notes: string | null; // You might consider removing this field eventually
  hashedpass: string | null;
}

export class EmployeeModel {
  static async getAll(): Promise<Employee[]> {
    const result = await db.query('SELECT id, name, number, role, created_at, updated_at FROM employees'); // Exclude hashedpass for general listing
    return result.rows;
  } 

  static async getByRole(role: string): Promise<Employee[]> {
    const result = await db.query('SELECT * FROM employees WHERE role = $1', [role]);
    return result.rows;
  }
  
  static async getById(id: number): Promise<Employee | null> {
    const result = await db.query('SELECT id, name, number, role, created_at, updated_at FROM employees WHERE id = $1', [id]); // Exclude hashedpass
    return result.rows[0] || null;
  }

  static async getByNumber(number: string): Promise<Employee | null> {
    const result = await db.query('SELECT * FROM employees WHERE number = $1', [number]);
    return result.rows[0] || null;
  }

  static async create(employee: Omit<Employee, 'id' | 'created_at' | 'updated_at' | 'hashedpass'>, password: string): Promise<Employee> {
    const { name, number, role, notes } = employee;
    const saltRounds = 10;
    const hashedpassword = await bcryptjs.hash(password, saltRounds); // Changed to bcryptjs.hash
    const result = await db.query(
      'INSERT INTO employees (name, number, role, notes, hashedpass) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, number, role, created_at, updated_at',
      [name, number, role, notes, hashedpassword]
    );
    return result.rows[0];
  }

  static async update(id: number, updates: Partial<Omit<Employee, 'id' | 'created_at' | 'updated_at' | 'hashedpass'>>, newPassword?: string): Promise<Employee | null> {
    const { name, number, role, notes } = updates;
    const fieldsToUpdate = [];
    const values = [];
    let paramIndex = 1;

    if (name !== undefined) { fieldsToUpdate.push(`name = $${paramIndex++}`); values.push(name); }
    if (number !== undefined) { fieldsToUpdate.push(`number = $${paramIndex++}`); values.push(number); }
    if (role !== undefined) { fieldsToUpdate.push(`role = $${paramIndex++}`); values.push(role); }
    if (notes !== undefined) { fieldsToUpdate.push(`notes = $${paramIndex++}`); values.push(notes); }

    if (newPassword) {
      const saltRounds = 10;
      const hashedpassword = await bcryptjs.hash(newPassword, saltRounds); // Changed to bcryptjs.hash
      fieldsToUpdate.push(`hashedpass = $${paramIndex++}`);
      values.push(hashedpassword);
    }

    if (fieldsToUpdate.length === 0) {
      return await EmployeeModel.getById(id);
    }

    values.push(id);
    const query = `UPDATE employees SET ${fieldsToUpdate.join(', ')}, updated_at = NOW() WHERE id = $${paramIndex} RETURNING id, name, number, role, created_at, updated_at`;
    const result = await db.query(query, values);
    return result.rows[0] || null;
  }

  static async delete(id: number): Promise<boolean> {
    const result = await db.query('DELETE FROM employees WHERE id = $1 RETURNING id', [id]);
    return result.rows.length > 0;
  }
}