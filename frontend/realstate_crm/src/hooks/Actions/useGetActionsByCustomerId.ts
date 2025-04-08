import {  useCallback } from "react";
import { useApiFetch} from "../utils/useApi";
export interface Action {
  id: number;
  customer_id: number | null;
  sales_id: number | null;
  created_at: Date;
  updated_at: Date;
  project_id: number | null;
  unit_id: number | null;
  prev_state: string | null;
  prev_substate: string | null;
  new_state: string | null;
  new_substate: string | null;
  notes: string | null;
}



export const useGetActionsByCustomerId = () => {
  const { isLoading, error, data, setError, _execute } = useApiFetch<Action[]>();

  const execute = useCallback(async (customerId: number, options: Record<string, any> = {}) => {
    try {
      const data = await _execute(`actions/customer/${customerId}`, "GET", null, options);
      return data;
    } catch (e) {
      setError(e);
      throw e;
    }
  }, [_execute, setError]);

  return { isLoading, error, data, execute, setError };
};