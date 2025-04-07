// src/controllers/report.controller.ts
import type { Request, Response } from 'express';
import { ReportModel } from '../models/report.model';
import type { AuthRequest } from '../middlewares/auth.middleware'; 

const parseDateFilters = (req: Request) => {
  const { period } = req.query;
  let startDate: Date | undefined;
  let endDate: Date | undefined;

  const now = new Date();

  if (period === 'week') {
    const dayOfWeek = now.getDay();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1));
    startOfWeek.setHours(0, 0, 0, 0);
    endDate = new Date(startOfWeek);
    endDate.setDate(startOfWeek.getDate() + 6);
    endDate.setHours(23, 59, 59, 999);
    startDate = startOfWeek;
  } else if (period === 'month') {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    startDate.setHours(0, 0, 0, 0);
    endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    endDate.setHours(23, 59, 59, 999);
  } else if (period === 'year') {
    startDate = new Date(now.getFullYear(), 0, 1);
    startDate.setHours(0, 0, 0, 0);
    endDate = new Date(now.getFullYear() + 1, 0, 0);
    endDate.setHours(23, 59, 59, 999);
  } else if (req.query.startDate && req.query.endDate) {
    startDate = new Date(req.query.startDate as string);
    endDate = new Date(req.query.endDate as string);
  } else if (req.query.startDate) {
    startDate = new Date(req.query.startDate as string);
  } else if (req.query.endDate) {
    endDate = new Date(req.query.endDate as string);
  }
  return { startDate, endDate };
};

export const getAdminTotalSales = async (req: Request, res: Response): Promise<void> => {
  try {
    const { startDate, endDate } = parseDateFilters(req);
    const totalSales = await ReportModel.getTotalSales(startDate, endDate);
    const unitsSold = await ReportModel.getUnitsSoldCount(startDate, endDate);
    res.status(200).json({ totalSales, unitsSold });
  } catch (error) {
    console.error('Error fetching total sales (admin):', error);
    res.status(500).json({ message: 'Failed to fetch total sales' });
  }
};

export const getSalesmanTotalSales = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const salesId = req.user?.id; // Assuming your authentication middleware adds user info to the request
    if (!salesId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    const { startDate, endDate } = parseDateFilters(req);
    const totalSales = await ReportModel.getTotalSales(startDate, endDate, salesId);
    const unitsSold = await ReportModel.getUnitsSoldCount(startDate, endDate, salesId);
    res.status(200).json({ totalSales, unitsSold });
  } catch (error) {
    console.error('Error fetching total sales (salesman):', error);
    res.status(500).json({ message: 'Failed to fetch total sales' });
  }
};