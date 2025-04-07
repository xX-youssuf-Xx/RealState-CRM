import type { Request, Response } from 'express';
import { EmployeeModel} from '../models/employee.model';
import type { Employee } from '../models/employee.model'
import type { Omit } from 'utility-types';

type CreateEmployeeData = Omit<Employee, 'id' | 'created_at' | 'updated_at' | 'hashedPass'>;
type UpdateEmployeeData = Partial<Omit<Employee, 'id' | 'created_at' | 'updated_at' | 'hashedPass'>>;

export const getAllEmployees = async (req: Request, res: Response): Promise<void> => {
  try {
    const employees = await EmployeeModel.getAll();
    res.status(200).json(employees);
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ message: 'Failed to fetch employees' });
  }
};

export const getEmployeeById = async (req: Request, res: Response): Promise<void> => {
  const idParam = req.params.id;
  if (idParam === undefined || isNaN(parseInt(idParam))) {
    res.status(400).json({ message: 'Invalid Employee ID' });
    return;
  }
  const id = parseInt(idParam);
  try {
    const employee = await EmployeeModel.getById(id);
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
  const { password, ...employeeData } = req.body as CreateEmployeeData & { password?: string };

  if (!password) {
    res.status(400).json({ message: 'Password is required for creating an employee' });
    return;
  }

  try {
    const newEmployee = await EmployeeModel.create(employeeData, password);
    res.status(201).json(newEmployee);
  } catch (error) {
    console.error('Error creating employee:', error);
    res.status(500).json({ message: 'Failed to create employee' });
  }
};

export const updateEmployee = async (req: Request, res: Response): Promise<void> => {
  const idParam = req.params.id;
  if (idParam === undefined || isNaN(parseInt(idParam))) {
    res.status(400).json({ message: 'Invalid Employee ID' });
    return;
  }
  const id = parseInt(idParam);
  const { password, ...updateData } = req.body as UpdateEmployeeData & { password?: string };

  try {
    const updatedEmployee = await EmployeeModel.update(id, updateData, password);
    if (updatedEmployee) {
      res.status(200).json(updatedEmployee);
    } else {
      res.status(404).json({ message: 'Employee not found' });
    }
  } catch (error) {
    console.error(`Error updating employee with ID ${id}:`, error);
    res.status(500).json({ message: 'Failed to update employee' });
  }
};

export const deleteEmployee = async (req: Request, res: Response): Promise<void> => {
  const idParam = req.params.id;
  if (idParam === undefined || isNaN(parseInt(idParam))) {
    res.status(400).json({ message: 'Invalid Employee ID' });
    return;
  }
  const id = parseInt(idParam);
  try {
    const deleted = await EmployeeModel.delete(id);
    if (deleted) {
      res.status(204).send();
    } else {
      res.status(404).json({ message: 'Employee not found' });
    }
  } catch (error) {
    console.error(`Error deleting employee with ID ${id}:`, error);
    res.status(500).json({ message: 'Failed to delete employee' });
  }
};