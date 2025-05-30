import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { TermsAndConditions } from "@/components/terms-and-conditions";
//import { LocationSelector } from "@/components/location-selector"; // Removed as per edit

const loginSchema = z.object({
  username: z.string()
    .email("Voer een geldig e-mailadres in")
    .min(1, "E-mailadres is verplicht"),
  password: z.string().min(6, "Wachtwoord moet minimaal 6 tekens bevatten"),
});

const registerSchema = loginSchema.extend({
  displayName: z.string().min(1, "Naam is verplicht"),
  phone: z.string().min(1, "Telefoonnummer is verplicht"),
  village: z.string().min(1, "Dorp is verplicht"),
  neighborhood: z.string().min(1, "Wijk is verplicht"),
  anonymousParticipation: z.boolean().default(false),
  role: z.enum(['user', 'center_admin']),
  acceptedTerms: z.boolean().refine((val) => val === true, {
    message: "U moet akkoord gaan met de voorwaarden en privacyverklaring",
  }),
});

type LoginForm = z.infer<typeof loginSchema>;
type RegisterForm = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const { user, login, register } = useAuth();
  const [activeTab, setActiveTab] = useState<"login" | "register" | "register_center">("login");

  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      displayName: "",
      phone: "",
      village: "",
      neighborhood: "",
      anonymousParticipation: false,
      role: 'user',
    },
  });

  // Redirect if already logged in
  if (user) {
    setLocation("/home");
    return null;
  }

  const onLogin = async (data: LoginForm) => {
    try {
      const user = await login(data);
      setLocation("/home");
    } catch (error) {
      console.error("Login failed:", error);
      if (error instanceof Error) {
        loginForm.setError("root", {
          type: "manual",
          message: error.message || "Er is een fout opgetreden bij het inloggen. Probeer het later opnieuw."
        });
      }
    }
  };

  const onRegister = async (data: RegisterForm) => {
    try {
      const user = await register(data);
      setLocation("/home");
    } catch (error) {
      console.error("Registration failed:", error);
      if (error instanceof Error) {
        registerForm.setError("root", {
          type: "manual",
          message: error.message || "Er is een fout opgetreden bij het registreren. Probeer het later opnieuw."
        });
      }
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
            <h1 className="text-4xl font-bold">Welkom bij SamenActief</h1>
            <p className="mt-2 text-xl text-muted-foreground">
              Meld u aan om deel te nemen aan activiteiten of beheer uw buurthuis
            </p>
          </div>

          <Card>
            <CardContent className="pt-6">
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="login">Inloggen</TabsTrigger>
                  <TabsTrigger value="register">Registreren</TabsTrigger>
                  <TabsTrigger value="register_center">Buurthuis Registreren</TabsTrigger>
                </TabsList>

                <TabsContent value="login">
                  <Form {...loginForm}>
                    <form
                      onSubmit={loginForm.handleSubmit(onLogin)}
                      className="space-y-4"
                    >
                      <FormField
                        control={loginForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>E-mailadres</FormLabel>
                            <FormControl>
                              <Input type="email" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Wachtwoord</FormLabel>
                            <FormControl>
                              <Input type="password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button
                        type="submit"
                        className="w-full"
                        disabled={loginForm.formState.isSubmitting}
                      >
                        {loginForm.formState.isSubmitting ? "Bezig..." : "Inloggen"}
                      </Button>
                      <div className="text-center mt-4">
                        <Button
                          variant="link"
                          onClick={() => setLocation("/reset-password")}
                          className="text-sm text-muted-foreground hover:text-primary"
                        >
                          Wachtwoord vergeten?
                        </Button>
                      </div>
                    </form>
                  </Form>
                </TabsContent>

                <TabsContent value="register">
                  <Form {...registerForm}>
                    <form
                      onSubmit={registerForm.handleSubmit((data) => onRegister({ ...data, role: 'user' }))}
                      className="space-y-4"
                    >
                      <FormField
                        control={registerForm.control}
                        name="displayName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Naam</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={registerForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>E-mailadres</FormLabel>
                            <FormDescription>
                              Dit e-mailadres wordt gebruikt voor bevestigingen en herinneringen
                            </FormDescription>
                            <FormControl>
                              <Input type="email" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={registerForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Wachtwoord</FormLabel>
                            <FormControl>
                              <Input type="password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={registerForm.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Telefoonnummer</FormLabel>
                            <FormControl>
                              <Input type="tel" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={registerForm.control}
                        name="village"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Gemeente</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={registerForm.control}
                        name="neighborhood"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Wijk</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={registerForm.control}
                        name="anonymousParticipation"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Anoniem deelnemen</FormLabel>
                              <FormDescription>
                                Alleen uw dorp en wijk worden getoond bij activiteiten
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={registerForm.control}
                        name="acceptedTerms"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <TermsAndConditions
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button
                        type="submit"
                        className="w-full"
                        disabled={registerForm.formState.isSubmitting}
                      >
                        {registerForm.formState.isSubmitting ? "Bezig..." : "Registreren"}
                      </Button>
                    </form>
                  </Form>
                </TabsContent>

                <TabsContent value="register_center">
                  <Form {...registerForm}>
                    <form
                      onSubmit={registerForm.handleSubmit((data) => onRegister({ ...data, role: 'center_admin' }))}
                      className="space-y-4"
                    >
                      {registerForm.formState.errors.root && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                          <span className="block sm:inline">{registerForm.formState.errors.root.message}</span>
                        </div>
                      )}
                      <FormField
                        control={registerForm.control}
                        name="displayName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Naam Buurthuis</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={registerForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>E-mailadres beheerder</FormLabel>
                            <FormDescription>
                              Dit e-mailadres wordt gebruikt voor bevestigingen en herinneringen
                            </FormDescription>
                            <FormControl>
                              <Input type="email" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={registerForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Wachtwoord</FormLabel>
                            <FormControl>
                              <Input type="password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={registerForm.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Telefoonnummer</FormLabel>
                            <FormControl>
                              <Input type="tel" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={registerForm.control}
                        name="village"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Gemeente</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={registerForm.control}
                        name="neighborhood"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Wijk</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={registerForm.control}
                        name="acceptedTerms"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <TermsAndConditions
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button
                        type="submit"
                        className="w-full"
                        disabled={registerForm.formState.isSubmitting}
                      >
                        {registerForm.formState.isSubmitting ? "Bezig..." : "Buurthuis Registreren"}
                      </Button>
                    </form>
                  </Form>
                </TabsContent>
              </Tabs>
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