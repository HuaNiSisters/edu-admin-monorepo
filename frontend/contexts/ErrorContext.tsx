import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { toast, Toaster } from "sonner";

type AppError = {
  message: string;
  status?: number;
  stage?: string;
};

type ErrorContextValue = {
  error: AppError | null;
  setError: (error: AppError | null) => void;
};

const ErrorContext = createContext<ErrorContextValue | null>(null);

export function ErrorProvider({ children }: { children: ReactNode }) {
  const [error, setError] = useState<AppError | null>(null);

  useEffect(() => {
    if (!error) return;
    toast.error(error.message, { toasterId: "error-toaster" });
    const timer = setTimeout(() => setError(null), 4000);
    return () => clearTimeout(timer);
  }, [error]);

  return (
    <ErrorContext.Provider value={{ error, setError }}>
      {children}
      {error && <Toaster id="error-toaster" position="top-center" />}
    </ErrorContext.Provider>
  );
}

export function useError(): ErrorContextValue {
  const context = useContext(ErrorContext);
  if (!context) throw new Error('useError must be used within an ErrorProvider');
  return context;
}