import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin } from "lucide-react";
import ReCAPTCHA from "react-google-recaptcha";
import { useState } from "react";

export default function ContactPage() {
  const [recaptchaValue, setRecaptchaValue] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recaptchaValue) {
      alert("Gelieve de reCAPTCHA te voltooien");
      return;
    }
    // Hier zou je de form data en recaptchaValue naar je backend sturen
    console.log("Form submitted:", { ...formData, recaptchaValue });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">Neem contact met ons op</h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Heb je vragen, suggesties of wil je meer weten over SamenActief? 
            We staan voor je klaar!
          </p>
        </div>
      </div>

      {/* Contact Form Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-white p-8 rounded-2xl shadow-lg">
            <h2 className="text-3xl font-bold mb-6">Stuur ons een bericht</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Naam
                </label>
                <Input 
                  id="name" 
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Jouw naam" 
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  E-mailadres
                </label>
                <Input 
                  id="email" 
                  name="email"
                  type="email" 
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="jouw@email.nl" 
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="subject" className="text-sm font-medium">
                  Onderwerp
                </label>
                <Input 
                  id="subject" 
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="Waar gaat het over?" 
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-medium">
                  Bericht
                </label>
                <Textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Jouw bericht..."
                  className="min-h-[150px]"
                  required
                />
              </div>
              <div className="flex justify-center">
                <ReCAPTCHA
                  sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI" // Vervang dit met je eigen site key
                  onChange={(value) => setRecaptchaValue(value)}
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-gray-900 hover:bg-gray-800"
                disabled={!recaptchaValue}
              >
                Verstuur bericht
              </Button>
            </form>
          </div>

          {/* Contact Information */}
          <div className="space-y-8">
            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <h2 className="text-3xl font-bold mb-6">Contactgegevens</h2>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <Mail className="w-6 h-6 text-gray-900 mt-1" />
                  <div>
                    <h3 className="font-semibold">E-mail</h3>
                    <p className="text-gray-600">info@samenactief.nl</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <Phone className="w-6 h-6 text-gray-900 mt-1" />
                  <div>
                    <h3 className="font-semibold">Telefoon</h3>
                    <p className="text-gray-600">+31 (0)6 12345678</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <MapPin className="w-6 h-6 text-gray-900 mt-1" />
                  <div>
                    <h3 className="font-semibold">Adres</h3>
                    <p className="text-gray-600">
                      Rachelsmolen 1<br />
                      5612 MA Eindhoven
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Opening Hours */}
            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <h2 className="text-3xl font-bold mb-6">Openingstijden</h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Maandag - Vrijdag</span>
                  <span className="font-medium">09:00 - 17:00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Zaterdag</span>
                  <span className="font-medium">10:00 - 16:00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Zondag</span>
                  <span className="font-medium">Gesloten</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 