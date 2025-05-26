import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface APIErrorProps {
  error: Error;
  onRetry?: () => void;
  className?: string;
}

export function APIError({ error, onRetry, className = "" }: APIErrorProps) {
  const getErrorMessage = (error: Error) => {
    // Specifieke foutmeldingen voor verschillende HTTP status codes
    if (error.message.includes("401")) {
      return "U bent niet ingelogd of uw sessie is verlopen. Log opnieuw in om door te gaan.";
    }
    if (error.message.includes("403")) {
      return "U heeft geen toegang tot deze functie.";
    }
    if (error.message.includes("404")) {
      return "De gevraagde informatie kon niet worden gevonden.";
    }
    if (error.message.includes("429")) {
      return "Te veel verzoeken. Probeer het later opnieuw.";
    }
    if (error.message.includes("500")) {
      return "Er is een serverfout opgetreden. Probeer het later opnieuw.";
    }
    return "Er is een fout opgetreden. Probeer het later opnieuw.";
  };

  return (
    <Alert variant="destructive" className={className}>
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Fout</AlertTitle>
      <AlertDescription className="mt-2">
        <p>{getErrorMessage(error)}</p>
        {onRetry && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="mt-4 flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Opnieuw proberen
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
} 