import {  useCallback } from "react";
import { useApiFetch} from "../utils/useApi";

export const useGetAllReports = () => {
  const { isLoading, error, data, setError, _execute } = useApiFetch<any>(); // Adjust the type of 'data' as needed

  const execute = useCallback(
    async (period?: string, startDate?: string, endDate?: string, options: Record<string, any> = {}) => {
      try {
        const params = new URLSearchParams();
        if (period) params.append("period", period);
        if (startDate) params.append("startDate", startDate);
        if (endDate) params.append("endDate", endDate);
        const queryString = params.toString();
        const url = queryString ? `reports/admin/sales?${queryString}` : "reports/admin/sales";
        const data = await _execute(url, "GET", null, options);
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