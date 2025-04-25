import {  useCallback } from "react";
import { useApiFetch} from "../utils/useApi";

interface CreateEmployeeBody {
  name: string;
  number: string;
  role: string;
  notes?: string;
  password?: string;
}

export const useCreateEmployee = () => {
  const { isLoading, error, data, setError, _execute } = useApiFetch<any>(); // Adjust the type of 'data' as needed

  const execute = useCallback(
    async (
      name: string,
      number: string,
      role: string,
      notes?: string,
      password?: string,
      options: Record<string, any> = {}
    ) => {
      try {
        const body: CreateEmployeeBody = { name, number, role, notes, password };
        const data = await _execute("employees", "POST", body, options);
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