import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
          <Card className="w-full max-w-md mx-4">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="rounded-full bg-red-100 p-3 mb-4">
                  <AlertCircle className="h-8 w-8 text-red-500" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Er is iets misgegaan</h1>
                <p className="text-gray-600 mb-6">
                  Er is een onverwachte fout opgetreden. Probeer de pagina te verversen of neem contact op met de beheerder als het probleem aanhoudt.
                </p>
                <Button
                  onClick={() => window.location.reload()}
                  className="w-full flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Pagina verversen
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
} 