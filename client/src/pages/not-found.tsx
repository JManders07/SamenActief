import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { AlertCircle, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center">
            <div className="rounded-full bg-red-100 p-3 mb-4">
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Pagina niet gevonden</h1>
            <p className="text-gray-600 mb-6">
              De pagina die u zoekt bestaat niet of is verplaatst.
            </p>
            <Button asChild className="w-full">
              <Link href="/" className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                Terug naar homepage
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
