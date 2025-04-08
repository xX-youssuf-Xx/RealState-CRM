import {  useCallback } from "react";
import { useApiFetch} from "../utils/useApi";

export const useGetAllProjects = () => {
  const { isLoading, error, data, setError, _execute } = useApiFetch<any[]>(); // Adjust the type of 'data' as needed

  const execute = useCallback(async (options: Record<string, any> = {}) => {
    try {
      const data = await _execute("projects", "GET", null, options);
      return data;
    } catch (e) {
      setError(e);
      throw e;
    }
  }, [_execute, setError]);

  return { isLoading, error, data, execute, setError };
};