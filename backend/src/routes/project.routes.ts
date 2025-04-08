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
import path from 'path';

const router = express.Router();

router.use(authenticate); // Apply authentication to all project routes

const storage = multer.diskStorage({
  destination: 'uploads/projects/',
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

router.get('/', getAllProjects);
router.get('/:id', getProjectById);
router.post('/', authorize(['ADMIN']), upload.array('images', 10), createProject); // 'images' is the field name for file uploads, max 10 files
router.patch('/:id', authorize(['ADMIN']), upload.array('newImages', 10), updateProject); // 'newImages' for adding new images
router.delete('/:id', authorize(['ADMIN']), deleteProject);

export default router;