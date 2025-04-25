import {  useCallback } from "react";
import { useApiFetch} from "../utils/useApi";

export const useDeleteUnit = () => {
  const { isLoading, error, data, setError, _execute } = useApiFetch<any>(); // Adjust the type of 'data' as needed

  const execute = useCallback(async (id: number, options: Record<string, any> = {}) => {
    try {
      const data = await _execute(`units/${id}`, "DELETE", null, options);
      return data;
    } catch (e) {
      setError(e);
      throw e;
    }
  }, [_execute, setError]);

  return { isLoading, error, data, execute, setError };
};