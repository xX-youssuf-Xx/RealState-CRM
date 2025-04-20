import express from 'express';
import {
  getAllUnits,
  getUnitById,
  getUnitsByProjectId,
  createUnit,
  updateUnit,
  deleteUnit,
  deleteUnitMedia,
  upload
} from '../controllers/unit.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = express.Router();

router.use(authenticate); // Apply authentication to all unit routes

// GET routes
router.get('/', getAllUnits);
router.get('/:id', getUnitById);
router.get('/project/:projectId', getUnitsByProjectId); // Get units by project ID

// POST, PATCH, DELETE routes with form data parsing
router.post('/', authorize(['ADMIN']), upload.array('media_files'), createUnit);
router.patch('/:id', authorize(['ADMIN']), upload.array('media_files'), updateUnit);
router.delete('/:id', authorize(['ADMIN']), deleteUnit);

// Route for deleting specific media file
router.delete('/:id/media/:filePath', authorize(['ADMIN']), deleteUnitMedia);

export default router;