import {  useCallback } from "react";
import { useApiFetch} from "../utils/useApi";

export interface Task {
    id: number;
    name: string;
    customer_id: number | null;
    sales_id: number | null;
    created_at: Date;
    updated_at: Date;
    action_id: number | null;
    due_date: Date | null;
  }
  
export const useGetATaskbyId = () => {
  const { isLoading, error, data, setError, _execute } = useApiFetch<Task>();

  const execute = useCallback(async (id: number, options: Record<string, any> = {}) => {
    try {
      const data = await _execute(`tasks/${id}`, "GET", null, options);
      return data;
    } catch (e) {
      setError(e);
      throw e;
    }
  }, [_execute, setError]);

  return { isLoading, error, data, execute, setError };
};