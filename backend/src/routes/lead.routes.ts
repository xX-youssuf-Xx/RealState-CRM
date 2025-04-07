import express from 'express';
import {
  getAllLeads,
  getLeadById,
  createLead,
  updateLead,
  deleteLead,
  transferLead,
  getLeadsBySalesId
} from '../controllers/lead.controller';
import { authenticate } from '../middlewares/auth.middleware'; // Assuming you'll have this

const router = express.Router();

// Apply authentication middleware to all lead routes (you might adjust this per route)
router.use(authenticate);

router.post('/', createLead);
router.get('/', getAllLeads);
router.get('/:id', getLeadById);
router.get('/salesperson/:salesId', getLeadsBySalesId);
router.patch('/:id', updateLead);
router.patch('/:id/transfer', transferLead);
router.delete('/:id', deleteLead);

export default router;