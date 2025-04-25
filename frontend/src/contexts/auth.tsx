import React, { createContext, useState, useContext, useCallback, ReactNode } from 'react';
import { useLogin } from '../hooks/Auth/useLogin';

interface Employee {
  id: string;
  name: string;
  role: string;
  number: string;
}

interface LoginResponse {
  token: string;
  employee: Employee;
}

interface AuthContextType {
  employee: Employee | null;
  isLoading: boolean;
  error: any;
  login: (number: string, password: string) => Promise<LoginResponse>;
  logout: () => void;
}

// Create the context with default values
const AuthContext = createContext<AuthContextType>({
  employee: null,
  isLoading: false,
  error: null,
  login: async (): Promise<LoginResponse> => { 
    return Promise.resolve({ token: '', employee: { id: '', name: '', role: '', number: '' } }) 
  },
  logout: () => {}
});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [employee, setEmployee] = useState<Employee | null>(() => {
    try {
      const storedEmployee = localStorage.getItem('employee');
      return storedEmployee ? JSON.parse(storedEmployee) : null;
    } catch (err) {
      console.error("Failed to parse stored employee data:", err);
      localStorage.removeItem('employee');
      return null;
    }
  });

  const { isLoading, error, execute } = useLogin();

  const login = useCallback(async (number: string, password: string): Promise<LoginResponse> => {
    try {
      // Use the execute function from your useLogin hook
      const loginData = await execute(number, password);

      if (loginData?.token && loginData?.employee) {
        // Store data in localStorage
        localStorage.setItem('employee', JSON.stringify(loginData.employee));
        localStorage.setItem('token', loginData.token);
        // Update state
        setEmployee(loginData.employee);
        return loginData;
      } else {
        throw new Error("Invalid login response from server.");
      }
    } catch (loginError: any) {
      console.error("AuthProvider: Login failed:", loginError);
      localStorage.removeItem('token');
      localStorage.removeItem('employee');
      setEmployee(null);
      throw loginError;
    }
  }, [execute]);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('employee');
    setEmployee(null);
    console.log("AuthProvider: User logged out.");
  }, []);

  const authValue: AuthContextType = {
    employee,
    isLoading,
    error,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={authValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};