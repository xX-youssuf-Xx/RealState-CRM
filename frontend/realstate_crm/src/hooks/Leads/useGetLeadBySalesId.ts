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
  campaign: string | null;
}
export const useGetLeadBySalesId = () => {
  const { isLoading, error, data, setError, _execute } = useApiFetch<Lead[]>();

  const execute = useCallback(async (salesId: number, options: Record<string, any> = {}) => {
    try {
      const data = await _execute(`leads/salesperson/${salesId}`, "GET", null, options);
      return data;
    } catch (e) {
      setError(e);
      throw e;
    }
  }, [_execute, setError]);

  return { isLoading, error, data, execute, setError };
};