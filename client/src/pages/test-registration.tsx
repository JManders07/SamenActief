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
import { Checkbox } from "@/components/ui/checkbox";
import { TermsAndConditions } from "@/components/terms-and-conditions";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Eye, EyeOff, User, Mail, Lock, Phone, Home, MapPin, UserX, FileText, ClipboardList } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const registerSchema = z.object({
  displayName: z.string().min(1, "Naam is verplicht"),
  username: z.string()
    .email("Voer een geldig e-mailadres in")
    .min(1, "E-mailadres is verplicht"),
  password: z.string().min(6, "Wachtwoord moet minimaal 6 tekens bevatten"),
  phone: z.string().min(1, "Telefoonnummer is verplicht"),
  village: z.string().min(1, "Gemeente is verplicht"),
  neighborhood: z.string().min(1, "Wijk is verplicht"),
  anonymousParticipation: z.boolean().default(false),
  acceptedTerms: z.boolean().refine((val) => val === true, {
    message: "U moet akkoord gaan met de voorwaarden en privacyverklaring",
  }),
});

type RegisterForm = z.infer<typeof registerSchema>;

const steps = [
  {
    title: "Welkom bij SamenActief!",
    description: "Laten we samen uw account aanmaken. Wat is uw naam?",
    field: "displayName",
    icon: User,
    encouragement: "Een goede eerste stap!",
    example: "Bijvoorbeeld: Jan Jansen",
  },
  {
    title: "Contactgegevens",
    description: (name: string) => `Beste ${name}, wat is uw e-mailadres? Dit gebruiken we voor bevestigingen en herinneringen.`,
    field: "username",
    icon: Mail,
    encouragement: "Geweldig gedaan! We gaan goed vooruit.",
    example: "Bijvoorbeeld: jan.jansen@email.nl",
  },
  {
    title: "Beveiliging",
    description: (name: string) => `Beste ${name}, kies een veilig wachtwoord (minimaal 6 tekens).`,
    field: "password",
    icon: Lock,
    encouragement: "Goed bezig met de beveiliging!",
    example: "Bijvoorbeeld: Veilig123!",
  },
  {
    title: "Telefoonnummer",
    description: (name: string) => `Beste ${name}, wat is uw telefoonnummer? Dit gebruiken we alleen in geval van nood.`,
    field: "phone",
    icon: Phone,
    encouragement: "Prima! Nog een paar stappen te gaan.",
    example: "Bijvoorbeeld: 0612345678",
  },
  {
    title: "Locatie",
    description: (name: string) => `Beste ${name}, in welke gemeente woont u?`,
    field: "village",
    icon: Home,
    encouragement: "Uitstekend! U bent al over de helft.",
    example: "Bijvoorbeeld: Eindhoven",
  },
  {
    title: "Wijk",
    description: (name: string) => `Beste ${name}, in welke wijk woont u?`,
    field: "neighborhood",
    icon: MapPin,
    encouragement: "Goed gedaan! Nog maar een paar stappen.",
    example: "Bijvoorbeeld: Centrum of Woensel",
  },
  {
    title: "Privacy",
    description: (name: string) => `Beste ${name}, wilt u anoniem deelnemen aan activiteiten? Dit is volledig optioneel.`,
    field: "anonymousParticipation",
    icon: UserX,
    encouragement: "Bijna klaar! Nog twee stappen te gaan.",
    example: null,
  },
  {
    title: "Voorwaarden",
    description: (name: string) => `Beste ${name}, lees en accepteer de voorwaarden en privacyverklaring.`,
    field: "acceptedTerms",
    icon: FileText,
    encouragement: "Fantastisch! Nog één laatste stap.",
    example: null,
  },
  {
    title: "Overzicht",
    description: "Controleer uw gegevens voordat u zich registreert.",
    field: "overview",
    icon: ClipboardList,
    encouragement: "Perfect! Bekijk uw gegevens en maak de registratie compleet.",
    example: null,
  },
];

export default function TestRegistrationPage() {
  const [, setLocation] = useLocation();
  const { register } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Partial<RegisterForm>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showEncouragement, setShowEncouragement] = useState(false);

  const form = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      displayName: "",
      username: "",
      password: "",
      phone: "",
      village: "",
      neighborhood: "",
      anonymousParticipation: false,
      acceptedTerms: false,
    },
  });

  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleNext = async () => {
    const currentField = steps[currentStep].field;
    const value = form.getValues(currentField as keyof RegisterForm);
    
    if (!value && currentField !== "anonymousParticipation" && currentField !== "overview") {
      form.setError(currentField as keyof RegisterForm, {
        type: "manual",
        message: "Dit veld is verplicht",
      });
      return;
    }

    setFormData(prev => ({
      ...prev,
      [currentField]: value,
    }));

    if (currentStep === steps.length - 1) {
      try {
        await register({
          ...formData,
          role: 'user',
        } as RegisterForm);
        setLocation("/home");
      } catch (error) {
        console.error("Registration failed:", error);
        if (error instanceof Error) {
          form.setError("root", {
            type: "manual",
            message: error.message || "Er is een fout opgetreden bij het registreren. Probeer het later opnieuw."
          });
        }
      }
    } else {
      setShowEncouragement(true);
      setTimeout(() => {
        setCurrentStep(prev => prev + 1);
        setShowEncouragement(false);
      }, 1500);
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
  };

  const currentStepData = steps[currentStep];
  const displayName = form.getValues("displayName") || "Beste gebruiker";

  const getFieldValidation = (fieldName: keyof RegisterForm) => {
    const value = form.getValues(fieldName);
    if (!value) return null;
    const error = form.formState.errors[fieldName];
    return !error;
  };

  const getHelpText = (field: string) => {
    switch (field) {
      case "displayName":
        return "Vul hier uw volledige naam in zoals u bekend wilt staan in de app.";
      case "username":
        return "Vul hier uw e-mailadres in. Dit gebruiken we voor bevestigingen en herinneringen. Voorbeeld: naam@email.nl";
      case "password":
        return "Kies een veilig wachtwoord met minimaal 6 tekens. Gebruik bij voorkeur een combinatie van letters, cijfers en leestekens.";
      case "phone":
        return "Vul hier uw telefoonnummer in. Dit gebruiken we alleen in geval van nood.";
      case "village":
        return "Vul hier de naam van uw gemeente in.";
      case "neighborhood":
        return "Vul hier de naam van uw wijk in.";
      case "anonymousParticipation":
        return "Als u anoniem wilt deelnemen, worden alleen uw dorp en wijk getoond bij activiteiten. Dit is volledig optioneel.";
      case "acceptedTerms":
        return "Lees en accepteer de voorwaarden en privacyverklaring om door te gaan.";
      case "overview":
        return "Controleer hier al uw ingevulde gegevens voordat u zich registreert.";
      default:
        return "";
    }
  };

  const getStepIcon = (field: string) => {
    const StepIcon = steps.find(step => step.field === field)?.icon || User;
    return <StepIcon className="h-10 w-10 text-primary" />;
  };

  return (
    <div className="container mx-auto flex min-h-screen items-center justify-center px-4 py-8">
      <div className="w-full max-w-3xl">
        <div className="mb-8 text-center">
          <img 
            src="/SamenActief.png" 
            alt="SamenActief Logo" 
            className="w-64 mx-auto mb-6" 
          />
          <div className="flex items-center justify-center mb-4">
            <div className="bg-primary/10 p-4 rounded-full mr-4">
              {getStepIcon(currentStepData.field)}
            </div>
            <h1 className="text-4xl font-bold">{currentStepData.title}</h1>
          </div>
          <p className="text-xl text-muted-foreground mb-4">
            {typeof currentStepData.description === 'function' 
              ? currentStepData.description(displayName)
              : currentStepData.description}
          </p>
          <AnimatePresence>
            {showEncouragement && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-green-100 text-green-800 p-4 rounded-lg mb-4 inline-block"
              >
                <p className="text-xl font-medium">
                  {currentStepData.encouragement}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <Card className="shadow-lg">
          <CardContent className="pt-8">
            <Progress value={progress} className="mb-8 h-3 bg-gray-200">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </Progress>
            
            <Form {...form}>
              <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    {currentStepData.field === "displayName" && (
                      <FormField
                        control={form.control}
                        name="displayName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xl flex items-center">
                              <User className="h-5 w-5 mr-2" />
                              Naam
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input 
                                  {...field} 
                                  className="h-14 text-lg pr-10 pl-10 border-2"
                                  placeholder={currentStepData.example || ""}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      handleNext();
                                    }
                                  }}
                                />
                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                                {getFieldValidation("displayName") && (
                                  <CheckCircle2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500 h-6 w-6" />
                                )}
                              </div>
                            </FormControl>
                            <FormDescription className="text-lg">
                              {getHelpText("displayName")}
                            </FormDescription>
                            <FormMessage className="text-lg" />
                          </FormItem>
                        )}
                      />
                    )}

                    {currentStepData.field === "username" && (
                      <FormField
                        control={form.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xl flex items-center">
                              <Mail className="h-5 w-5 mr-2" />
                              E-mailadres
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input 
                                  type="email" 
                                  {...field} 
                                  className="h-14 text-lg pr-10 pl-10 border-2"
                                  placeholder={currentStepData.example || ""}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      handleNext();
                                    }
                                  }}
                                />
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                                {getFieldValidation("username") && (
                                  <CheckCircle2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500 h-6 w-6" />
                                )}
                              </div>
                            </FormControl>
                            <FormDescription className="text-lg">
                              {getHelpText("username")}
                            </FormDescription>
                            <FormMessage className="text-lg" />
                          </FormItem>
                        )}
                      />
                    )}

                    {currentStepData.field === "password" && (
                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xl flex items-center">
                              <Lock className="h-5 w-5 mr-2" />
                              Wachtwoord
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input 
                                  type={showPassword ? "text" : "password"}
                                  {...field} 
                                  className="h-14 text-lg pr-20 pl-10 border-2"
                                  placeholder={currentStepData.example || ""}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      handleNext();
                                    }
                                  }}
                                />
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                                  onClick={() => setShowPassword(!showPassword)}
                                >
                                  {showPassword ? (
                                    <EyeOff className="h-5 w-5" />
                                  ) : (
                                    <Eye className="h-5 w-5" />
                                  )}
                                </Button>
                                {getFieldValidation("password") && (
                                  <CheckCircle2 className="absolute right-12 top-1/2 transform -translate-y-1/2 text-green-500 h-6 w-6" />
                                )}
                              </div>
                            </FormControl>
                            <FormDescription className="text-lg">
                              {getHelpText("password")}
                            </FormDescription>
                            <FormMessage className="text-lg" />
                          </FormItem>
                        )}
                      />
                    )}

                    {currentStepData.field === "phone" && (
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xl flex items-center">
                              <Phone className="h-5 w-5 mr-2" />
                              Telefoonnummer
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input 
                                  type="tel" 
                                  {...field} 
                                  className="h-14 text-lg pr-10 pl-10 border-2"
                                  placeholder={currentStepData.example || ""}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      handleNext();
                                    }
                                  }}
                                />
                                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                                {getFieldValidation("phone") && (
                                  <CheckCircle2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500 h-6 w-6" />
                                )}
                              </div>
                            </FormControl>
                            <FormDescription className="text-lg">
                              {getHelpText("phone")}
                            </FormDescription>
                            <FormMessage className="text-lg" />
                          </FormItem>
                        )}
                      />
                    )}

                    {currentStepData.field === "village" && (
                      <FormField
                        control={form.control}
                        name="village"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xl flex items-center">
                              <Home className="h-5 w-5 mr-2" />
                              Gemeente
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input 
                                  {...field} 
                                  className="h-14 text-lg pr-10 pl-10 border-2"
                                  placeholder={currentStepData.example || ""}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      handleNext();
                                    }
                                  }}
                                />
                                <Home className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                                {getFieldValidation("village") && (
                                  <CheckCircle2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500 h-6 w-6" />
                                )}
                              </div>
                            </FormControl>
                            <FormDescription className="text-lg">
                              {getHelpText("village")}
                            </FormDescription>
                            <FormMessage className="text-lg" />
                          </FormItem>
                        )}
                      />
                    )}

                    {currentStepData.field === "neighborhood" && (
                      <FormField
                        control={form.control}
                        name="neighborhood"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xl flex items-center">
                              <MapPin className="h-5 w-5 mr-2" />
                              Wijk
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input 
                                  {...field} 
                                  className="h-14 text-lg pr-10 pl-10 border-2"
                                  placeholder={currentStepData.example || ""}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      handleNext();
                                    }
                                  }}
                                />
                                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                                {getFieldValidation("neighborhood") && (
                                  <CheckCircle2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500 h-6 w-6" />
                                )}
                              </div>
                            </FormControl>
                            <FormDescription className="text-lg">
                              {getHelpText("neighborhood")}
                            </FormDescription>
                            <FormMessage className="text-lg" />
                          </FormItem>
                        )}
                      />
                    )}

                    {currentStepData.field === "anonymousParticipation" && (
                      <FormField
                        control={form.control}
                        name="anonymousParticipation"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-4 space-y-0 rounded-md border-2 p-6">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                className="h-8 w-8"
                              />
                            </FormControl>
                            <div className="space-y-2 leading-none">
                              <FormLabel className="text-xl flex items-center">
                                <UserX className="h-5 w-5 mr-2" />
                                Anoniem deelnemen
                              </FormLabel>
                              <FormDescription className="text-lg">
                                {getHelpText("anonymousParticipation")}
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                    )}

                    {currentStepData.field === "acceptedTerms" && (
                      <FormField
                        control={form.control}
                        name="acceptedTerms"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xl flex items-center mb-2">
                              <FileText className="h-5 w-5 mr-2" />
                              Voorwaarden en privacyverklaring
                            </FormLabel>
                            <FormControl>
                              <TermsAndConditions
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormDescription className="text-lg mt-2">
                              {getHelpText("acceptedTerms")}
                            </FormDescription>
                            <FormMessage className="text-lg" />
                          </FormItem>
                        )}
                      />
                    )}

                    {currentStepData.field === "overview" && (
                      <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4 text-lg border-2 rounded-lg p-6">
                          <div className="font-semibold flex items-center">
                            <User className="h-5 w-5 mr-2" />
                            Naam:
                          </div>
                          <div>{formData.displayName}</div>
                          
                          <div className="font-semibold flex items-center">
                            <Mail className="h-5 w-5 mr-2" />
                            E-mailadres:
                          </div>
                          <div>{formData.username}</div>
                          
                          <div className="font-semibold flex items-center">
                            <Phone className="h-5 w-5 mr-2" />
                            Telefoonnummer:
                          </div>
                          <div>{formData.phone}</div>
                          
                          <div className="font-semibold flex items-center">
                            <Home className="h-5 w-5 mr-2" />
                            Gemeente:
                          </div>
                          <div>{formData.village}</div>
                          
                          <div className="font-semibold flex items-center">
                            <MapPin className="h-5 w-5 mr-2" />
                            Wijk:
                          </div>
                          <div>{formData.neighborhood}</div>
                          
                          <div className="font-semibold flex items-center">
                            <UserX className="h-5 w-5 mr-2" />
                            Anoniem deelnemen:
                          </div>
                          <div>{formData.anonymousParticipation ? "Ja" : "Nee"}</div>
                        </div>
                        <div className="bg-muted p-4 rounded-lg text-lg">
                          <p className="flex items-center">
                            <ClipboardList className="h-5 w-5 mr-2" />
                            {getHelpText("overview")}
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between pt-6">
                      {currentStep > 0 && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleBack}
                          className="text-lg h-14 px-8"
                        >
                          Vorige
                        </Button>
                      )}
                      <Button
                        type="button"
                        className={`text-lg h-14 px-8 ${currentStep === 0 ? "w-full" : ""}`}
                        onClick={handleNext}
                      >
                        {currentStep === steps.length - 1 ? "Registreren" : "Volgende"}
                      </Button>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 