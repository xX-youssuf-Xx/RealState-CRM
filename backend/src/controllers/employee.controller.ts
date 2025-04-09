import type { Request, Response } from 'express';
import { EmployeeModel } from '../models/employee.model';
import type { Employee, SafeEmployee } from '../models/employee.model'; // Import both types
// If you are using 'utility-types' package:
// import type { Omit } from 'utility-types';
// Otherwise, define Omit manually if needed or rely on TypeScript's built-in Omit

// Define types for request bodies, excluding generated/sensitive fields
type CreateEmployeeData = Omit<Employee, 'id' | 'created_at' | 'updated_at' | 'hashedpass'>;
type UpdateEmployeeData = Partial<Omit<Employee, 'id' | 'created_at' | 'updated_at' | 'hashedpass'>>;


export const getAllEmployees = async (req: Request, res: Response): Promise<void> => {
  try {
    const employees: SafeEmployee[] = await EmployeeModel.getAll();
    res.status(200).json(employees);
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ message: 'Failed to fetch employees' });
  }
};

export const getEmployeeById = async (req: Request, res: Response): Promise<void> => {
  const idParam = req.params.id;
  if (idParam === undefined || isNaN(parseInt(idParam))) {
    res.status(400).json({ message: 'Invalid Employee ID format' });
    return;
  }
  const id = parseInt(idParam);

  try {
    const employee: SafeEmployee | null = await EmployeeModel.getById(id);
    if (employee) {
      res.status(200).json(employee);
    } else {
      res.status(404).json({ message: 'Employee not found' });
    }
  } catch (error) {
    console.error(`Error fetching employee with ID ${id}:`, error);
    res.status(500).json({ message: 'Failed to fetch employee' });
  }
};

export const createEmployee = async (req: Request, res: Response): Promise<void> => {
  // Extract password separately, validate other data matches CreateEmployeeData structure
  const { password, number, ...restEmployeeData } = req.body as CreateEmployeeData & { password?: string };

  // --- Input Validation ---
  if (!number) {
    res.status(400).json({ message: 'Employee phone number is required' });
    return;
  }
  // Add more specific number format validation if desired (e.g., using a regex)

  if (!password || password.length < 6) { // Example: Enforce minimum password length
    res.status(400).json({ message: 'Password is required and must be at least 6 characters long' });
    return;
  }
   if (!restEmployeeData.name) {
      res.status(400).json({ message: 'Employee name is required' });
      return;
  }
   if (!restEmployeeData.role) {
      res.status(400).json({ message: 'Employee role is required' });
      return;
  }
  // Add validation for other required fields if necessary

  // Reconstruct the data payload for the model
  const employeeData: CreateEmployeeData = { number, ...restEmployeeData };

  try {
    // --- Check for Duplicate Number ---
    // Use the model method which might return the full Employee object
    const existingEmployee: Employee | null = await EmployeeModel.getByNumber(employeeData.number);
    if (existingEmployee) {
      // Use 409 Conflict status code for existing resource conflict
      res.status(409).json({ message: `An employee with the number '${employeeData.number}' already exists.` });
      return; // Stop execution
    }
    // --- End Check ---

    // If number is unique, proceed to create the employee
    const newEmployee: SafeEmployee = await EmployeeModel.create(employeeData, password);

    // newEmployee already excludes hashedpass based on the updated model's return type
    res.status(201).json(newEmployee);

  } catch (error: any) { // Catch specific errors if possible
     console.error('Error creating employee:', error);
     // Handle potential unique constraint error bubbled up from model create/update
     if (error instanceof Error && error.message.includes('already exists')) {
        // Determine if it was the number based on the message
         if (error.message.includes(`number '${employeeData.number}'`)) {
              res.status(409).json({ message: error.message }); // Use 409 for conflicts
         } else {
              res.status(400).json({ message: error.message }); // Other constraint violations
         }
     } else if (error instanceof Error && error.message.includes('Database error finding employee')) {
         res.status(500).json({ message: 'Database error checking employee number.' });
     } else if (error instanceof Error && error.message.includes('Password is required')) {
          res.status(400).json({ message: error.message });
     }
     else {
         res.status(500).json({ message: 'Failed to create employee' });
     }
  }
};

export const updateEmployee = async (req: Request, res: Response): Promise<void> => {
  const idParam = req.params.id;
  if (idParam === undefined || isNaN(parseInt(idParam))) {
    res.status(400).json({ message: 'Invalid Employee ID format' });
    return;
  }
  const id = parseInt(idParam);

  // Extract optional password, other data should match UpdateEmployeeData
  const { password: newPassword, number, ...restUpdateData } = req.body as UpdateEmployeeData & { password?: string };

  // Construct the data payload for the model
  const updateData: UpdateEmployeeData = { number, ...restUpdateData };


  // Basic validation: Check if at least one field OR password is being updated
  if (Object.keys(updateData).length === 0 && !newPassword) {
      res.status(400).json({ message: 'No update data provided.' });
      return;
  }
  // Add specific validation for password strength if new password is provided
   if (newPassword && newPassword.length < 6) {
      res.status(400).json({ message: 'New password must be at least 6 characters long' });
      return;
   }


  try {
      // --- Check for potential duplicate number if number is being updated ---
      if (updateData.number) {
          const existingEmployee = await EmployeeModel.getByNumber(updateData.number);
          // If number exists AND it belongs to a *different* employee
          if (existingEmployee && existingEmployee.id !== id) {
              res.status(409).json({ message: `Another employee with the number '${updateData.number}' already exists.` });
              return;
          }
      }
      // --- End Check ---


    const updatedEmployee: SafeEmployee | null = await EmployeeModel.update(id, updateData, newPassword);

    if (updatedEmployee) {
      // updatedEmployee already excludes hashedpass based on the updated model's return type
      res.status(200).json(updatedEmployee);
    } else {
      // This means the employee with the given ID was not found or was already 'DELETED'
      res.status(404).json({ message: 'Employee not found or already deleted' });
    }
  } catch (error: any) { // Catch specific errors if possible
     console.error(`Error updating employee with ID ${id}:`, error);
     if (error instanceof Error && error.message.includes('already exists')) {
          // Handle unique constraint violation specifically for number if possible
         if (error.message.includes(`number '${updateData.number}'`)) {
              res.status(409).json({ message: error.message });
         } else {
             res.status(400).json({ message: error.message }); // Other constraints
         }
     } else {
        res.status(500).json({ message: 'Failed to update employee' });
     }
  }
};

export const deleteEmployee = async (req: Request, res: Response): Promise<void> => {
  const idParam = req.params.id;
  if (idParam === undefined || isNaN(parseInt(idParam))) {
    res.status(400).json({ message: 'Invalid Employee ID format' });
    return;
  }
  const id = parseInt(idParam);

  try {
    const deleted: boolean = await EmployeeModel.delete(id);
    if (deleted) {
      // Send 204 No Content for successful deletion with no body
      // Or send 200 with a confirmation message
      res.status(200).json({ message: 'Employee marked as deleted successfully' });
      // res.status(204).send();
    } else {
      // Employee not found or already marked as deleted
      res.status(404).json({ message: 'Employee not found or already deleted' });
    }
  } catch (error) {
    console.error(`Error deleting employee with ID ${id}:`, error);
    res.status(500).json({ message: 'Failed to delete employee' });
  }
};

// Optional: Add controller for getByRole if you have a route for it
export const getEmployeesByRole = async (req: Request, res: Response): Promise<void> => {
    const role = req.params.role; // Assuming role is a route parameter
    if (!role) {
        res.status(400).json({ message: 'Role parameter is required' });
        return;
    }
    try {
        const employees: SafeEmployee[] = await EmployeeModel.getByRole(role);
        res.status(200).json(employees);
    } catch (error) {
        console.error(`Error fetching employees with role ${role}:`, error);
        res.status(500).json({ message: 'Failed to fetch employees by role' });
    }
};