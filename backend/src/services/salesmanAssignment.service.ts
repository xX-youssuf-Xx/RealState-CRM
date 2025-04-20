import db from '../config/database';

interface Employee {
  id: number;
  name: string;
  role: string;
  created_at: Date;
}

/**
 * Gets the next sales employee ID using a round-robin approach
 * with proper validation and error handling
 */
export async function getNextSalesEmployeeId(): Promise<number | null> {
  const client = await db.begin();
  
  try {
    // 1. Get all active sales employees sorted by created_at (ascending)
    const employeesResult = await client.query<Employee>(
      "SELECT id, name, role, created_at FROM employees WHERE role = 'SALES' ORDER BY created_at ASC"
    );
    
    // Validate: Ensure we have sales employees
    const salesEmployees = employeesResult.rows;
    if (!salesEmployees.length) {
      console.error('No sales employees found in the system');
      await db.rollback(client);
      return null;
    }
    
    // 2. Get the current counter value
    const counterResult = await client.query(
      'SELECT counter FROM round_robin_counter WHERE id = 1 FOR UPDATE'
    );
    
    // Validate: Ensure counter exists
    if (!counterResult.rows.length) {
      console.error('Round robin counter not found');
      await db.rollback(client);
      return null;
    }
    
    // 3. Calculate next employee index (with wrap-around)
    let currentCounter = counterResult.rows[0].counter;
    const nextEmployeeIndex = currentCounter % salesEmployees.length;
    
    // Make sure the employee at this index exists - this should always be true
    // given our previous length check, but let's be extra safe
    if (!salesEmployees[nextEmployeeIndex]) {
      console.error('Selected employee index is out of bounds');
      await db.rollback(client);
      return null;
    }
    
    const selectedEmployeeId = salesEmployees[nextEmployeeIndex].id;
    
    // 4. Update the counter for next time
    const nextCounter = (currentCounter + 1) % salesEmployees.length;
    await client.query(
      'UPDATE round_robin_counter SET counter = $1 WHERE id = 1',
      [nextCounter]
    );
    
    // 5. Commit the transaction
    await db.commit(client);
    
    return selectedEmployeeId;
  } catch (error) {
    // If anything fails, roll back and return null
    await db.rollback(client);
    console.error('Error in getNextSalesEmployeeId:', error);
    return null;
  }
}

/**
 * Resets the round-robin counter (useful for testing or admin functions)
 */
export async function resetRoundRobinCounter(): Promise<boolean> {
  try {
    await db.query('UPDATE round_robin_counter SET counter = 0 WHERE id = 1');
    return true;
  } catch (error) {
    console.error('Failed to reset round-robin counter:', error);
    return false;
  }
}