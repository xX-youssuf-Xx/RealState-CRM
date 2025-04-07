import type { Request, Response } from 'express';
import { UnitModel } from '../models/unit.model';
import type { Unit } from '../models/unit.model';
import type { Omit } from 'utility-types';

type CreateUnitData = Omit<Unit, 'id'>;
type UpdateUnitData = Partial<Omit<Unit, 'id'>>;

export const getAllUnits = async (req: Request, res: Response): Promise<void> => {
  try {
    const units = await UnitModel.getAll();
    res.status(200).json(units);
  } catch (error) {
    console.error('Error fetching units:', error);
    res.status(500).json({ message: 'Failed to fetch units' });
  }
};

export const getUnitById = async (req: Request, res: Response): Promise<void> => {
  const idParam = req.params.id;
  if (idParam === undefined || isNaN(parseInt(idParam))) {
    res.status(400).json({ message: 'Invalid Unit ID' });
    return;
  }
  const id = parseInt(idParam);
  try {
    const unit = await UnitModel.getById(id);
    if (unit) {
      res.status(200).json(unit);
    } else {
      res.status(404).json({ message: 'Unit not found' });
    }
  } catch (error) {
    console.error(`Error fetching unit with ID ${id}:`, error);
    res.status(500).json({ message: 'Failed to fetch unit' });
  }
};

export const getUnitsByProjectId = async (req: Request, res: Response): Promise<void> => {
  const projectIdParam = req.params.projectId;
  if (projectIdParam === undefined || isNaN(parseInt(projectIdParam))) {
    res.status(400).json({ message: 'Invalid Project ID' });
    return;
  }
  const projectId = parseInt(projectIdParam);
  try {
    const units = await UnitModel.getByProjectId(projectId);
    res.status(200).json(units);
  } catch (error) {
    console.error(`Error fetching units for project ID ${projectId}:`, error);
    res.status(500).json({ message: 'Failed to fetch units for project' });
  }
};

export const createUnit = async (req: Request, res: Response): Promise<void> => {
  const unitData = req.body as CreateUnitData;
  try {
    const newUnit = await UnitModel.create(unitData);
    res.status(201).json(newUnit);
  } catch (error) {
    console.error('Error creating unit:', error);
    res.status(500).json({ message: 'Failed to create unit' });
  }
};

export const updateUnit = async (req: Request, res: Response): Promise<void> => {
  const idParam = req.params.id;
  if (idParam === undefined || isNaN(parseInt(idParam))) {
    res.status(400).json({ message: 'Invalid Unit ID' });
    return;
  }
  const id = parseInt(idParam);
  const updateData = req.body as UpdateUnitData;
  try {
    const updatedUnit = await UnitModel.update(id, updateData);
    if (updatedUnit) {
      res.status(200).json(updatedUnit);
    } else {
      res.status(404).json({ message: 'Unit not found' });
    }
  } catch (error) {
    console.error(`Error updating unit with ID ${id}:`, error);
    res.status(500).json({ message: 'Failed to update unit' });
  }
};


export const deleteUnit = async (req: Request, res: Response): Promise<void> => {
  const idParam = req.params.id;
  if (idParam === undefined || isNaN(parseInt(idParam))) {
    res.status(400).json({ message: 'Invalid Unit ID' });
    return;
  }
  const id = parseInt(idParam);
  try {
    const deleted = await UnitModel.delete(id);
    if (deleted) {
      res.status(204).send();
    } else {
      res.status(404).json({ message: 'Unit not found' });
    }
  } catch (error) {
    console.error(`Error deleting unit with ID ${id}:`, error);
    res.status(500).json({ message: 'Failed to delete unit' });
  }
};