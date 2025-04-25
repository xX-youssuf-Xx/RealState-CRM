import { useCallback } from "react";
import { useApiFetch } from "../utils/useApi";

export interface Task {
  id: number;
  name: string;
  customer_id: number | null;
  sales_id: number | null;
  created_at: Date;
  updated_at: Date;
  action_id: number | null;
  due_date: Date | null;
  due_date_day_before: Date | null;
  due_date_hour_before: Date | null;
  status_day_before: string | null;
  status_hour_before: string | null;
}

interface CreateTaskBody {
  name: string;
  customer_id?: number;
  sales_id?: number;
  action_id?: number;
  due_date?: string;
  due_date_day_before?: string;
  due_date_hour_before?: string;
  status_day_before?: string;
  status_hour_before?: string;
}

export const useCreateTask = () => {
  const { isLoading, error, data, setError, _execute } = useApiFetch<Task>();

  const execute = useCallback(
    async (
      name: string,
      customer_id?: number,
      sales_id?: number,
      action_id?: number,
      due_date?: string,
      due_date_day_before?: string,
      due_date_hour_before?: string,
      options: Record<string, any> = {}
    ) => {
      try {
        const body: CreateTaskBody = { 
          name, 
          customer_id, 
          sales_id, 
          action_id, 
          due_date,
          due_date_day_before,
          due_date_hour_before,
          status_day_before: "PENDING",
          status_hour_before: "PENDING"
        };
        const data = await _execute("tasks", "POST", body, options);
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
