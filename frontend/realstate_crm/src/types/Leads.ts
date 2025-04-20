export interface Lead {
    id: number;
    name: string;
    number: string;
    source: string;
    address: string;
    state: string;
    substate: string;
    sales_id: number | null;
    budget: number | null;
    notes: string | null;
    created_at: Date;
    updated_at: Date;
    is_created_by_sales: boolean | null;
    notification_id: string | null;
    campaign: string | null;
  }