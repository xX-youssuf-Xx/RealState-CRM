import { useState, useCallback } from "react";
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export const useApiFetch = <T>() => {
  // const apiUrlBase = import.meta.env.VITE_API_BASE_URL; 
  const [data, setData] = useState<T | null>(null);

  const [error, setError] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const _execute = useCallback(
    async (
      url: string,
      method: HttpMethod = 'GET',
      body: any = null,
      options: Record<string, any> = {}
    ): Promise<T> => {
      setIsLoading(true);
      setError(null);
      setData(null);

      try {
        // Get the bearer token from storage
        const token = localStorage.getItem('token');

        // Check if body is FormData - if so, don't set Content-Type header (browser will set it)
        const isFormData = body instanceof FormData;

        const headers = {
          // Only set Content-Type for non-FormData requests
          ...(!isFormData && { 'Content-Type': 'application/json' }),
          ...(token && { 'Authorization': `Bearer ${token}` }),
          ...options.headers,
        };

        // Remove Content-Type header if it exists and body is FormData
        if (isFormData && headers['Content-Type']) {
          delete headers['Content-Type'];
        }

        const fetchOptions: RequestInit = {
          method,
          headers,
          // Don't JSON.stringify FormData
          body: isFormData ? body : (body ? JSON.stringify(body) : null),
          ...options,
        };

        // Remove headers from options if they were provided there to avoid duplication
        if (options.headers) {
          delete fetchOptions.headers;
          fetchOptions.headers = headers;
        }

        // const response = await fetch(`${"http://localhost:3001/api"}/${url}`, fetchOptions);
        const response = await fetch(`${"https://amaar.egypt-tech.com/api"}/${url}`, fetchOptions);
        // const response = await fetch(`${apiUrlBase}/${url}`, fetchOptions);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        const responseData: T = await response.json();
        setData(responseData);
        return responseData;
      } catch (err) {
        setError(err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return {
    isLoading,
    error,
    data,
    setError: useCallback((err: any) => setError(err), []),
    _execute,
  };
};