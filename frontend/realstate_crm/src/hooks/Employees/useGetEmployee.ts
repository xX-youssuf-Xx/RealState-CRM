import {  useCallback } from "react";
import { useApiFetch} from "../utils/useApi";


export interface Employee {
    id: number;
    name: string;
    number: string;
    role: string;
    created_at: Date;
    updated_at: Date;
    notes: string | null; // You might consider removing this field eventually
    hashedpass: string | null;
  }


export const useGetEmployee = () => {
  const { isLoading, error, data, setError, _execute } = useApiFetch<Employee>();

  const execute = useCallback(async (id: number, options: Record<string, any> = {}) => {
    try {
      const data = await _execute(`employees/${id}`, "GET", null, options);
      return data;
    } catch (e) {
      setError(e);
      throw e;
    }
  }, [_execute, setError]);

  return { isLoading, error, data, execute, setError };
};