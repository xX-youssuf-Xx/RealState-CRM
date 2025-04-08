import express from 'express';
import {
  getAllTasks,
  getTaskById,
  getTasksByCustomerId,
  getTasksBySalesId,
  getTasksByActionId,
  createTask,
  updateTask,
  deleteTask,
} from '../controllers/task.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = express.Router();

router.use(authenticate); // Apply authentication to all task routes

router.get('/', getAllTasks);
router.get('/:id', getTaskById);
router.get('/customer/:customerId', getTasksByCustomerId);
router.get('/sales/:salesId', getTasksBySalesId);
router.get('/action/:actionId', getTasksByActionId);
router.post('/', authorize(['ADMIN', 'SALES']), createTask); // Example authorization
router.patch('/:id', authorize(['ADMIN', 'SALES']), updateTask); // Example authorization
router.delete('/:id', authorize(['ADMIN']), deleteTask);

export default router;