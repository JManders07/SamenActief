import { AlertCircle, RefreshCw, HelpCircle, ExternalLink } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Link } from "wouter";

interface APIErrorProps {
  error: Error;
  onRetry?: () => void;
  className?: string;
}

export function APIError({ error, onRetry, className = "" }: APIErrorProps) {
  const getErrorMessage = (error: Error) => {
    // Specifieke foutmeldingen voor verschillende HTTP status codes
    if (error.message.includes("401")) {
      return {
        title: "U bent uitgelogd",
        message: "Uw sessie is verlopen of u bent niet ingelogd.",
        solution: "Log opnieuw in om door te gaan.",
        helpLink: "/auth"
      };
    }
    if (error.message.includes("403")) {
      return {
        title: "Geen toegang",
        message: "U heeft geen toegang tot deze functie.",
        solution: "Controleer of u bent ingelogd met het juiste account of neem contact op met de beheerder.",
        helpLink: "/help"
      };
    }
    if (error.message.includes("404")) {
      return {
        title: "Pagina niet gevonden",
        message: "De gevraagde informatie kon niet worden gevonden.",
        solution: "Controleer of de URL correct is of ga terug naar de homepage.",
        helpLink: "/"
      };
    }
    if (error.message.includes("429")) {
      return {
        title: "Te veel verzoeken",
        message: "U heeft te veel verzoeken verzonden in korte tijd.",
        solution: "Wacht even en probeer het later opnieuw.",
        helpLink: null
      };
    }
    if (error.message.includes("500")) {
      return {
        title: "Serverfout",
        message: "Er is een probleem met de server.",
        solution: "Ons team is op de hoogte en werkt aan een oplossing. Probeer het later opnieuw.",
        helpLink: "/help"
      };
    }
    if (error.message.includes("network")) {
      return {
        title: "Geen internetverbinding",
        message: "Er is geen verbinding met het internet.",
        solution: "Controleer uw internetverbinding en probeer het opnieuw.",
        helpLink: null
      };
    }
    return {
      title: "Er is een fout opgetreden",
      message: "Er is iets misgegaan bij het uitvoeren van deze actie.",
      solution: "Probeer het later opnieuw of neem contact op met de helpdesk.",
      helpLink: "/help"
    };
  };

  const errorInfo = getErrorMessage(error);

  return (
    <Alert variant="destructive" className={className}>
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{errorInfo.title}</AlertTitle>
      <AlertDescription className="mt-2 space-y-4">
        <p>{errorInfo.message}</p>
        <p className="font-medium">{errorInfo.solution}</p>
        
        <div className="flex flex-wrap gap-2">
          {onRetry && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Opnieuw proberen
            </Button>
          )}
          
          {errorInfo.helpLink && (
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <HelpCircle className="h-4 w-4" />
                  Hulp nodig?
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Hulp bij {errorInfo.title}</DialogTitle>
                  <DialogDescription>
                    Hier zijn enkele stappen die u kunt proberen:
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <p>{errorInfo.message}</p>
                  <p className="font-medium">{errorInfo.solution}</p>
                  {errorInfo.helpLink && (
                    <Button asChild className="w-full">
                      <Link href={errorInfo.helpLink}>
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Ga naar hulppagina
                      </Link>
                    </Button>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
} 