import express from 'express';
import {
  getAllActions,
  getActionById,
  getActionsByCustomerId,
  getActionsBySalesId,
  getActionsByProjectId,
  getActionsByUnitId,
  createAction,
  updateAction,
  deleteAction,
} from '../controllers/action.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = express.Router();

router.use(authenticate); // Apply authentication to all action routes

router.get('/', getAllActions);
router.get('/:id', getActionById);
router.get('/customer/:customerId', getActionsByCustomerId);
router.get('/sales/:salesId', getActionsBySalesId);
router.get('/project/:projectId', getActionsByProjectId);
router.get('/unit/:unitId', getActionsByUnitId);
router.post('/', authorize(['ADMIN', 'SALES']), createAction); // Example authorization
router.patch('/:id', authorize(['ADMIN', 'SALES']), updateAction); // Example authorization
router.delete('/:id', authorize(['ADMIN']), deleteAction);

export default router;