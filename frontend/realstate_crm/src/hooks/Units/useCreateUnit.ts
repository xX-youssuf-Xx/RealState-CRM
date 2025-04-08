import {  useCallback } from "react";
import { useApiFetch} from "../utils/useApi";

interface CreateUnitBody {
  project_id: number;
  name: string;
  area: number;
  price: number;
  unit_notes?: string;
  status: string;
  sold_date?: string | null;
}

export const useCreateUnit = () => {
  const { isLoading, error, data, setError, _execute } = useApiFetch<any>(); // Adjust the type of 'data' as needed

  const execute = useCallback(
    async (
      project_id: number,
      name: string,
      area: number,
      price: number,
      status: string,
      unit_notes?: string,
      sold_date?: string | null,
      options: Record<string, any> = {}
    ) => {
      try {
        const body: CreateUnitBody = { project_id, name, area, price, unit_notes, status, sold_date };
        const data = await _execute("units", "POST", body, options);
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