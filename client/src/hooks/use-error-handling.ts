import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

interface ErrorHandlingOptions {
  showToast?: boolean;
  autoRetry?: boolean;
  maxRetries?: number;
  retryDelay?: number;
  onRetry?: () => Promise<void>;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function useErrorHandling(options: ErrorHandlingOptions = {}) {
  const {
    showToast = true,
    autoRetry = false,
    maxRetries = 3,
    retryDelay = 5000,
    onRetry,
    onSuccess,
    onError,
  } = options;

  const { toast } = useToast();
  const [error, setError] = useState<Error | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const handleError = useCallback(
    async (error: Error) => {
      if (error !== error) {
        setRetryCount(0);
      }
      
      setError(error);

      if (showToast) {
        toast({
          title: "Er is een fout opgetreden",
          description: error.message,
          variant: "destructive",
        });
      }

      if (onError) {
        onError(error);
      }

      if (autoRetry && onRetry && retryCount < maxRetries) {
        setIsRetrying(true);
        setRetryCount((prev) => prev + 1);

        try {
          await new Promise((resolve) => setTimeout(resolve, retryDelay));
          
          await onRetry();
          
          setError(null);
          setIsRetrying(false);
          setRetryCount(0);
          
          if (onSuccess) {
            onSuccess();
          }
        } catch (retryError) {
          setIsRetrying(false);
          
          if (retryCount >= maxRetries - 1) {
            toast({
              title: "Automatisch herstel mislukt",
              description: "Het probleem kon niet automatisch worden opgelost. Probeer het later opnieuw of neem contact op met de helpdesk.",
              variant: "destructive",
            });
          }
        }
      }
    },
    [showToast, autoRetry, maxRetries, retryDelay, onRetry, onSuccess, onError, retryCount, toast]
  );

  const reset = useCallback(() => {
    setError(null);
    setIsRetrying(false);
    setRetryCount(0);
  }, []);

  return {
    error,
    isRetrying,
    retryCount,
    handleError,
    reset,
  };
} 