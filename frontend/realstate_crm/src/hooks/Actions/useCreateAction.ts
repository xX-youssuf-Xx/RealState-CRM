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
  
interface CreateActionBody {
  customer_id: number;
  sales_id: number;
  project_id?: number;
  unit_id?: number;
  prev_state: string;
  prev_substate?: string;
  new_state: string;
  new_substate?: string;
  notes?: string;
}

export const useCreateAction = () => {
  const { isLoading, error, data, setError, _execute } = useApiFetch<Action>();

  const execute = useCallback(
    async (
      customer_id: number,
      sales_id: number,
      prev_state: string,
      new_state: string,
      prev_substate?: string,
      new_substate?: string,
      project_id?: number,
      unit_id?: number,
      notes?: string,
      options: Record<string, any> = {}
    ) => {
      try {
        const body: CreateActionBody = { customer_id, sales_id, project_id, unit_id, prev_state, prev_substate, new_state, new_substate, notes };
        const data = await _execute("actions", "POST", body, options);
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