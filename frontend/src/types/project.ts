// types.ts (or similar file)

export interface Project {
  id: string; // Keep as string in frontend state for simplicity
  name: string;
  location: string;
  type: ProjectType;
  // pics: string; // REMOVED
  benefits?: string | null; // ADDED (optional to match backend)
  number_of_units: number; // Keep as number, handle potential null from backend if necessary on fetch
  created_at: string; // Keep as string for date formatting
  updated_at: string; // Keep as string for date formatting
  number_of_sold_items: number;
}

export type ProjectType = "RESIDENTIAL" | "COMMERCIAL" | "INDUSTRIAL" | "LAND" | "MIXED_USE" | "MANAGERIAL" | "CLINICS";

export const projectTypeTranslations: Record<ProjectType, string> = {
  RESIDENTIAL: "سكني",
  COMMERCIAL: "تجاري",
  INDUSTRIAL: "صناعي",
  LAND: "أرض",
  MIXED_USE: "متعدد الاستخدامات",
  MANAGERIAL: "إداري",
  CLINICS: "عيادات",
};

// Update FormData type if used explicitly (often inferred)
export interface ProjectFormData {
  name: string;
  location: string;
  type: ProjectType;
  number_of_units: number;
  benefits?: string; // ADDED
  // REMOVED image fields
}