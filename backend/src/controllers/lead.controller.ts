import type { Request, Response } from 'express';
import { LeadModel } from '../models/lead.model';
// Import Lead as a type
import type { Lead } from '../models/lead.model';

// Import the Omit type utility
import type { Omit } from 'utility-types';

// Define a type for the data expected when creating a lead
type CreateLeadData = Omit<Lead, 'id' | 'created_at' | 'updated_at'>;

export const getAllLeads = async (req: Request, res: Response): Promise<void> => {
  try {
    const leads = await LeadModel.getAll();
    res.status(200).json(leads);
  } catch (error) {
    console.error('Error fetching leads:', error);
    res.status(500).json({ message: 'Failed to fetch leads' });
  }
};

export const getLeadById = async (req: Request, res: Response): Promise<void> => {
  const idParam = req.params.id;
  if (idParam === undefined) {
    res.status(400).json({ message: 'Lead ID is required' });
    return;
  }
  const id = parseInt(idParam, 10);
  if (isNaN(id)) {
    res.status(400).json({ message: 'Invalid Lead ID' });
    return;
  }
  try {
    const lead = await LeadModel.getById(id);
    if (lead) {
      res.status(200).json(lead);
    } else {
      res.status(404).json({ message: 'Lead not found' });
    }
  } catch (error) {
    console.error(`Error fetching lead with ID ${id}:`, error);
    res.status(500).json({ message: 'Failed to fetch lead' });
  }
};

export const getLeadsBySalesId = async (req: Request, res: Response): Promise<void> => {
  const salesIdParam = req.params.salesId;
  if (salesIdParam === undefined) {
    res.status(400).json({ message: 'Sales ID is required' });
    return;
  }
  const salesId = parseInt(salesIdParam, 10);
  if (isNaN(salesId)) {
    res.status(400).json({ message: 'Invalid Sales ID' });
    return;
  }
  try {
    const leads = await LeadModel.getBySalesId(salesId);
    res.status(200).json(leads);
  } catch (error) {
    console.error(`Error fetching leads for sales ID ${salesId}:`, error);
    res.status(500).json({ message: 'Failed to fetch leads for the specified sales person' });
  }
};

export const createLead = async (req: Request, res: Response): Promise<void> => {
  try {
    const leadData = req.body as CreateLeadData; // Explicitly type the request body
    const newLead = await LeadModel.create(leadData);
    res.status(201).json(newLead);
  } catch (error) {
    console.error('Error creating lead:', error);
    res.status(500).json({ message: 'Failed to create lead' });
  }
};

export const updateLead = async (req: Request, res: Response): Promise<void> => {
  const idParam = req.params.id;
  if (idParam === undefined) {
    res.status(400).json({ message: 'Lead ID is required' });
    return;
  }
  const id = parseInt(idParam, 10);
  if (isNaN(id)) {
    res.status(400).json({ message: 'Invalid Lead ID' });
    return;
  }
  try {
    const updateData: Partial<Lead> = req.body; // Use Partial<Lead> for updates
    const updatedLead = await LeadModel.update(id, updateData);
    if (updatedLead) {
      res.status(200).json(updatedLead);
    } else {
      res.status(404).json({ message: 'Lead not found' });
    }
  } catch (error) {
    console.error(`Error updating lead with ID ${id}:`, error);
    res.status(500).json({ message: 'Failed to update lead' });
  }
};

export const deleteLead = async (req: Request, res: Response): Promise<void> => {
  const idParam = req.params.id;
  if (idParam === undefined) {
    res.status(400).json({ message: 'Lead ID is required' });
    return;
  }
  const id = parseInt(idParam, 10);
  if (isNaN(id)) {
    res.status(400).json({ message: 'Invalid Lead ID' });
    return;
  }
  try {
    const deleted = await LeadModel.delete(id);
    if (deleted) {
      res.status(200).json({ message: 'deleted successfully ' }); // No content for successful deletion
    } else {
      res.status(404).json({ message: 'Lead not found' });
    }
  } catch (error) {
    console.error(`Error deleting lead with ID ${id}:`, error);
    res.status(500).json({ message: 'Failed to delete lead' });
  }
};

export const transferLead = async (req: Request, res: Response): Promise<void> => {
  const leadIdParam = req.params.id;
  if (leadIdParam === undefined) {
    res.status(400).json({ message: 'Lead ID is required' });
    return;
  }
  const leadId = parseInt(leadIdParam, 10);
  if (isNaN(leadId)) {
    res.status(400).json({ message: 'Invalid Lead ID' });
    return;
  }

  // Extract new_sales_id and ensure it's a number
  const newSalesIdParam = req.body.new_sales_id;
  if (newSalesIdParam === undefined) {
    res.status(400).json({ message: 'new_sales_id is required' });
    return;
  }

  const newSalesId = parseInt(newSalesIdParam, 10);
  if (isNaN(newSalesId)) {
    res.status(400).json({ message: 'Invalid new_sales_id' });
    return;
  }

  try {
    const transferredLead = await LeadModel.transfer(leadId, newSalesId);
    if (transferredLead) {
      res.status(200).json({
        message: `Lead ${leadId} transferred to salesperson ${newSalesId}`,
        lead: transferredLead,
      });
    } else {
      res.status(404).json({ message: 'Lead not found' });
    }
  } catch (error) {
    console.error(`Error transferring lead ${leadId}:`, error);
    res.status(500).json({ message: 'Failed to transfer lead' });
  }
};