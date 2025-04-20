// project.routes.ts
import express from 'express';
import {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
} from '../controllers/project.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import multer from 'multer';

const upload = multer();
const router = express.Router();

// Apply authentication to all project routes
router.use(authenticate);

router.get('/', getAllProjects);
router.get('/:id', getProjectById);
router.post('/', authorize(['ADMIN', 'SALES_ADMIN']), upload.none(), createProject);
router.patch('/:id', authorize(['ADMIN', 'SALES_ADMIN']), upload.none(), updateProject);
router.delete('/:id', authorize(['ADMIN', 'SALES_ADMIN']), deleteProject);

export default router;