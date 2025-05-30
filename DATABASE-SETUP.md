# Database setup instructies

## Overzicht
Dit document bevat instructies voor het opzetten van een nieuwe PostgreSQL-database voor de Ouderenapp. De SQL in dit document maakt alle benodigde tabellen en voegt wat voorbeeldgegevens toe, zodat je direct met de app kunt werken.

## Stap 1: Database aanmaken

Kies een van de volgende opties:

### Optie 1: Neon (Gratis cloud PostgreSQL)
1. Ga naar [neon.tech](https://neon.tech) en maak een gratis account aan
2. Maak een nieuw project
3. Kopieer de connection string (begint met `postgres://...`)
4. Sla deze op in een `.env` bestand in de hoofdmap van het project als:
   ```
   DATABASE_URL=<jouw_neon_connection_string>
   ```

### Optie 2: Supabase (Gratis cloud PostgreSQL)
1. Ga naar [supabase.com](https://supabase.com) en maak een gratis account aan
2. Maak een nieuw project
3. Ga naar Project Settings > Database > Connection String > URI
4. Kopieer de connection string en vul je wachtwoord in
5. Sla deze op in een `.env` bestand in de hoofdmap van het project als:
   ```
   DATABASE_URL=<jouw_supabase_connection_string>
   ```

### Optie 3: Lokale PostgreSQL
1. Download en installeer [PostgreSQL](https://www.postgresql.org/download/)
2. Maak een nieuwe database aan:
   ```
   createdb ouderenapp
   ```
3. Sla de connection string op in een `.env` bestand in de hoofdmap:
   ```
   DATABASE_URL=postgresql://gebruikersnaam:wachtwoord@localhost:5432/ouderenapp
   ```

## Stap 2: SQL-script uitvoeren

### Via een database-tool (pgAdmin, DBeaver, etc.):
1. Open je favoriete PostgreSQL-tool
2. Maak verbinding met je database
3. Open het `setup-database.sql` bestand
4. Voer het SQL-script uit tegen je database

### Via command line:
1. Zorg ervoor dat je PostgreSQL-client tools (psql) hebt geïnstalleerd
2. Voer het volgende commando uit:

```bash
# Voor een lokale database:
psql -d ouderenapp -f setup-database.sql

# Voor een cloud-database:
psql "jouw_connection_string" -f setup-database.sql
```

## Stap 3: App configureren
Zorg ervoor dat je `.env` bestand de correcte `DATABASE_URL` bevat:

```
DATABASE_URL=postgresql://gebruikersnaam:wachtwoord@host:port/database
```

## Stap 4: App starten
Nu kan je de app starten met:

```bash
npm run dev
```

## Inloggegevens voor demo
De volgende voorbeeldgebruikers zijn toegevoegd:

| Gebruikersnaam       | Wachtwoord | Rol               |
|----------------------|------------|-------------------|
| admin@example.com    | password   | Centrumbeheerder  |
| jan@example.com      | password   | Gebruiker         |
| maria@example.com    | password   | Gebruiker         |
| piet@example.com     | password   | Gebruiker         |
| truus@example.com    | password   | Gebruiker         |

> **Let op:** In een productieomgeving moet je wachtwoorden hashen. De huidige setup is alleen voor ontwikkelingsdoeleinden.

## Databaseschema

De volgende tabellen worden aangemaakt:

- `users` - Gebruikersaccounts
- `centers` - Activiteitencentra/buurthuizen
- `activities` - Activiteiten die plaatsvinden in centra
- `activity_images` - Extra afbeeldingen voor activiteiten
- `registrations` - Inschrijvingen voor activiteiten
- `waitlist` - Wachtlijst voor volle activiteiten
- `reminders` - Herinneringen voor activiteiten
- `carpools` - Carpoolaanbod voor activiteiten
- `carpool_passengers` - Passagiers voor carpool

## Aanpassen van de database

Als je wijzigingen wilt maken aan het schema, kun je het SQL-script aanpassen en opnieuw uitvoeren, of je kunt gebruik maken van het migratiemechanisme van Drizzle ORM:

```bash
npm run db:push
```
