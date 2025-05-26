import { useState, useEffect } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RefreshCw, CheckCircle2, XCircle } from "lucide-react";

interface ErrorRecoveryProps {
  error: Error;
  onRetry: () => Promise<void>;
  maxAttempts?: number;
  retryDelay?: number;
  className?: string;
}

export function ErrorRecovery({
  error,
  onRetry,
  maxAttempts = 3,
  retryDelay = 5000,
  className = "",
}: ErrorRecoveryProps) {
  const [attempts, setAttempts] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [recoveryStatus, setRecoveryStatus] = useState<"idle" | "retrying" | "success" | "failed">("idle");

  useEffect(() => {
    let progressInterval: NodeJS.Timeout;
    let retryTimeout: NodeJS.Timeout;

    if (attempts < maxAttempts) {
      retryTimeout = setTimeout(async () => {
        setIsRetrying(true);
        setProgress(0);
        
        // Start progress animation
        progressInterval = setInterval(() => {
          setProgress((prev) => {
            const newProgress = prev + 10;
            return newProgress > 90 ? 90 : newProgress;
          });
        }, retryDelay / 10);

        try {
          await onRetry();
          setRecoveryStatus("success");
          clearInterval(progressInterval);
          setProgress(100);
        } catch (err) {
          setRecoveryStatus("failed");
          setAttempts((prev) => prev + 1);
          clearInterval(progressInterval);
        } finally {
          setIsRetrying(false);
        }
      }, retryDelay);

      return () => {
        clearTimeout(retryTimeout);
        clearInterval(progressInterval);
      };
    }
  }, [attempts, maxAttempts, onRetry, retryDelay]);

  if (recoveryStatus === "success") {
    return (
      <Alert className={`bg-green-50 border-green-200 ${className}`}>
        <CheckCircle2 className="h-4 w-4 text-green-600" />
        <AlertTitle className="text-green-800">Probleem opgelost</AlertTitle>
        <AlertDescription className="text-green-700">
          De fout is automatisch hersteld. U kunt nu verder gaan.
        </AlertDescription>
      </Alert>
    );
  }

  if (attempts >= maxAttempts) {
    return (
      <Alert variant="destructive" className={className}>
        <XCircle className="h-4 w-4" />
        <AlertTitle>Automatisch herstel mislukt</AlertTitle>
        <AlertDescription>
          <p>Het systeem heeft geprobeerd het probleem automatisch op te lossen, maar dit is niet gelukt.</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setAttempts(0);
              setRecoveryStatus("idle");
              setProgress(0);
            }}
            className="mt-2"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Opnieuw proberen
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert className={className}>
      <RefreshCw className={`h-4 w-4 ${isRetrying ? "animate-spin" : ""}`} />
      <AlertTitle>Probleem oplossen</AlertTitle>
      <AlertDescription>
        <p>Het systeem probeert het probleem automatisch op te lossen...</p>
        <div className="mt-2">
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-muted-foreground mt-1">
            Poging {attempts + 1} van {maxAttempts}
          </p>
        </div>
      </AlertDescription>
    </Alert>
  );
} 