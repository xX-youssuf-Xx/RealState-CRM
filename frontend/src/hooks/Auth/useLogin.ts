import { useCallback } from "react";
import { useApiFetch } from "../utils/useApi";

interface LoginBody {
  number: string;
  password: string;
}

export const useLogin = () => {
  const { isLoading, error, data, setError, _execute } = useApiFetch<any>(); // Adjust the type of 'data' as needed

  const execute = useCallback(
    async (number: string, password: string, options: Record<string, any> = {}) => {
      try {
        const body: LoginBody = { number, password };
        const data = await _execute("auth/login", "POST", body, options);
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