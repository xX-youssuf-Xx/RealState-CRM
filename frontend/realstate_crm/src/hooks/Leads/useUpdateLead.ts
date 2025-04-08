import {  useCallback } from "react";
import { useApiFetch} from "../utils/useApi";
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
}
type UpdateLeadBody = Partial<Lead>;

export const useUpdateLead = () => {
  const { isLoading, error, data, setError, _execute } = useApiFetch<Lead>();

  const execute = useCallback(
    async (
      id: number,
      name?: string,
      number?: string,
      source?: string,
      address?: string,
      state?: string,
      substate?: string,
      sales_id?: number | null,
      budget?: number | null,
      notes?: string | null,
      is_created_by_sales?: boolean | null,
      notification_id?: string | null,
      options: Record<string, any> = {}
    ) => {
      try {
        const body: UpdateLeadBody = { name, number, source, address, state, substate, sales_id, budget, notes, is_created_by_sales, notification_id };
        const data = await _execute(`leads/${id}`, "PATCH", body, options);
        return data;
      } catch (e) {
        setError(e);
        throw e;
      }
    },
    [_execute, setError]
  );

  return { isLoading, error, data, execute, setError };
};