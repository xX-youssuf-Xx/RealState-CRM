import { useCallback } from "react";
import { useApiFetch } from "../utils/useApi";

export const useCreateProject = () => {
  const { isLoading, error, data, setError, _execute } = useApiFetch<any>(); // Adjust the type of 'data' as needed

  const execute = useCallback(
    async (formData: FormData, options: Record<string, any> = {}) => {
      try {
        // DO NOT set Content-Type header for FormData
        // Let the browser handle it automatically
        const data = await _execute("projects", "POST", formData, options);
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