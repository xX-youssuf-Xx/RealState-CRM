// project.controller.ts
import { ProjectModel } from '../models/project.model';
import type { Request, Response } from 'express';
import type { Project } from '../models/project.model';
import type { Omit } from 'utility-types';

type CreateProjectData = Omit<Project, 'id' | 'created_at' | 'updated_at'>;
type UpdateProjectData = Partial<Omit<Project, 'id' | 'created_at' | 'updated_at'>>;

export const getAllProjects = async (req: Request, res: Response): Promise<void> => {
  try {
    const projects = await ProjectModel.getAll();
    res.status(200).json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ message: 'Failed to fetch projects' });
  }
};

export const getProjectById = async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params.id!);
  if (isNaN(id)) {
    res.status(400).json({ message: 'Invalid Project ID' });
    return;
  }
  try {
    const project = await ProjectModel.getById(id);
    if (project) {
      res.status(200).json(project);
    } else {
      res.status(404).json({ message: 'Project not found' });
    }
  } catch (error) {
    console.error(`Error fetching project with ID ${id}:`, error);
    res.status(500).json({ message: 'Failed to fetch project' });
  }
};

export const createProject = async (req: Request, res: Response): Promise<void> => {
  try {
    // Log the incoming request body to see what data is being received
    console.log("Request body:", req.body);
    
    // Safely extract values from req.body without destructuring
    const name = req.body.name;
    const location = req.body.location;
    const type = req.body.type;
    const number_of_units = req.body.number_of_units ? parseInt(req.body.number_of_units) : null;
    const number_of_sold_items = req.body.number_of_sold_items ? parseInt(req.body.number_of_sold_items) : 0;
    const benefits = req.body.benefits || null;

    // Validate required fields
    if (!name || !location || !type) {
      res.status(400).json({ message: 'Missing required fields: name, location, and type are required' });
      return;
    }

    const newProjectData: Omit<Project, 'id' | 'created_at' | 'updated_at'> = {
      name,
      location,
      type,
      number_of_units,
      number_of_sold_items,
      benefits
    };

    console.log("Attempting to create project with data:", newProjectData);
    
    const newProject = await ProjectModel.create(newProjectData);
    res.status(201).json(newProject);
  } catch (error) {
    // Log the complete error for debugging
    console.error('Error creating project:', error);
    
    // Send a more detailed error message to the client
    if (error instanceof Error) {
      res.status(500).json({ 
        message: 'Failed to create project', 
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    } else {
      res.status(500).json({ message: 'Failed to create project' });
    }
  }
};

export const updateProject = async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params.id!);
  if (isNaN(id)) {
    res.status(400).json({ message: 'Invalid Project ID' });
    return;
  }

  try {
    // Log the incoming request
    console.log(`Update request for project ${id}:`, req.body);
    
    const existing = await ProjectModel.getById(id);
    if (!existing) {
      res.status(404).json({ message: 'Project not found' });
      return;
    }

    // Safely extract values from req.body without destructuring
    const updates: UpdateProjectData = {};
    
    // Only include fields that are actually present in the request
    if ('name' in req.body) updates.name = req.body.name;
    if ('location' in req.body) updates.location = req.body.location;
    if ('type' in req.body) updates.type = req.body.type;
    
    if ('number_of_units' in req.body) {
      const parsedUnits = req.body.number_of_units === null ? null : parseInt(req.body.number_of_units);
      if (req.body.number_of_units === null || !isNaN(parsedUnits!)) {
        updates.number_of_units = parsedUnits;
      }
    }
    
    if ('number_of_sold_items' in req.body) {
      const parsedSoldItems = parseInt(req.body.number_of_sold_items);
      if (!isNaN(parsedSoldItems)) {
        updates.number_of_sold_items = parsedSoldItems;
      }
    }
    
    if ('benefits' in req.body) updates.benefits = req.body.benefits;

    console.log("Updates to apply:", updates);
    
    if (Object.keys(updates).length === 0) {
      console.log("No updates to apply, returning existing project");
      res.status(200).json(existing);
      return;
    }

    const updated = await ProjectModel.update(id, updates);
    if (updated) {
      res.status(200).json(updated);
    } else {
      res.status(500).json({ message: 'Failed to update project - no rows returned' });
    }
  } catch (error) {
    console.error(`Error updating project with ID ${id}:`, error);
    
    if (error instanceof Error) {
      res.status(500).json({ 
        message: 'Failed to update project', 
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    } else {
      res.status(500).json({ message: 'Failed to update project' });
    }
  }
};

export const deleteProject = async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params.id!);
  if (isNaN(id)) {
    res.status(400).json({ message: 'Invalid Project ID' });
    return;
  }
  try {
    const deleted = await ProjectModel.delete(id);
    if (deleted) {
      res.status(200).json({ message: 'deleted successfully ' });
    } else {
      res.status(404).json({ message: 'Project not found' });
    }
  } catch (error) {
    console.error(`Error deleting project with ID ${id}:`, error);
    res.status(500).json({ message: 'Failed to delete project' });
  }
};