import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ErrorMessageProps {
  title?: string;
  message: string;
  className?: string;
}

export function ErrorMessage({ 
  title = "Fout", 
  message, 
  className = "" 
}: ErrorMessageProps) {
  return (
    <Alert 
      variant="destructive" 
      className={className}
      role="alert"
      aria-live="assertive"
    >
      <AlertCircle className="h-4 w-4" aria-hidden="true" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription className="mt-2">
        {message}
      </AlertDescription>
    </Alert>
  );
}

interface ValidationErrorProps {
  message: string;
  className?: string;
}

export function ValidationError({ message, className = "" }: ValidationErrorProps) {
  return (
    <p 
      className={`text-sm font-medium text-destructive ${className}`}
      role="alert"
      aria-live="polite"
    >
      {message}
    </p>
  );
} 