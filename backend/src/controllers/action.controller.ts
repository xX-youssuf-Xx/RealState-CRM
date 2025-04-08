import type{ Request, Response } from 'express';
import { ActionModel } from '../models/action.model';
import type {  Action } from '../models/action.model';
import type { Omit } from 'utility-types';

type CreateActionData = Omit<Action, 'id' | 'created_at' | 'updated_at'>;
type UpdateActionData = Partial<Omit<Action, 'id' | 'created_at' | 'updated_at'>>;

export const getAllActions = async (req: Request, res: Response): Promise<void> => {
  try {
    const actions = await ActionModel.getAll();
    res.status(200).json(actions);
  } catch (error) {
    console.error('Error fetching actions:', error);
    res.status(500).json({ message: 'Failed to fetch actions' });
  }
};

export const getActionById = async (req: Request, res: Response): Promise<void> => {
  const idParam = req.params.id;
  if (idParam === undefined || isNaN(parseInt(idParam))) {
    res.status(400).json({ message: 'Invalid Action ID' });
    return;
  }
  const id = parseInt(idParam);
  try {
    const action = await ActionModel.getById(id);
    if (action) {
      res.status(200).json(action);
    } else {
      res.status(404).json({ message: 'Action not found' });
    }
  } catch (error) {
    console.error(`Error fetching action with ID ${id}:`, error);
    res.status(500).json({ message: 'Failed to fetch action' });
  }
};

export const getActionsByCustomerId = async (req: Request, res: Response): Promise<void> => {
  const customerIdParam = req.params.customerId;
  if (customerIdParam === undefined || isNaN(parseInt(customerIdParam))) {
    res.status(400).json({ message: 'Invalid Customer ID' });
    return;
  }
  const customerId = parseInt(customerIdParam);
  try {
    const actions = await ActionModel.getByCustomerId(customerId);
    res.status(200).json(actions);
  } catch (error) {
    console.error(`Error fetching actions for customer ID ${customerId}:`, error);
    res.status(500).json({ message: 'Failed to fetch actions for customer' });
  }
};

export const getActionsBySalesId = async (req: Request, res: Response): Promise<void> => {
  const salesIdParam = req.params.salesId;
  if (salesIdParam === undefined || isNaN(parseInt(salesIdParam))) {
    res.status(400).json({ message: 'Invalid Sales ID' });
    return;
  }
  const salesId = parseInt(salesIdParam);
  try {
    const actions = await ActionModel.getBySalesId(salesId);
    res.status(200).json(actions);
  } catch (error) {
    console.error(`Error fetching actions for sales ID ${salesId}:`, error);
    res.status(500).json({ message: 'Failed to fetch actions for sales person' });
  }
};

export const getActionsByProjectId = async (req: Request, res: Response): Promise<void> => {
  const projectIdParam = req.params.projectId;
  if (projectIdParam === undefined || isNaN(parseInt(projectIdParam))) {
    res.status(400).json({ message: 'Invalid Project ID' });
    return;
  }
  const projectId = parseInt(projectIdParam);
  try {
    const actions = await ActionModel.getByProjectId(projectId);
    res.status(200).json(actions);
  } catch (error) {
    console.error(`Error fetching actions for project ID ${projectId}:`, error);
    res.status(500).json({ message: 'Failed to fetch actions for project' });
  }
};

export const getActionsByUnitId = async (req: Request, res: Response): Promise<void> => {
  const unitIdParam = req.params.unitId;
  if (unitIdParam === undefined || isNaN(parseInt(unitIdParam))) {
    res.status(400).json({ message: 'Invalid Unit ID' });
    return;
  }
  const unitId = parseInt(unitIdParam);
  try {
    const actions = await ActionModel.getByUnitId(unitId);
    res.status(200).json(actions);
  } catch (error) {
    console.error(`Error fetching actions for unit ID ${unitId}:`, error);
    res.status(500).json({ message: 'Failed to fetch actions for unit' });
  }
};

export const createAction = async (req: Request, res: Response): Promise<void> => {
  const actionData = req.body as CreateActionData;
  try {
    const newAction = await ActionModel.create(actionData);
    res.status(201).json(newAction);
  } catch (error) {
    console.error('Error creating action:', error);
    res.status(500).json({ message: 'Failed to create action' });
  }
};

export const updateAction = async (req: Request, res: Response): Promise<void> => {
  const idParam = req.params.id;
  if (idParam === undefined || isNaN(parseInt(idParam))) {
    res.status(400).json({ message: 'Invalid Action ID' });
    return;
  }
  const id = parseInt(idParam);
  const updateData = req.body as UpdateActionData;
  try {
    const updatedAction = await ActionModel.update(id, updateData);
    if (updatedAction) {
      res.status(200).json(updatedAction);
    } else {
      res.status(404).json({ message: 'Action not found' });
    }
  } catch (error) {
    console.error(`Error updating action with ID ${id}:`, error);
    res.status(500).json({ message: 'Failed to update action' });
  }
};

export const deleteAction = async (req: Request, res: Response): Promise<void> => {
  const idParam = req.params.id;
  if (idParam === undefined || isNaN(parseInt(idParam))) {
    res.status(400).json({ message: 'Invalid Action ID' });
    return;
  }
  const id = parseInt(idParam);
  try {
    const deleted = await ActionModel.delete(id);
    if (deleted) {
      res.status(200).json({ message: 'deleted successfully ' });
    } else {
      res.status(404).json({ message: 'Action not found' });
    }
  } catch (error) {
    console.error(`Error deleting action with ID ${id}:`, error);
    res.status(500).json({ message: 'Failed to delete action' });
  }
};