// task.controller.ts
import type { Request, Response } from 'express';
import { TaskModel} from '../models/task.model';
import type { Task } from '../models/task.model';
import type { Omit } from 'utility-types';

type CreateTaskData = Omit<Task, 'id' | 'created_at' | 'updated_at'>;
type UpdateTaskData = Partial<Omit<Task, 'id' | 'created_at' | 'updated_at'>>;

export const getAllTasks = async (req: Request, res: Response): Promise<void> => {
  try {
    const tasks = await TaskModel.getAll();
    res.status(200).json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ message: 'Failed to fetch tasks' });
  }
};

export const getTaskById = async (req: Request, res: Response): Promise<void> => {
  const idParam = req.params.id;
  if (idParam === undefined || isNaN(parseInt(idParam))) {
    res.status(400).json({ message: 'Invalid Task ID' });
    return;
  }
  const id = parseInt(idParam);
  try {
    const task = await TaskModel.getById(id);
    if (task) {
      res.status(200).json(task);
    } else {
      res.status(404).json({ message: 'Task not found' });
    }
  } catch (error) {
    console.error(`Error fetching task with ID ${id}:`, error);
    res.status(500).json({ message: 'Failed to fetch task' });
  }
};

export const getTasksByCustomerId = async (req: Request, res: Response): Promise<void> => {
  const customerIdParam = req.params.customerId;
  if (customerIdParam === undefined || isNaN(parseInt(customerIdParam))) {
    res.status(400).json({ message: 'Invalid Customer ID' });
    return;
  }
  const customerId = parseInt(customerIdParam);
  try {
    const tasks = await TaskModel.getByCustomerId(customerId);
    res.status(200).json(tasks);
  } catch (error) {
    console.error(`Error fetching tasks for customer ID ${customerId}:`, error);
    res.status(500).json({ message: 'Failed to fetch tasks for customer' });
  }
};

export const getTasksBySalesId = async (req: Request, res: Response): Promise<void> => {
  const salesIdParam = req.params.salesId;
  if (salesIdParam === undefined || isNaN(parseInt(salesIdParam))) {
    res.status(400).json({ message: 'Invalid Sales ID' });
    return;
  }
  const salesId = parseInt(salesIdParam);
  try {
    const tasks = await TaskModel.getBySalesId(salesId);
    res.status(200).json(tasks);
  } catch (error) {
    console.error(`Error fetching tasks for sales ID ${salesId}:`, error);
    res.status(500).json({ message: 'Failed to fetch tasks for sales person' });
  }
};

export const getTasksByActionId = async (req: Request, res: Response): Promise<void> => {
  const actionIdParam = req.params.actionId;
  if (actionIdParam === undefined || isNaN(parseInt(actionIdParam))) {
    res.status(400).json({ message: 'Invalid Action ID' });
    return;
  }
  const actionId = parseInt(actionIdParam);
  try {
    const tasks = await TaskModel.getByActionId(actionId);
    res.status(200).json(tasks);
  } catch (error) {
    console.error(`Error fetching tasks for action ID ${actionId}:`, error);
    res.status(500).json({ message: 'Failed to fetch tasks for action' });
  }
};

export const createTask = async (req: Request, res: Response): Promise<void> => {
  const taskData = req.body as CreateTaskData;
  try {
    // Validate required fields
    if (!taskData.name) {
      res.status(400).json({ message: 'Task name is required' });
      return;
    }

    // Validate date formats if provided
    if (taskData.due_date && isNaN(Date.parse(taskData.due_date.toString()))) {
      res.status(400).json({ message: 'Invalid due date format' });
      return;
    }
    if (taskData.due_date_day_before && isNaN(Date.parse(taskData.due_date_day_before.toString()))) {
      res.status(400).json({ message: 'Invalid day before due date format' });
      return;
    }
    if (taskData.due_date_hour_before && isNaN(Date.parse(taskData.due_date_hour_before.toString()))) {
      res.status(400).json({ message: 'Invalid hour before due date format' });
      return;
    }

    const newTask = await TaskModel.create(taskData);
    res.status(201).json(newTask);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ message: 'Failed to create task' });
  }
};

export const updateTask = async (req: Request, res: Response): Promise<void> => {
  const idParam = req.params.id;
  if (idParam === undefined || isNaN(parseInt(idParam))) {
    res.status(400).json({ message: 'Invalid Task ID' });
    return;
  }
  const id = parseInt(idParam);
  const updateData = req.body as UpdateTaskData;
  
  try {
    // Validate date formats if provided
    if (updateData.due_date && isNaN(Date.parse(updateData.due_date.toString()))) {
      res.status(400).json({ message: 'Invalid due date format' });
      return;
    }
    if (updateData.due_date_day_before && isNaN(Date.parse(updateData.due_date_day_before.toString()))) {
      res.status(400).json({ message: 'Invalid day before due date format' });
      return;
    }
    if (updateData.due_date_hour_before && isNaN(Date.parse(updateData.due_date_hour_before.toString()))) {
      res.status(400).json({ message: 'Invalid hour before due date format' });
      return;
    }

    const updatedTask = await TaskModel.update(id, updateData);
    if (updatedTask) {
      res.status(200).json(updatedTask);
    } else {
      res.status(404).json({ message: 'Task not found' });
    }
  } catch (error) {
    console.error(`Error updating task with ID ${id}:`, error);
    res.status(500).json({ message: 'Failed to update task' });
  }
};

export const deleteTask = async (req: Request, res: Response): Promise<void> => {
  const idParam = req.params.id;
  if (idParam === undefined || isNaN(parseInt(idParam))) {
    res.status(400).json({ message: 'Invalid Task ID' });
    return;
  }
  const id = parseInt(idParam);
  try {
    const deleted = await TaskModel.delete(id);
    if (deleted) {
      res.status(200).json({ message: 'deleted successfully ' });
    } else {
      res.status(404).json({ message: 'Task not found' });
    }
  } catch (error) {
    console.error(`Error deleting task with ID ${id}:`, error);
    res.status(500).json({ message: 'Failed to delete task' });
  }
};