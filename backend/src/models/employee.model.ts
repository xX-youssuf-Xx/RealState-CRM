import db from '../config/database'; // Adjust path as needed
import bcryptjs from 'bcryptjs';

// Define the core Employee structure/interface
export interface Employee {
  id: number;
  name: string;
  number: string; // Assuming phone number
  role: string;
  created_at: Date;
  updated_at: Date;
  notes: string | null;
  hashedpass: string | null; // Store the hashed password
}

// Omit sensitive fields for typical responses
export type SafeEmployee = Omit<Employee, 'hashedpass'>;

export class EmployeeModel {

  /**
   * Retrieves all non-deleted employees, excluding password hash.
   */
  static async getAll(): Promise<SafeEmployee[]> {
    // Exclude 'DELETED' role and the password hash
    const query = `
      SELECT id, name, number, role, notes, created_at, updated_at
      FROM employees
      WHERE role != 'DELETED' OR role IS NULL
    `;
    const result = await db.query(query);
    return result.rows;
  }

  /**
   * Retrieves all non-deleted employees by a specific role, excluding password hash.
   * @param role The role to filter by.
   */
  static async getByRole(role: string): Promise<SafeEmployee[]> {
     // Exclude 'DELETED' role and the password hash
    const query = `
      SELECT id, name, number, role, notes, created_at, updated_at
      FROM employees
      WHERE role = $1 AND (role != 'DELETED' OR role IS NULL)
    `;
    const result = await db.query(query, [role]);
    return result.rows;
  }

  /**
   * Retrieves a single non-deleted employee by ID, excluding password hash.
   * @param id The employee's ID.
   */
  static async getById(id: number): Promise<SafeEmployee | null> {
     // Exclude the password hash
    const query = `
      SELECT id, name, number, role, notes, created_at, updated_at
      FROM employees
      WHERE id = $1 AND (role != 'DELETED' OR role IS NULL)
    `;
    const result = await db.query(query, [id]);
    return result.rows[0] || null;
  }

  /**
   * Finds a single employee by their phone number (including potentially deleted ones for uniqueness checks).
   * Includes hashed password for potential internal use (like login checks).
   * @param number The phone number to search for.
   */
  static async getByNumber(number: string): Promise<Employee | null> {
     // Include all fields as this might be used for login or internal checks
    const query = 'SELECT * FROM employees WHERE number = $1 LIMIT 1';
    try {
        const result = await db.query(query, [number]);
        return result.rows[0] || null;
    } catch (error) {
        console.error(`Error finding employee by number ${number}:`, error);
        throw new Error(`Database error finding employee by number.`);
    }
  }

  /**
   * Creates a new employee, hashing their password.
   * @param employee Data for the new employee (excluding generated fields).
   * @param password The plain text password.
   */
  static async create(
    employee: Omit<Employee, 'id' | 'created_at' | 'updated_at' | 'hashedpass'>,
    password: string
  ): Promise<SafeEmployee> { // Return SafeEmployee
    const { name, number, role, notes } = employee;

    if (!password) {
      throw new Error('Password is required to create an employee.');
    }

    const saltRounds = 10; // Or use bcryptjs.genSalt() for async generation
    const hashedpassword = await bcryptjs.hash(password, saltRounds);

    const query = `
      INSERT INTO employees (name, number, role, notes, hashedpass)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, name, number, role, notes, created_at, updated_at
    `; // Return only safe fields

    try {
        const result = await db.query(query, [name, number, role, notes, hashedpassword]);
        return result.rows[0];
    } catch(error: any) {
         // Add specific check for unique constraint violation if applicable
         if (error.code === '23505') { // PostgreSQL unique violation code
             console.error(`Unique constraint violation creating employee: ${error.detail}`);
             // Check if it's the number field causing violation based on error.constraint
             if (error.constraint && error.constraint.includes('number')) { // Adjust constraint name if needed
                 throw new Error(`An employee with the number '${number}' already exists.`);
             }
             throw new Error(`Cannot create employee due to existing data: ${error.detail}`);
         }
        console.error('Error creating employee in database:', error);
        throw new Error('Failed to create employee record.');
    }
  }

  /**
   * Updates an existing employee's details and optionally their password.
   * @param id The ID of the employee to update.
   * @param updates An object containing fields to update.
   * @param newPassword Optional new plain text password.
   */
  static async update(
    id: number,
    updates: Partial<Omit<Employee, 'id' | 'created_at' | 'updated_at' | 'hashedpass'>>,
    newPassword?: string
   ): Promise<SafeEmployee | null> { // Return SafeEmployee
    const { name, number, role, notes } = updates;
    const fieldsToUpdate = [];
    const values = [];
    let paramIndex = 1;

    // Build query dynamically based on provided fields
    if (name !== undefined) { fieldsToUpdate.push(`name = $${paramIndex++}`); values.push(name); }
    if (number !== undefined) { fieldsToUpdate.push(`number = $${paramIndex++}`); values.push(number); }
    if (role !== undefined) { fieldsToUpdate.push(`role = $${paramIndex++}`); values.push(role); }
    if (notes !== undefined) { fieldsToUpdate.push(`notes = $${paramIndex++}`); values.push(notes); }

    // Hash and add password if provided
    if (newPassword) {
      const saltRounds = 10;
      const hashedpassword = await bcryptjs.hash(newPassword, saltRounds);
      fieldsToUpdate.push(`hashedpass = $${paramIndex++}`);
      values.push(hashedpassword);
    }

    // If no fields to update (and no password), just return current data
    if (fieldsToUpdate.length === 0) {
      return await EmployeeModel.getById(id);
    }

    // Add the ID for the WHERE clause
    values.push(id);
    // Ensure we only update non-deleted employees
    const query = `
      UPDATE employees
      SET ${fieldsToUpdate.join(', ')}, updated_at = NOW()
      WHERE id = $${paramIndex} AND (role != 'DELETED' OR role IS NULL)
      RETURNING id, name, number, role, notes, created_at, updated_at
    `; // Return only safe fields

    try {
        const result = await db.query(query, values);
        return result.rows[0] || null; // Return null if ID not found or was 'DELETED'
    } catch (error: any) {
         if (error.code === '23505') { // Handle potential unique constraint violation on update
             console.error(`Unique constraint violation updating employee ${id}: ${error.detail}`);
              if (error.constraint && error.constraint.includes('number')) {
                 throw new Error(`An employee with the number '${number}' already exists.`);
             }
             throw new Error(`Cannot update employee due to existing data: ${error.detail}`);
         }
        console.error(`Error updating employee with ID ${id}:`, error);
        throw new Error('Failed to update employee record.');
    }
  }

  /**
   * Performs a "soft delete" by setting the employee's role to 'DELETED'.
   * @param id The ID of the employee to delete.
   */
  static async delete(id: number): Promise<boolean> {
    const query = `
      UPDATE employees
      SET role = $1, updated_at = NOW()
      WHERE id = $2 AND (role != 'DELETED' OR role IS NULL)
      RETURNING id
    `;
    try {
        const result = await db.query(query, ['DELETED', id]);
        // Return true if a row was updated (meaning it existed and wasn't already deleted)
        return result.rows.length > 0;
    } catch (error) {
        console.error(`Error soft deleting employee with ID ${id}:`, error);
        throw new Error('Failed to delete employee record.');
    }
  }
}