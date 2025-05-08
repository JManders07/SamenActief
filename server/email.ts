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
  const subject = "Welkom bij het Activiteitencentrum!";
  const html = `
    <h1>Welkom ${name}!</h1>
    <p>Bedankt voor het registreren bij het Activiteitencentrum.</p>
    <p>Je kunt nu inloggen en deelnemen aan activiteiten.</p>
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
  const subject = "Wachtwoord reset voor Activiteitencentrum";
  const resetUrl = `https://www.samenactiefonline.nl/reset-password?token=${resetToken}`;
  
  const html = `
    <h1>Wachtwoord reset</h1>
    <p>U heeft een wachtwoord reset aangevraagd voor uw account bij SamenActief.</p>
    <p>Klik op de onderstaande link om uw wachtwoord te resetten:</p>
    <p><a href="${resetUrl}">${resetUrl}</a></p>
    <p>Deze link is 1 uur geldig.</p>
    <p>Als u geen wachtwoord reset heeft aangevraagd, kunt u deze email negeren.</p>
  `;

  return sendEmail({ to: email, subject, html });
}