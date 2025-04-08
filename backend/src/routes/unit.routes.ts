import express from 'express';
import {
  getAllUnits,
  getUnitById,
  getUnitsByProjectId,
  createUnit,
  updateUnit,
  deleteUnit,
} from '../controllers/unit.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = express.Router();

router.use(authenticate); // Apply authentication to all unit routes

// Example: Only admins can create, update, and delete units
router.get('/', getAllUnits);
router.get('/:id', getUnitById);
router.get('/project/:projectId', getUnitsByProjectId); // Get units by project ID
router.post('/', authorize(['ADMIN']), createUnit);
router.patch('/:id', authorize(['ADMIN']), updateUnit);
router.delete('/:id', authorize(['ADMIN']), deleteUnit);

export default router;