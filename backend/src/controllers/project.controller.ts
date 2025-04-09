import { ProjectModel } from '../models/project.model';
import type { Request, Response } from 'express';
import type { Project } from '../models/project.model';
import type { Omit } from 'utility-types';
import multer from 'multer';
import path from 'path';
import fs from 'fs'; 

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
  const files = req.files as Express.Multer.File[] | undefined;

  let newlyUploadedUrls: string[] = []; // Keep track of files uploaded in this request

  try {
      // 1. Get current project state *before* making changes
      const projectBeforeUpdate = await ProjectModel.getById(id);
      if (!projectBeforeUpdate) {
          res.status(404).json({ message: 'Project not found' });
          return;
      }
      const oldImageUrls = projectBeforeUpdate.pics?.split(',').filter(p => p) || []; // Get valid existing URLs

      // --- Image Handling Logic ---
      let finalImageUrls: string[] = [];
      const hasNewFiles = files && files.length > 0;

      if (hasNewFiles) {
          // CASE A: New files uploaded - Replace all existing images
          newlyUploadedUrls = files.map(file => `/uploads/projects/${file.filename}`);
          finalImageUrls = newlyUploadedUrls;

          // Delete the OLD physical files associated with the project
          await deleteFilesFromServer(oldImageUrls);

      } else {
          // CASE B: No new files uploaded - Use existing, potentially filtering some
          let currentImageUrls = [...oldImageUrls]; // Start with the old URLs

          if (existingPicsToRemove && Array.isArray(existingPicsToRemove) && existingPicsToRemove.length > 0) {
               const urlsToRemoveSet = new Set(existingPicsToRemove);
               const urlsActuallyRemoved: string[] = [];

               // Filter out images marked for removal
               currentImageUrls = currentImageUrls.filter(picUrl => {
                   if (urlsToRemoveSet.has(picUrl)) {
                       urlsActuallyRemoved.push(picUrl); // Keep track of what to delete
                       return false; // Exclude from final list
                   }
                   return true; // Keep in final list
               });

               // Delete the physical files that were explicitly removed
               if (urlsActuallyRemoved.length > 0) {
                  await deleteFilesFromServer(urlsActuallyRemoved);
               }
          }
          finalImageUrls = currentImageUrls; // Assign the potentially filtered list
      }

      // 2. Join the final list into a comma-separated string
      const updatedPicsString = finalImageUrls.join(',');

      // --- Prepare and Execute Update ---
      const updateData: Partial<Omit<Project, 'id' | 'created_at' | 'updated_at'>> = {};
      let hasDataChanges = false; // Flag to check if any field *value* actually changed

      // Build updateData and track changes
      if (name !== undefined && projectBeforeUpdate.name !== name) { updateData.name = name; hasDataChanges = true; }
      if (location !== undefined && projectBeforeUpdate.location !== location) { updateData.location = location; hasDataChanges = true; }
      if (type !== undefined && projectBeforeUpdate.type !== type) { updateData.type = type; hasDataChanges = true; }
      if (number_of_units !== undefined && projectBeforeUpdate.number_of_units !== number_of_units) { updateData.number_of_units = number_of_units; hasDataChanges = true; }
      if (number_of_sold_items !== undefined && projectBeforeUpdate.number_of_sold_items !== number_of_sold_items) { updateData.number_of_sold_items = number_of_sold_items; hasDataChanges = true; }
      // Always include 'pics' if it changed
      if (projectBeforeUpdate.pics !== updatedPicsString) {
          updateData.pics = updatedPicsString;
          hasDataChanges = true;
      }


      // Only update DB if there were actual changes
      if (Object.keys(updateData).length > 0) {
          const updatedProject = await ProjectModel.update(id, updateData);
          if (updatedProject) {
              res.status(200).json(updatedProject);
          } else {
              // Should not happen if project existed, but handle defensively
              res.status(404).json({ message: 'Project not found during update attempt' });
               // If update failed after new files were uploaded, attempt cleanup
               if (newlyUploadedUrls.length > 0) {
                   console.warn(`Database update failed for project ${id}. Attempting to clean up newly uploaded files.`);
                   await deleteFilesFromServer(newlyUploadedUrls);
               }
          }
      } else {
           // No changes were detected
           console.log(`No actual changes detected for project ${id}. Returning current data.`);
           res.status(200).json(projectBeforeUpdate); // Return the unchanged project data
      }

  } catch (error) {
      console.error(`Error updating project with ID ${id}:`, error);
       // General error: If new files were involved in this failed request, try to clean them up
       if (newlyUploadedUrls.length > 0) {
           console.warn(`An error occurred during project ${id} update. Attempting to clean up newly uploaded files.`);
           await deleteFilesFromServer(newlyUploadedUrls);
       }
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


async function deleteFilesFromServer(fileUrls: string[]): Promise<void> {
  console.log("Attempting to delete files:", fileUrls);
  for (const relativeUrl of fileUrls) {
      if (!relativeUrl || typeof relativeUrl !== 'string' || !relativeUrl.startsWith('/uploads/')) {
          console.warn(`Skipping invalid or empty URL: ${relativeUrl}`);
          continue;
      }
      try {
          // Remove the leading '/' from the URL path so path.join works correctly
          const urlPath = relativeUrl.substring(1); // Example: '/uploads/projects/img.jpg' becomes 'uploads/projects/img.jpg'

          // Construct the absolute file path *without* the 'public' segment
          // Joins the current working directory (backend root) with the URL path
          const filePath = path.join(process.cwd(), urlPath);
          // Example filePath: C:\programming\Main Projects\RealState-CRM\backend\uploads\projects\newImages...jpg

          console.log(`Constructed file path for deletion: ${filePath}`); // Add log to verify

          // Check if file exists before attempting delete
          try {
               await fs.promises.access(filePath); // Check existence
               await fs.promises.unlink(filePath); // Delete the file
               console.log(`Successfully deleted file: ${filePath}`);
          } catch (accessError: any) {
               if (accessError.code === 'ENOENT') {
                   console.log(`File not found (skipping delete): ${filePath}`);
               } else {
                    console.error(`Error accessing file ${filePath} before delete:`, accessError);
               }
          }

      } catch (unlinkError: any) {
           if (unlinkError.code !== 'ENOENT') {
               console.error(`Error deleting file ${relativeUrl} (path constructed as: ${path.join(process.cwd(), relativeUrl.substring(1))}):`, unlinkError);
          }
      }
  }
}