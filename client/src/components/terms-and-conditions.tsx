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
                    zoals beschreven in deze privacyverklaring. U kunt contact met ons opnemen via:
                    <br />
                    E-mail: privacy@samenactief.nl
                    <br />
                    Telefoon: 020-1234567
                    <br />
                    Adres: Voorbeeldstraat 123, 1234 AB Amsterdam
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
                      <li>Adresgegevens (gemeente en wijk)</li>
                      <li>Activiteitvoorkeuren</li>
                      <li>IP-adres (voor beveiliging)</li>
                      <li>Gebruikersgedrag (voor verbetering van de dienst)</li>
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
                      <li>Het beheren van activiteiten en inschrijvingen</li>
                      <li>Het verstrekken van ondersteuning</li>
                    </ul>
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-2">4. Rechtsgrond</h3>
                  <p>
                    Wij verwerken uw gegevens op basis van:
                    <ul className="list-disc pl-4 mt-2">
                      <li>Uw toestemming</li>
                      <li>De uitvoering van een overeenkomst</li>
                      <li>Wettelijke verplichtingen</li>
                      <li>Gerechtvaardigd belang</li>
                    </ul>
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-2">5. Bewaartermijn</h3>
                  <p>
                    Wij bewaren uw persoonsgegevens niet langer dan noodzakelijk is voor het
                    doel waarvoor ze zijn verzameld:
                    <ul className="list-disc pl-4 mt-2">
                      <li>Accountgegevens: tot 2 jaar na laatste activiteit</li>
                      <li>Activiteitsgegevens: 1 jaar na de activiteit</li>
                      <li>Communicatiegegevens: 1 jaar na laatste contact</li>
                      <li>Analytische gegevens: 26 maanden</li>
                    </ul>
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-2">6. Uw rechten</h3>
                  <p>
                    U heeft de volgende rechten:
                    <ul className="list-disc pl-4 mt-2">
                      <li>Recht op inzage in uw gegevens</li>
                      <li>Recht op correctie van onjuiste gegevens</li>
                      <li>Recht op verwijdering van uw gegevens</li>
                      <li>Recht op beperking van de verwerking</li>
                      <li>Recht op dataportabiliteit</li>
                      <li>Recht om bezwaar te maken tegen verwerking</li>
                      <li>Recht om toestemming in te trekken</li>
                    </ul>
                    U kunt deze rechten uitoefenen door contact met ons op te nemen.
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-2">7. Gegevensdeling</h3>
                  <p>
                    Wij delen uw gegevens alleen met:
                    <ul className="list-disc pl-4 mt-2">
                      <li>Buurthuizen en organisatoren van activiteiten</li>
                      <li>IT-dienstverleners (voor hosting en onderhoud)</li>
                      <li>Analytics-diensten (anoniem)</li>
                    </ul>
                    Alleen indien strikt noodzakelijk en met passende beveiligingsmaatregelen.
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-2">8. Beveiliging</h3>
                  <p>
                    Wij nemen passende technische en organisatorische maatregelen om uw gegevens te beschermen:
                    <ul className="list-disc pl-4 mt-2">
                      <li>Versleuteling van gegevens</li>
                      <li>Toegangsbeperkingen</li>
                      <li>Regelmatige security audits</li>
                      <li>Back-up procedures</li>
                    </ul>
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-2">9. Cookies</h3>
                  <p>
                    Wij gebruiken cookies voor:
                    <ul className="list-disc pl-4 mt-2">
                      <li>Essentiële functionaliteit</li>
                      <li>Analytics (anoniem)</li>
                      <li>Gebruikersvoorkeuren</li>
                    </ul>
                    U kunt uw cookie-instellingen altijd aanpassen.
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-2">10. Klachten</h3>
                  <p>
                    Heeft u een klacht over de verwerking van uw gegevens? Neem dan contact met ons op.
                    U heeft ook het recht om een klacht in te dienen bij de Autoriteit Persoonsgegevens.
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