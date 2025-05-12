import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { useAuth } from "@/hooks/use-auth";

const resetPasswordSchema = z.object({
  email: z.string()
    .email("Voer een geldig e-mailadres in")
    .min(1, "E-mailadres is verplicht"),
});

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const [, setLocation] = useLocation();
  const { resetPassword } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ResetPasswordForm) => {
    setIsSubmitting(true);
    try {
      await resetPassword(data.email);
      setLocation("/auth");
    } catch (error) {
      console.error("Reset password failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto flex min-h-screen items-center justify-center px-4 py-8">
      <div className="grid w-full gap-8 lg:grid-cols-2">
        <div className="flex flex-col justify-center space-y-6">
          <div className="flex flex-col items-center mb-4">
            <img 
              src="/SamenActief.png" 
              alt="SamenActief Logo" 
              className="w-64 mx-auto mb-8" 
            />
            <h1 className="text-4xl font-bold">Wachtwoord vergeten</h1>
            <p className="mt-2 text-xl text-muted-foreground">
              Vul uw e-mailadres in om een wachtwoord reset link te ontvangen
            </p>
          </div>

          <Card>
            <CardContent className="pt-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>E-mailadres</FormLabel>
                        <FormDescription>
                          Voer het e-mailadres in waarmee u bent geregistreerd
                        </FormDescription>
                        <FormControl>
                          <Input type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Bezig..." : "Reset link versturen"}
                  </Button>

                  <div className="text-center mt-4">
                    <Button
                      variant="link"
                      onClick={() => setLocation("/auth")}
                      className="text-sm text-muted-foreground hover:text-primary"
                    >
                      Terug naar inloggen
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        <div className="hidden lg:block">
          <img
            src="/Inlogpagina.jpeg"
            alt="Ouderen die samen activiteiten doen in de buurt"
            className="h-full w-full rounded-lg object-cover"
          />
        </div>
      </div>
    </div>
  );
} 