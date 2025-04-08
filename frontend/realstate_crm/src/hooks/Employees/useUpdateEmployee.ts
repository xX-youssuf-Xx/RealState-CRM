import {  useCallback } from "react";
import { useApiFetch} from "../utils/useApi";

interface UpdateEmployeeBody {
  name?: string;
  number?: string;
  role?: string;
  notes?: string;
  password?: string;
}

export const useUpdateEmployee = () => {
  const { isLoading, error, data, setError, _execute } = useApiFetch<any>(); // Adjust the type of 'data' as needed

  const execute = useCallback(
    async (
      id: number,
      name?: string,
      number?: string,
      role?: string,
      notes?: string,
      password?: string,
      options: Record<string, any> = {}
    ) => {
      try {
        const body: UpdateEmployeeBody = { name, number, role, notes, password };
        const data = await _execute(`employees/${id}`, "PATCH", body, options);
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