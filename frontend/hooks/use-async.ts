import { useState, useTransition, useCallback } from "react";
import { useError } from "@/contexts/ErrorContext";

export function useAsync() {
  const { setError } = useError();
  const [isPending, startTransition] = useTransition();

  const run = useCallback((asyncFn: () => Promise<void>) => {
    startTransition(async () => {
      try {
        await asyncFn();
      } catch (err) {
        if (err instanceof Error) {
          setError({ message: err.message, status: (err as any).status });
        } else {
          setError({ message: 'An unknown error occurred' });
        }
      }
    });
  }, [setError]);

  return { run, isPending };
}