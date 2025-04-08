export interface Unit {
    id: string
    project_id: string
    name: string
    area: string
    price: string
    unit_notes: string | null
    created_at: string
    updated_at: string
    status: UnitStatus | null
    sold_date: string | null
  }
  
  export type UnitStatus = "AVAILABLE" | "RESERVED" | "SOLD"
  
  export const unitStatusTranslations: Record<UnitStatus, string> = {
    AVAILABLE: "متاح",
    RESERVED: "محجوز",
    SOLD: "مباع",
  }
  
  export interface UnitFormData {
    project_id: number
    name: string
    area: number
    price: number
    unit_notes: string
    status: UnitStatus
    sold_date: string | null
  }
  
  export interface FilterOptions {
    status: UnitStatus | null
    minArea: number | null
    maxArea: number | null
    minPrice: number | null
    maxPrice: number | null
  }
  