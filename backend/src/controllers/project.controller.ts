import { ProjectModel } from '../models/project.model';
import type { Request, Response } from 'express';
import type { Project } from '../models/project.model';
import type { Omit } from 'utility-types';
import multer from 'multer';
import path from 'path';

type CreateProjectData = Omit<Project, 'id' | 'created_at' | 'updated_at'>;
type UpdateProjectData = Partial<Omit<Project, 'id' | 'created_at' | 'updated_at'>>;

// Configure multer for handling file uploads
const storage = multer.diskStorage({
  destination: 'uploads/projects/', // Create this directory in your backend
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

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
  const idParam = req.params.id;
  if (idParam === undefined || isNaN(parseInt(idParam))) {
    res.status(400).json({ message: 'Invalid Project ID' });
    return;
  }
  const id = parseInt(idParam);
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
  const { name, location, type, number_of_units, number_of_sold_items } = req.body as CreateProjectData;
  const files = req.files as Express.Multer.File[]; // Access uploaded files

  try {
    const imageUrls = files ? files.map(file => `/uploads/projects/${file.filename}`) : [];
    const pics = imageUrls.join(',');

    const newProjectData: Omit<Project, 'id' | 'created_at' | 'updated_at'> = {
      name,
      location,
      type,
      pics,
      number_of_units,
      number_of_sold_items: number_of_sold_items || 0, // Default to 0 if not provided
    };

    const newProject = await ProjectModel.create(newProjectData);
    res.status(201).json(newProject);
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ message: 'Failed to create project' });
  }
};

export const updateProject = async (req: Request, res: Response): Promise<void> => {
  const idParam = req.params.id;
  if (idParam === undefined || isNaN(parseInt(idParam))) {
    res.status(400).json({ message: 'Invalid Project ID' });
    return;
  }
  const id = parseInt(idParam);
  const { name, location, type, number_of_units, number_of_sold_items, existingPicsToRemove } = req.body as UpdateProjectData & { existingPicsToRemove?: string[] };
  const files = req.files as Express.Multer.File[];

  try {
    const newImageUrls = files ? files.map(file => `/uploads/projects/${file.filename}`) : [];
    let existingPics = (await ProjectModel.getById(id))?.pics?.split(',') || [];

    // Remove images if requested
    if (existingPicsToRemove && Array.isArray(existingPicsToRemove)) {
      existingPics = existingPics.filter(pic => !existingPicsToRemove.includes(pic));
      // You might want to implement actual file deletion from the server here
    }

    const updatedPics = [...existingPics, ...newImageUrls].join(',');

    const updateData: Partial<Omit<Project, 'id' | 'created_at' | 'updated_at'>> = {
      name,
      location,
      type,
      pics: updatedPics,
      number_of_units,
      number_of_sold_items,
    };

    const updatedProject = await ProjectModel.update(id, updateData);
    if (updatedProject) {
      res.status(200).json(updatedProject);
    } else {
      res.status(404).json({ message: 'Project not found' });
    }
  } catch (error) {
    console.error(`Error updating project with ID ${id}:`, error);
    res.status(500).json({ message: 'Failed to update project' });
  }
};

export const deleteProject = async (req: Request, res: Response): Promise<void> => {
  const idParam = req.params.id;
  if (idParam === undefined || isNaN(parseInt(idParam))) {
    res.status(400).json({ message: 'Invalid Project ID' });
    return;
  }
  const id = parseInt(idParam);
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