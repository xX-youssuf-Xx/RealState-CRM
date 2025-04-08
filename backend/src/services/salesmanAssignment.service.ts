import { EmployeeModel } from '../models/employee.model';
import type {  Employee } from '../models/employee.model';

let salesEmployeeQueue: Employee[] = [];
let currentSalesEmployeeIndex = 0;

async function loadSalesEmployees() {
  salesEmployeeQueue = await EmployeeModel.getByRole('SALES');
  currentSalesEmployeeIndex = 0; // Reset the index on load
}

// Load sales employees on server start or when employees are updated
loadSalesEmployees();

export const getNextSalesEmployeeId = async (): Promise<number | null> => {
  if (salesEmployeeQueue.length === 0) {
    await loadSalesEmployees(); // Try to load again if empty
    if (salesEmployeeQueue.length === 0) {
      console.warn('No sales employees found for lead assignment.');
      return null;
    }
  }

  const salesEmployee = salesEmployeeQueue[currentSalesEmployeeIndex];
  currentSalesEmployeeIndex = (currentSalesEmployeeIndex + 1) % salesEmployeeQueue.length;
  if(!salesEmployee) return null; // Safety check
  return salesEmployee.id;
};