import ExcelJS from 'exceljs';

interface Employee {
  id: string | number;
  name: string;
  role: string;
  number: string;
}

interface Lead {
  id: string | number;
  name: string;
  state: string;
  substate: string | null;
  sales_id: string | number | null;
  source: string;
  created_at: string | Date;
}

interface Action {
  id: string | number;
  customer_id: string | number | null;
  sales_id: string | number | null;
  prev_state: string | null;
  new_state: string | null;
  prev_substate: string | null;
  new_substate: string | null;
  created_at: string | Date;
  notes: string | null;
}

// Helper to format date with time in 12-hour format (Cairo timezone)
export const formatDate = (date: string | Date): string => {
  if (!date) return '';
  const d = new Date(date);
  
  // Calculate Cairo timezone offset (UTC+2) and add 1 hour
  const cairoDate = new Date(d.getTime() + (3 * 60 * 60 * 1000)); // Changed from 2 to 3 hours
  
  const day = cairoDate.getUTCDate().toString().padStart(2, '0');
  const month = (cairoDate.getUTCMonth() + 1).toString().padStart(2, '0');
  const year = cairoDate.getUTCFullYear();
  
  // Convert to 12-hour format
  let hours = cairoDate.getUTCHours();
  const ampm = hours >= 12 ? 'م' : 'ص'; // PM or AM in Arabic
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  const hoursStr = hours.toString().padStart(2, '0');
  
  const minutes = cairoDate.getUTCMinutes().toString().padStart(2, '0');
  
  return `${day}/${month}/${year} ${hoursStr}:${minutes} ${ampm}`;
};

// State translation mapping
export const stateTranslations: Record<string, string> = {
  NEW: "جديد",
  CONTACTED: "تم التواصل",
  INTERESTED: "مهتم",
  VISITING: "زيارة",
  MEETING: "اجتماع",
  NEGOTIATING: "تفاوض",
  QUALIFIED: "مؤهل",
  CLOSED_WON: "تم الإغلاق (نجاح)",
  CLOSED_LOST: "تم الإغلاق (خسارة)",
  FOLLOW_UP: "متابعة",
};

// State color mapping
export const stateColors: Record<string, string> = {
  NEW: "CCCCFF", // Light Blue
  CONTACTED: "FFCC99", // Light Orange
  INTERESTED: "99CCFF", // Sky Blue
  VISITING: "FFFF99", // Light Yellow
  MEETING: "FF99CC", // Pink
  NEGOTIATING: "CC99FF", // Light Purple
  QUALIFIED: "99FFCC", // Light Green
  CLOSED_WON: "99FF99", // Green
  CLOSED_LOST: "FF9999", // Light Red
  FOLLOW_UP: "CCFFFF", // Light Cyan
};

// Substate translation mapping
export const substateTranslations: Record<string, string> = {
  "": "",
  // Contacted
  "CALLBACK_REQUESTED": "طلب معاودة الاتصال",
  "NO_ANSWER": "لا إجابة",
  "WRONG_NUMBER": "رقم خاطئ",
  // Interested
  "HIGH_INTEREST": "اهتمام عالي",
  "MEDIUM_INTEREST": "اهتمام متوسط",
  "LOW_INTEREST": "اهتمام منخفض",
  // Visiting/Meeting
  "SCHEDULED": "مجدول",
  "COMPLETED": "مكتمل",
  "CANCELLED": "ملغي",
  // Negotiating
  "PRICE_DISCUSSION": "مناقشة السعر",
  "PAYMENT_PLAN": "خطة الدفع",
  "FINAL_OFFER": "العرض النهائي",
  // Qualified
  "READY_TO_BUY": "جاهز للشراء",
  "NEEDS_FINANCING": "يحتاج تمويل",
  "CONSIDERING_OPTIONS": "يدرس الخيارات",
  // Closed Won
  "FULL_PAYMENT": "دفع كامل",
  "INSTALLMENT_PLAN": "خطة أقساط",
  // Closed Lost
  "PRICE_ISSUE": "مشكلة في السعر",
  "LOCATION_ISSUE": "مشكلة في الموقع",
  "COMPETITOR": "ذهب لمنافس",
  "NOT_INTERESTED": "غير مهتم",
  "OTHER": "أخرى",
  // Follow Up
  "PENDING": "قيد الانتظار",
};

// Source translation mapping
export const sourceTranslations: Record<string, string> = {
  "WEBSITE": "الموقع الإلكتروني",
  "SOCIAL_MEDIA": "وسائل التواصل الاجتماعي",
  "REFERRAL": "إحالة",
  "OTHER": "أخرى"
};

// Role translation mapping
export const roleTranslations: Record<string, string> = {
  ADMIN: "مدير النظام",
  SALES: "مبيعات",
  MANAGER: "مدير",
  DELETED: "محذوف",
};

interface ExportData {
  employees: Employee[];
  leads: Lead[];
  actions: Action[];
  selectedSalesIds: number[] | null;
  selectedLeadIds: number[] | null;
  selectedStates: string[] | null;
  startDate: string | null;
  endDate: string | null;
}

// Function to generate Excel file with the report
export const generateSalesReport = async (data: ExportData) => {
  const { employees, leads, actions, selectedSalesIds, selectedLeadIds, selectedStates } = data;
  
  // Filter employees if needed
  const filteredEmployees = selectedSalesIds && selectedSalesIds.length > 0
    ? employees.filter(emp => selectedSalesIds.includes(Number(emp.id)))
    : employees.filter(emp => emp.role === 'SALES' || emp.role === 'MANAGER');
  
  // Filter actions by date range if provided
  let filteredActions = [...actions];
  if (data.startDate) {
    const startDate = new Date(data.startDate);
    filteredActions = filteredActions.filter(action => 
      new Date(action.created_at) >= startDate
    );
  }
  if (data.endDate) {
    const endDate = new Date(data.endDate);
    endDate.setHours(23, 59, 59); // End of the day
    filteredActions = filteredActions.filter(action => 
      new Date(action.created_at) <= endDate
    );
  }

  // Create a new workbook
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("تقرير المبيعات", {
    views: [{ rightToLeft: true }]  // Set RTL for Arabic
  });
  
  // Define columns with increased widths
  sheet.columns = [
    { header: '', key: 'col1', width: 30 },
    { header: '', key: 'col2', width: 20 },
    { header: '', key: 'col3', width: 25 }, // Source cell
    { header: '', key: 'col4', width: 30 }, // Increased width for date cell
    { header: '', key: 'col5', width: 20 },
    { header: '', key: 'col6', width: 40 },
  ];
  
  // Set default row height
  sheet.properties.defaultRowHeight = 20;

  let currentRow = 1;
  
  // Process each employee
  for (const employee of filteredEmployees) {
    // Filter leads for this employee
    const employeeLeads = leads.filter(lead => 
      String(lead.sales_id) === String(employee.id) && 
      (!selectedLeadIds || selectedLeadIds.length === 0 || selectedLeadIds.includes(Number(lead.id))) &&
      (!selectedStates || selectedStates.length === 0 || selectedStates.includes(lead.state))
    );
    
    if (employeeLeads.length === 0) continue; // Skip this employee if no leads match filters
    
    // Add empty rows for spacing
    currentRow += 2;
    
    // Add employee header row
    const employeeRow = sheet.getRow(currentRow);
    employeeRow.getCell(1).value = `${employee.name} - ${employee.number} (${roleTranslations[employee.role] || employee.role})`;
    
    // Apply employee row styling
    for (let i = 1; i <= 6; i++) {
      const cell = employeeRow.getCell(i);
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFFFF00' }  // Yellow background
      };
      cell.font = {
        bold: true,
        size: 14
      };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
      cell.alignment = { 
        horizontal: 'center', // Center employee name
        vertical: 'middle',
        wrapText: true
      };
    }
    
    // Merge cells for employee row
    sheet.mergeCells(currentRow, 1, currentRow, 6);
    
    // Add empty rows for spacing
    currentRow += 2;
    
    // Process each lead for this employee
    for (const lead of employeeLeads) {
      // Get all actions for this lead
      const leadActions = filteredActions.filter(action => 
        String(action.customer_id) === String(lead.id)
      ).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      
      if (leadActions.length === 0 && selectedStates && selectedStates.length > 0) continue;
      
      // Add lead info row
      const leadRow = sheet.getRow(currentRow);
      leadRow.getCell(1).value = `العميل: ${lead.name}`;
      
      // Add state with color highlight
      leadRow.getCell(2).value = `الحالة: ${stateTranslations[lead.state] || lead.state}`;
      leadRow.getCell(2).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: stateColors[lead.state] || 'FFFFFF' }
      };
      
      leadRow.getCell(3).value = `مصدر العميل: ${sourceTranslations[lead.source] || lead.source}`;
      leadRow.getCell(4).value = `تاريخ الإضافة: ${formatDate(lead.created_at)}`;
      
      // Highlight the lead name cell
      leadRow.getCell(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFFFFE0' }  // Light yellow
      };
      leadRow.getCell(1).font = {
        bold: true
      };
      leadRow.getCell(1).border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
      
      // Set alignment for all cells in the lead row
      for (let i = 1; i <= 6; i++) {
        leadRow.getCell(i).alignment = { 
          horizontal: 'right',
          vertical: 'middle',
          wrapText: true
        };
      }
      
      currentRow++;
      
      // Add empty row before actions
      currentRow++;
      
      // Add actions if any
      if (leadActions.length > 0) {
        // Add header for actions
        const headerRow = sheet.getRow(currentRow);
        headerRow.getCell(3).value = 'التاريخ';
        headerRow.getCell(4).value = 'الحالة السابقة';
        headerRow.getCell(5).value = 'الحالة الجديدة';
        headerRow.getCell(6).value = 'ملاحظات';
        
        // Style header row
        for (let i = 3; i <= 6; i++) {
          headerRow.getCell(i).font = { bold: true };
          headerRow.getCell(i).alignment = { horizontal: 'right' };
        }
        
        currentRow++;
        
        // Add actions
        for (const action of leadActions) {
          const actionRow = sheet.getRow(currentRow);
          actionRow.getCell(3).value = formatDate(action.created_at);
          
          // Add previous state with color highlight
          const prevState = action.prev_state || '';
          actionRow.getCell(4).value = stateTranslations[prevState] || '';
          if (prevState && stateColors[prevState]) {
            actionRow.getCell(4).fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: stateColors[prevState] }
            };
          }
          
          // Add new state with color highlight
          const newState = action.new_state || '';
          actionRow.getCell(5).value = stateTranslations[newState] || '';
          if (newState && stateColors[newState]) {
            actionRow.getCell(5).fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: stateColors[newState] }
            };
          }
          
          actionRow.getCell(6).value = action.notes || '';
          
          // Set alignment for all cells in action row
          for (let i = 3; i <= 6; i++) {
            actionRow.getCell(i).alignment = { horizontal: 'right', wrapText: true };
          }
          
          currentRow++;
        }
      }
      
      // Add empty rows after each lead
      currentRow += 3;
    }
    
    // Remove the separator row with dashes
    // Instead just add more space between employees
    currentRow += 3;
  }
  
  // Check if any data was added
  if (currentRow <= 3) {
    sheet.getCell('A1').value = 'لا توجد بيانات تطابق معايير البحث';
  }
  
  // Generate the date for the filename
  const now = new Date();
  const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  
  // Generate buffer for the Excel file
  const buffer = await workbook.xlsx.writeBuffer();
  
  // Create a Blob and download the file
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `تقرير_${dateStr}.xlsx`;
  anchor.click();
  window.URL.revokeObjectURL(url);
};