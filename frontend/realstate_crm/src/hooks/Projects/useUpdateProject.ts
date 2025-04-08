import {  useCallback } from "react";
import { useApiFetch} from "../utils/useApi";

export const useUpdateProject = () => {
  const { isLoading, error, data, setError, _execute } = useApiFetch<any>(); // Adjust the type of 'data' as needed

  const execute = useCallback(
    async (id: number, formData: FormData, options: Record<string, any> = {}) => {
      try {
        options["headers"] = {
          "Content-Type": "multipart/form-data",
          ...options["headers"],
        };
        const data = await _execute(`projects/${id}`, "PATCH", formData, options);
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