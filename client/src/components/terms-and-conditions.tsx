import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface TermsAndConditionsProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

export function TermsAndConditions({ checked, onCheckedChange }: TermsAndConditionsProps) {
  return (
    <div className="flex items-start space-x-2">
      <Checkbox
        id="terms"
        checked={checked}
        onCheckedChange={(checked) => onCheckedChange(checked as boolean)}
      />
      <div className="grid gap-1.5 leading-none">
        <label
          htmlFor="terms"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Ik ga akkoord met de{" "}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="link" className="p-0 h-auto">
                voorwaarden
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Algemene Voorwaarden</DialogTitle>
                <DialogDescription>
                  Laatst bijgewerkt: {new Date().toLocaleDateString("nl-NL")}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <section>
                  <h3 className="text-lg font-semibold mb-2">1. Algemene bepalingen</h3>
                  <p>
                    Deze algemene voorwaarden zijn van toepassing op alle diensten die worden aangeboden door SamenActief.
                    Door gebruik te maken van onze diensten gaat u akkoord met deze voorwaarden.
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-2">2. Account en registratie</h3>
                  <p>
                    Om gebruik te kunnen maken van onze diensten moet u een account aanmaken.
                    U bent verantwoordelijk voor het geheim houden van uw inloggegevens.
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-2">3. Privacy</h3>
                  <p>
                    Wij gaan zorgvuldig om met uw persoonsgegevens. Deze worden alleen gebruikt
                    voor het doel waarvoor ze zijn verzameld en worden niet zonder uw toestemming
                    gedeeld met derden.
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-2">4. Aansprakelijkheid</h3>
                  <p>
                    SamenActief is niet aansprakelijk voor schade die voortvloeit uit het gebruik
                    van onze diensten, tenzij deze schade het gevolg is van opzet of grove
                    nalatigheid van onze kant.
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-2">5. Wijzigingen</h3>
                  <p>
                    Wij behouden ons het recht voor om deze voorwaarden te wijzigen.
                    Belangrijke wijzigingen zullen worden gecommuniceerd via e-mail of via een
                    bericht op onze website.
                  </p>
                </section>
              </div>
            </DialogContent>
          </Dialog>{" "}
          en{" "}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="link" className="p-0 h-auto">
                privacyverklaring
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Privacyverklaring</DialogTitle>
                <DialogDescription>
                  Laatst bijgewerkt: {new Date().toLocaleDateString("nl-NL")}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <section>
                  <h3 className="text-lg font-semibold mb-2">1. Verantwoordelijke</h3>
                  <p>
                    SamenActief is verantwoordelijk voor de verwerking van uw persoonsgegevens
                    zoals beschreven in deze privacyverklaring.
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-2">2. Verwerkte gegevens</h3>
                  <p>
                    Wij verwerken de volgende persoonsgegevens:
                    <ul className="list-disc pl-4 mt-2">
                      <li>Naam en contactgegevens</li>
                      <li>E-mailadres</li>
                      <li>Telefoonnummer</li>
                      <li>Adresgegevens</li>
                      <li>Activiteitvoorkeuren</li>
                    </ul>
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-2">3. Doel van de verwerking</h3>
                  <p>
                    Uw gegevens worden verwerkt voor de volgende doeleinden:
                    <ul className="list-disc pl-4 mt-2">
                      <li>Het aanbieden van onze diensten</li>
                      <li>Het versturen van nieuwsbrieven en updates</li>
                      <li>Het verbeteren van onze diensten</li>
                      <li>Het voldoen aan wettelijke verplichtingen</li>
                    </ul>
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-2">4. Bewaartermijn</h3>
                  <p>
                    Wij bewaren uw persoonsgegevens niet langer dan noodzakelijk is voor het
                    doel waarvoor ze zijn verzameld, tenzij er een wettelijke verplichting
                    bestaat om de gegevens langer te bewaren.
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-2">5. Uw rechten</h3>
                  <p>
                    U heeft het recht om:
                    <ul className="list-disc pl-4 mt-2">
                      <li>Inzage te krijgen in uw persoonsgegevens</li>
                      <li>Uw persoonsgegevens te laten corrigeren</li>
                      <li>Uw persoonsgegevens te laten verwijderen</li>
                      <li>Bezwaar te maken tegen de verwerking</li>
                      <li>Gegevensoverdracht te verzoeken</li>
                    </ul>
                  </p>
                </section>
              </div>
            </DialogContent>
          </Dialog>
        </label>
      </div>
    </div>
  );
} 