import express from 'express';
import {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from '../controllers/employee.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = express.Router();

// Apply authentication to all employee routes
router.use(authenticate);

// Only admins should be able to list, create, update, and delete employees (example authorization)
router.get('/', authorize(['Admin']), getAllEmployees);
router.get('/:id', authorize(['Admin']), getEmployeeById);
router.post('/', authorize(['Admin']), createEmployee);
router.patch('/:id', authorize(['Admin']), updateEmployee);
router.delete('/:id', authorize(['Admin']), deleteEmployee);

export default router;