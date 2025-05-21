import nodemailer from 'nodemailer';

interface EmailParams {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

// Email configuration
const emailConfig = {
  smtp: {
    host: 'smtp.strato.com',
    port: 465,
    secure: true, // use SSL/TLS
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  },
  imap: {
    host: 'imap.strato.com',
    port: 993,
    secure: true // use SSL/TLS
  },
  pop3: {
    host: 'pop3.strato.com',
    port: 995,
    secure: true // use SSL/TLS
  }
};

// Initialize the transporter
const transporter = nodemailer.createTransport(emailConfig.smtp);

let FROM_EMAIL = process.env.EMAIL_USER || '';

export function initializeEmailService(fromEmail?: string) {
  if (fromEmail) {
    FROM_EMAIL = fromEmail;
  }

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.error("Email credentials are missing!");
    return;
  }

  // Verify the connection configuration
  transporter.verify()
    .then(() => {
      console.log("Email service initialized successfully");
    })
    .catch((error) => {
      console.error("Error initializing email service:", error);
    });
}

export async function sendEmail(params: EmailParams): Promise<boolean> {
  try {
    console.log("Attempting to send email to:", params.to);

    const msg = {
      from: {
        name: "Activiteitencentrum",
        address: FROM_EMAIL
      },
      to: params.to,
      subject: params.subject,
      text: params.text || '',
      html: params.html || ''
    };

    const info = await transporter.sendMail(msg);
    console.log("Email sent successfully:", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
}

export async function sendWelcomeEmail(email: string, name: string): Promise<boolean> {
  const subject = "Welkom bij SamenActief!";
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welkom bij SamenActief</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          text-align: center;
          padding: 20px 0;
          background-color: #f8f9fa;
        }
        .logo {
          max-width: 200px;
          height: auto;
        }
        .content {
          padding: 20px;
          background-color: #ffffff;
        }
        .button {
          display: inline-block;
          padding: 12px 24px;
          background-color: #007bff;
          color: #ffffff;
          text-decoration: none;
          border-radius: 5px;
          margin: 20px 0;
        }
        .footer {
          text-align: center;
          padding: 20px;
          font-size: 12px;
          color: #666;
          background-color: #f8f9fa;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="https://www.samenactiefonline.nl/SamenActief.png" alt="SamenActief Logo" class="logo">
        </div>
        <div class="content">
          <h1>Welkom bij SamenActief, ${name}!</h1>
          
          <p>Bedankt voor je registratie bij SamenActief. We zijn blij dat je deel wilt uitmaken van onze gemeenschap!</p>
          
          <p>Met je account kun je:</p>
          <ul>
            <li>Deelnemen aan activiteiten in je buurt</li>
            <li>Je inschrijven voor workshops en evenementen</li>
            <li>In contact komen met andere buurtbewoners</li>
            <li>Je eigen activiteiten organiseren</li>
          </ul>

          <p>Om direct aan de slag te gaan, kun je inloggen op onze website:</p>
          
          <div style="text-align: center;">
            <a href="https://www.samenactiefonline.nl/auth" class="button">Ga naar SamenActief</a>
          </div>

          <p>Heb je vragen of wil je meer informatie? Neem gerust contact met ons op via het contactformulier op onze website.</p>
          
          <p>We kijken ernaar uit om je te ontmoeten bij een van onze activiteiten!</p>
          
          <p>Met vriendelijke groet,<br>
          Het SamenActief Team</p>
        </div>
        <div class="footer">
          <p>Dit is een automatisch gegenereerde e-mail. Je ontvangt deze e-mail omdat je je hebt geregistreerd bij SamenActief.</p>
          <p>&copy; ${new Date().getFullYear()} SamenActief. Alle rechten voorbehouden.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({ to: email, subject, html });
}

export async function sendActivityRegistrationEmail(
  email: string,
  name: string,
  activityName: string,
  activityDate: Date,
  location: string,
): Promise<boolean> {
  const subject = `Registratie bevestiging: ${activityName}`;
  const formattedDate = activityDate.toLocaleDateString('nl-NL', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const html = `
    <h1>Hallo ${name}!</h1>
    <p>Je bent succesvol geregistreerd voor de volgende activiteit:</p>
    <div style="margin: 20px 0; padding: 15px; background-color: #f5f5f5; border-radius: 5px;">
      <h2>${activityName}</h2>
      <p><strong>Datum en tijd:</strong> ${formattedDate}</p>
      <p><strong>Locatie:</strong> ${location}</p>
    </div>
    <p>We kijken ernaar uit je te zien!</p>
  `;

  return sendEmail({ to: email, subject, html });
}

export async function sendPasswordResetEmail(email: string, resetToken: string): Promise<boolean> {
  const subject = "Wachtwoord reset verzoek";
  const resetUrl = `https://www.samenactiefonline.nl/reset-password/${resetToken}`;
  
  const html = `
    <h1>Wachtwoord reset verzoek</h1>
    <p>U heeft een verzoek ingediend om uw wachtwoord te resetten.</p>
    <p>Klik op de onderstaande link om een nieuw wachtwoord in te stellen:</p>
    <p>
      <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">
        Reset mijn wachtwoord
      </a>
    </p>
    <p>Deze link is 1 uur geldig.</p>
    <p>Als u geen wachtwoord reset heeft aangevraagd, kunt u deze e-mail negeren.</p>
  `;

  return sendEmail({ to: email, subject, html });
}

export async function sendWaitlistConfirmationEmail(
  email: string,
  name: string,
  activityName: string,
  activityDate: Date,
  location: string,
): Promise<boolean> {
  const subject = `Goed nieuws! Je kunt deelnemen aan: ${activityName}`;
  const formattedDate = activityDate.toLocaleDateString('nl-NL', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const html = `
    <h1>Gefeliciteerd ${name}!</h1>
    <p>Er is een plek vrijgekomen voor de activiteit waar je op de wachtlijst stond. Je bent nu officieel ingeschreven!</p>
    <div style="margin: 20px 0; padding: 15px; background-color: #f5f5f5; border-radius: 5px;">
      <h2>${activityName}</h2>
      <p><strong>Datum en tijd:</strong> ${formattedDate}</p>
      <p><strong>Locatie:</strong> ${location}</p>
    </div>
    <p>We kijken ernaar uit je te zien bij de activiteit!</p>
    <p>Als je toch niet kunt komen, laat het ons dan zo snel mogelijk weten zodat we iemand anders van de wachtlijst kunnen informeren.</p>
  `;

  return sendEmail({ to: email, subject, html });
}

export async function sendCenterWelcomeEmail(email: string, centerName: string): Promise<boolean> {
  const subject = "Welkom bij SamenActief als Buurthuis!";
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welkom bij SamenActief</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          text-align: center;
          padding: 20px 0;
          background-color: #f8f9fa;
        }
        .logo {
          max-width: 200px;
          height: auto;
        }
        .content {
          padding: 20px;
          background-color: #ffffff;
        }
        .button {
          display: inline-block;
          padding: 12px 24px;
          background-color: #007bff;
          color: #ffffff;
          text-decoration: none;
          border-radius: 5px;
          margin: 20px 0;
        }
        .footer {
          text-align: center;
          padding: 20px;
          font-size: 12px;
          color: #666;
          background-color: #f8f9fa;
        }
        .highlight-box {
          background-color: #f8f9fa;
          border-left: 4px solid #007bff;
          padding: 15px;
          margin: 20px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="https://www.samenactiefonline.nl/SamenActief.png" alt="SamenActief Logo" class="logo">
        </div>
        <div class="content">
          <h1>Welkom bij SamenActief, ${centerName}!</h1>
          
          <p>Gefeliciteerd! Uw buurthuis is nu officieel geregistreerd bij SamenActief. We zijn verheugd om u te verwelkomen in ons netwerk van actieve buurthuizen.</p>
          
          <div class="highlight-box">
            <h2>Wat kunt u nu doen?</h2>
            <ul>
              <li>Activiteiten aanmaken en beheren</li>
              <li>Deelnemers registreren en beheren</li>
              <li>Wachtlijsten bijhouden</li>
              <li>Communiceren met deelnemers</li>
              <li>Statistieken bekijken</li>
            </ul>
          </div>

          <h2>Eerste stappen</h2>
          <p>Om direct aan de slag te gaan:</p>
          <ol>
            <li>Log in op uw beheerdersaccount</li>
            <li>Vul de profielgegevens van uw buurthuis aan</li>
            <li>Maak uw eerste activiteit aan</li>
            <li>Nodig buurtbewoners uit om deel te nemen</li>
          </ol>

          <div style="text-align: center;">
            <a href="https://www.samenactiefonline.nl/center-admin" class="button">Ga naar uw Dashboard</a>
          </div>

          <h2>Ondersteuning</h2>
          <p>Wij staan voor u klaar met:</p>
          <ul>
            <li>Technische ondersteuning bij het gebruik van het platform</li>
            <li>Tips voor het organiseren van succesvolle activiteiten</li>
            <li>Hulp bij het bereiken van uw doelgroep</li>
          </ul>

          <p>Heeft u vragen of wilt u meer informatie? Neem gerust contact met ons op via het contactformulier op onze website.</p>
          
          <p>We wensen u veel succes met het organiseren van activiteiten in uw buurt!</p>
          
          <p>Met vriendelijke groet,<br>
          Het SamenActief Team</p>
        </div>
        <div class="footer">
          <p>Dit is een automatisch gegenereerde e-mail. U ontvangt deze e-mail omdat uw buurthuis zich heeft geregistreerd bij SamenActief.</p>
          <p>&copy; ${new Date().getFullYear()} SamenActief. Alle rechten voorbehouden.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({ to: email, subject, html });
}