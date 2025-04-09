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
router.get('/', authorize(['ADMIN','SALES']), getAllEmployees);
router.get('/:id', authorize(['ADMIN']), getEmployeeById);
router.post('/', authorize(['ADMIN']), createEmployee);
router.patch('/:id', authorize(['ADMIN']), updateEmployee);
router.delete('/:id', authorize(['ADMIN']), deleteEmployee);

export default router;