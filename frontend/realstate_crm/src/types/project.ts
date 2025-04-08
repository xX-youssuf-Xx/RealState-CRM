export interface Project {
    id: string
    name: string
    location: string
    type: ProjectType
    pics: string
    number_of_units: number
    created_at: string
    updated_at: string
    number_of_sold_items: number
  }
  
  export type ProjectType = "RESIDENTIAL" | "COMMERCIAL" | "INDUSTRIAL" | "LAND" | "MIXED_USE"
  
  export const projectTypeTranslations: Record<ProjectType, string> = {
    RESIDENTIAL: "سكني",
    COMMERCIAL: "تجاري",
    INDUSTRIAL: "صناعي",
    LAND: "أرض",
    MIXED_USE: "متعدد الاستخدامات",
  }
  
  export interface ProjectFormData {
    name: string
    location: string
    type: ProjectType
    number_of_units: number
    images?: File[]
    newImages?: File[]
  }
  