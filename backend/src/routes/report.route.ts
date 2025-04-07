import express from 'express';
import { getAdminTotalSales, getSalesmanTotalSales } from '../controllers/report.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = express.Router();

router.use(authenticate);

// Admin-specific sales report
router.get('/admin/sales', authorize(['Admin']), getAdminTotalSales);

// Salesman-specific sales report
router.get('/salesman/me/sales', authorize(['Admin', 'Sales']), getSalesmanTotalSales);

export default router;