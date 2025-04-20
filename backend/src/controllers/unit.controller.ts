import type { Request, Response } from 'express';
import { UnitModel } from '../models/unit.model';
import type { Unit } from '../models/unit.model';
import type { Omit } from 'utility-types';
import path from 'path';
import fs from 'fs';
import multer from 'multer';

type CreateUnitData = Omit<Unit, 'id' | 'created_at' | 'updated_at'>;
type UpdateUnitData = Partial<Omit<Unit, 'id' | 'created_at' | 'updated_at'>>;

// Helper function to sanitize folder names
const sanitizeFolderName = (name: string): string => {
  return name.replace(/[^a-zA-Z0-9-_]/g, '_');
};

// Helper function to create unit folder
const createUnitFolder = (unitId: number, unitName: string): string => {
  const folderName = `${unitId}-${sanitizeFolderName(unitName)}`;
  const folderPath = path.join(__dirname, '../../uploads/units', folderName);
  
  // Create directory if it doesn't exist
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
  
  return folderPath;
};

// Configure multer storage - will be initialized dynamically for each request
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Create base upload directory if it doesn't exist
    const baseUploadDir = path.join(__dirname, '../../uploads/units');
    if (!fs.existsSync(baseUploadDir)) {
      fs.mkdirSync(baseUploadDir, { recursive: true });
    }
    
    // For updates, use the existing ID from the URL params
    if (req.params.id) {
      UnitModel.getById(parseInt(req.params.id))
        .then(unit => {
          if (unit) {
            const unitFolder = createUnitFolder(unit.id, unit.name);
            cb(null, unitFolder);
          } else {
            // Fallback to temporary folder if unit doesn't exist
            const tempFolder = path.join(baseUploadDir, 'temp');
            if (!fs.existsSync(tempFolder)) {
              fs.mkdirSync(tempFolder, { recursive: true });
            }
            cb(null, tempFolder);
          }
        })
        .catch(err => {
          console.error('Error getting unit for file upload:', err);
          cb(err, '');
        });
    } else {
      // For new units, use a temporary folder first
      // Files will be moved to the correct folder after unit creation
      const tempFolder = path.join(baseUploadDir, 'temp');
      if (!fs.existsSync(tempFolder)) {
        fs.mkdirSync(tempFolder, { recursive: true });
      }
      cb(null, tempFolder);
    }
  },
  filename: (req, file, cb) => {
    // Create unique filename with original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// File filter to only accept images and videos
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimeTypes = [
    'image/jpeg', 'image/png', 'image/gif', 
    'video/mp4', 'video/mpeg', 'video/quicktime'
  ];
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images and videos are allowed.'));
  }
};

// Create multer upload instance
export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB file size limit
  }
});

// Helper function to move files from temp to unit folder
const moveFilesFromTemp = async (files: Express.Multer.File[], unitId: number, unitName: string): Promise<string[]> => {
  const unitFolder = createUnitFolder(unitId, unitName);
  const mediaUrls: string[] = [];
  
  for (const file of files) {
    // Check if the file is in the temp directory
    if (file.path.includes('/temp/') || file.path.includes('\\temp\\')) {
      const newPath = path.join(unitFolder, file.filename);
      
      // Move the file
      try {
        fs.renameSync(file.path, newPath);
        // Update the path in the file object
        file.path = newPath;
        // Create URL path for database (relative to uploads directory)
        const folderName = `${unitId}-${sanitizeFolderName(unitName)}`;
        mediaUrls.push(`/uploads/units/${folderName}/${file.filename}`);
      } catch (error) {
        console.error(`Error moving file ${file.filename}:`, error);
        // If move fails, use original path
        mediaUrls.push(`/uploads/units/temp/${file.filename}`);
      }
    } else {
      // File is already in a unit folder
      const folderName = `${unitId}-${sanitizeFolderName(unitName)}`;
      mediaUrls.push(`/uploads/units/${folderName}/${file.filename}`);
    }
  }
  
  return mediaUrls;
};

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
  try {
    console.log("Request body type:", typeof req.body);
    console.log("Request body content:", req.body);
    console.log("Request files:", req.files);
   
    // Check if req.body exists and is an object
    if (!req.body || typeof req.body !== 'object') {
      res.status(400).json({ message: 'Invalid request body - form data not properly parsed' });
      return;
    }

    // Parse numeric fields safely
    const projectId = req.body.project_id ? parseInt(req.body.project_id.toString()) : null;
    const area = req.body.area ? parseFloat(req.body.area.toString()) : null;
    const price = req.body.price ? parseFloat(req.body.price.toString()) : null;
    const downPayment = req.body.down_payment ? parseFloat(req.body.down_payment.toString()) : null;
    const installmentAmount = req.body.installment_amount ? parseFloat(req.body.installment_amount.toString()) : null;
    const numberOfInstallments = req.body.number_of_installments ? parseInt(req.body.number_of_installments.toString()) : null;

    // Validate required fields
    if (!projectId || !req.body.name) {
      res.status(400).json({ message: 'Missing required fields: project_id and name are required' });
      return;
    }

    const unitData: CreateUnitData = {
      project_id: projectId,
      name: req.body.name.toString(),
      area: area || 0,
      price: price || 0,
      unit_notes: req.body.unit_notes?.toString() || null,
      status: req.body.status?.toString() || 'AVAILABLE',
      sold_date: req.body.sold_date ? new Date(req.body.sold_date.toString()) : null,
      payment_method: req.body.payment_method?.toString() || null,
      down_payment: downPayment,
      installment_amount: installmentAmount,
      number_of_installments: numberOfInstallments,
      media: null // We'll set this after creating the unit and moving files
    };

    console.log("Creating unit with data:", unitData);
    const newUnit = await UnitModel.create(unitData);
    
    // Now handle file uploads - move from temp to unit folder
    let mediaUrls: string[] = [];
    if (req.files && Array.isArray(req.files)) {
      mediaUrls = await moveFilesFromTemp(req.files as Express.Multer.File[], newUnit.id, newUnit.name);
    } else if (req.files && typeof req.files === 'object') {
      // Handle case where files are in an object with arrays
      const fileArray = (req.files as any).media_files;
      if (Array.isArray(fileArray)) {
        mediaUrls = await moveFilesFromTemp(fileArray, newUnit.id, newUnit.name);
      }
    }
    
    // Update unit with media paths if there are any
    if (mediaUrls.length > 0) {
      await UnitModel.update(newUnit.id, {
        media: mediaUrls.join(',')
      });
      
      // Get the updated unit
      const updatedUnit = await UnitModel.getById(newUnit.id);
      res.status(201).json(updatedUnit);
    } else {
      res.status(201).json(newUnit);
    }
  } catch (error) {
    console.error('Error creating unit:', error);
   
    if (error instanceof Error) {
      res.status(500).json({
        message: 'Failed to create unit',
        error: error.message
      });
    } else {
      res.status(500).json({ message: 'Failed to create unit' });
    }
  }
};

export const updateUnit = async (req: Request, res: Response): Promise<void> => {
  const idParam = req.params.id;
  if (idParam === undefined || isNaN(parseInt(idParam))) {
    res.status(400).json({ message: 'Invalid Unit ID' });
    return;
  }
  const id = parseInt(idParam);
 
  try {
    console.log("Request body type:", typeof req.body);
    console.log("Request body content:", req.body);
    console.log("Request files:", req.files);
   
    // Check if req.body exists and is an object
    if (!req.body || typeof req.body !== 'object') {
      res.status(400).json({ message: 'Invalid request body - form data not properly parsed' });
      return;
    }

    const existing = await UnitModel.getById(id);
    if (!existing) {
      res.status(404).json({ message: 'Unit not found' });
      return;
    }

    // Process uploaded files if any
    let mediaUrls: string[] = [];
    if (req.files && Array.isArray(req.files) && (req.files as Express.Multer.File[]).length > 0) {
      // Files should already be in the unit folder since we configured multer that way
      const folderName = `${id}-${sanitizeFolderName(existing.name)}`;
      mediaUrls = (req.files as Express.Multer.File[]).map(file => {
        return `/uploads/units/${folderName}/${file.filename}`;
      });
    } else if (req.files && typeof req.files === 'object') {
      // Handle case where files are in an object with arrays
      const fileArray = (req.files as any).media_files;
      if (Array.isArray(fileArray) && fileArray.length > 0) {
        const folderName = `${id}-${sanitizeFolderName(existing.name)}`;
        mediaUrls = fileArray.map(file => {
          return `/uploads/units/${folderName}/${file.filename}`;
        });
      }
    }

    // Create updates object and handle type conversions
    const updates: UpdateUnitData = {};
   
    if (req.body.project_id !== undefined) {
      const projectId = parseInt(req.body.project_id.toString());
      if (!isNaN(projectId)) updates.project_id = projectId;
    }
   
    if (req.body.name !== undefined) {
      const newName = req.body.name.toString();
      if (newName !== existing.name) {
        // Handle folder rename if name changes
        updates.name = newName;
        
        const oldFolderPath = path.join(__dirname, '../../uploads/units', `${id}-${sanitizeFolderName(existing.name)}`);
        const newFolderPath = path.join(__dirname, '../../uploads/units', `${id}-${sanitizeFolderName(newName)}`);
        
        if (fs.existsSync(oldFolderPath)) {
          fs.renameSync(oldFolderPath, newFolderPath);
          
          // Update media paths in the database if they exist
          if (existing.media) {
            const oldFolderName = `${id}-${sanitizeFolderName(existing.name)}`;
            const newFolderName = `${id}-${sanitizeFolderName(newName)}`;
            const updatedMedia = existing.media.split(',').map(url => 
              url.replace(oldFolderName, newFolderName)
            ).join(',');
            
            updates.media = updatedMedia;
          }
        }
      }
    }
   
    if (req.body.area !== undefined) {
      const area = parseFloat(req.body.area.toString());
      if (!isNaN(area)) updates.area = area;
    }
   
    if (req.body.price !== undefined) {
      const price = parseFloat(req.body.price.toString());
      if (!isNaN(price)) updates.price = price;
    }
   
    if (req.body.unit_notes !== undefined) updates.unit_notes = req.body.unit_notes.toString();
    if (req.body.status !== undefined) updates.status = req.body.status.toString();
   
    if (req.body.sold_date !== undefined) {
      updates.sold_date = req.body.sold_date ? new Date(req.body.sold_date.toString()) : null;
    }
   
    if (req.body.payment_method !== undefined) updates.payment_method = req.body.payment_method.toString();
   
    if (req.body.down_payment !== undefined) {
      if (req.body.down_payment === null || req.body.down_payment === '') {
        updates.down_payment = null;
      } else {
        const downPayment = parseFloat(req.body.down_payment.toString());
        if (!isNaN(downPayment)) updates.down_payment = downPayment;
      }
    }
   
    if (req.body.installment_amount !== undefined) {
      if (req.body.installment_amount === null || req.body.installment_amount === '') {
        updates.installment_amount = null;
      } else {
        const installmentAmount = parseFloat(req.body.installment_amount.toString());
        if (!isNaN(installmentAmount)) updates.installment_amount = installmentAmount;
      }
    }
   
    if (req.body.number_of_installments !== undefined) {
      if (req.body.number_of_installments === null || req.body.number_of_installments === '') {
        updates.number_of_installments = null;
      } else {
        const numberOfInstallments = parseInt(req.body.number_of_installments.toString());
        if (!isNaN(numberOfInstallments)) updates.number_of_installments = numberOfInstallments;
      }
    }
   
    // Handle media files
    if (mediaUrls.length > 0) {
      // If there are existing media files
      if (existing.media) {
        // Append new files to existing media
        const existingMedia = existing.media.split(',');
        updates.media = [...existingMedia, ...mediaUrls].join(',');
      } else {
        // Set new media files
        updates.media = mediaUrls.join(',');
      }
    }

    console.log("Updates to apply:", updates);
   
    if (Object.keys(updates).length === 0) {
      console.log("No updates to apply, returning existing unit");
      res.status(200).json(existing);
      return;
    }

    const updatedUnit = await UnitModel.update(id, updates);
    if (updatedUnit) {
      res.status(200).json(updatedUnit);
    } else {
      res.status(404).json({ message: 'Failed to update unit' });
    }
  } catch (error) {
    console.error(`Error updating unit with ID ${id}:`, error);
   
    if (error instanceof Error) {
      res.status(500).json({
        message: 'Failed to update unit',
        error: error.message
      });
    } else {
      res.status(500).json({ message: 'Failed to update unit' });
    }
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
    // Get unit before deletion to handle file cleanup
    const unit = await UnitModel.getById(id);
    if (unit) {
      // Delete the unit folder
      const unitFolderPath = path.join(__dirname, '../../uploads/units', `${id}-${sanitizeFolderName(unit.name)}`);
      if (fs.existsSync(unitFolderPath)) {
        try {
          // Recursively delete the folder and all contents
          fs.rmSync(unitFolderPath, { recursive: true, force: true });
        } catch (folderError) {
          console.error(`Error deleting folder ${unitFolderPath}:`, folderError);
        }
      }
    }

    const deleted = await UnitModel.delete(id);
    if (deleted) {
      res.status(200).json({ message: 'Unit deleted successfully' });
    } else {
      res.status(404).json({ message: 'Unit not found' });
    }
  } catch (error) {
    console.error(`Error deleting unit with ID ${id}:`, error);
    res.status(500).json({ message: 'Failed to delete unit' });
  }
};

// Helper function to handle file deletion
export const deleteUnitMedia = async (req: Request, res: Response): Promise<void> => {
  const idParam = req.params.id;
  const filePathParam = req.params.filePath;
  
  if (idParam === undefined || isNaN(parseInt(idParam))) {
    res.status(400).json({ message: 'Invalid Unit ID' });
    return;
  }
  
  if (!filePathParam) {
    res.status(400).json({ message: 'File path is required' });
    return;
  }
  
  const id = parseInt(idParam);
  
  try {
    const unit = await UnitModel.getById(id);
    if (!unit) {
      res.status(404).json({ message: 'Unit not found' });
      return;
    }
    
    if (!unit.media) {
      res.status(404).json({ message: 'No media found for this unit' });
      return;
    }
    
    // Get all media paths
    const mediaPaths = unit.media.split(',');
    const decodedFilePath = decodeURIComponent(filePathParam);
    
    // Find the file to delete
    const fileIndex = mediaPaths.findIndex(path => path.includes(decodedFilePath));
    if (fileIndex === -1) {
      res.status(404).json({ message: 'File not found in unit media' });
      return;
    }
    
    // Remove the file from the server
    try {
      if(!mediaPaths[fileIndex]) {
        res.status(404).json({ message: 'File not found in unit media' });
        return;
      }
      const fullPath = path.join(__dirname, '../../', mediaPaths[fileIndex].replace(/^\//, ''));
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    } catch (fileError) {
      console.error(`Error deleting file ${mediaPaths[fileIndex]}:`, fileError);
    }
    
    // Remove the path from the media list
    mediaPaths.splice(fileIndex, 1);
    
    // Update the unit in the database
    const updates: UpdateUnitData = {
      media: mediaPaths.length > 0 ? mediaPaths.join(',') : null
    };
    
    const updatedUnit = await UnitModel.update(id, updates);
    if (updatedUnit) {
      res.status(200).json(updatedUnit);
    } else {
      res.status(500).json({ message: 'Failed to update unit after file deletion' });
    }
  } catch (error) {
    console.error(`Error deleting media for unit with ID ${id}:`, error);
    res.status(500).json({ message: 'Failed to delete unit media' });
  }
};