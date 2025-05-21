import express, { Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupAuth } from "./auth";
import { setupVite, serveStatic, log } from "./vite";
import { initializeEmailService } from "./email";
import path from "path";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import cors from "cors";
import dotenv from "dotenv";

// Laad environment variables
dotenv.config();

const app = express();

// Helmet security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  hsts: {
    maxAge: Number(process.env.HSTS_MAX_AGE) || 31536000,
    includeSubDomains: true,
    preload: true
  },
  crossOriginEmbedderPolicy: true,
  crossOriginOpenerPolicy: true,
  crossOriginResourcePolicy: { policy: "same-site" },
  dnsPrefetchControl: { allow: false },
  frameguard: { action: "deny" },
  hidePoweredBy: true,
  ieNoOpen: true,
  noSniff: true,
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  xssFilter: true
}));

// CORS configuratie
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "http://localhost:3000").split(",");
app.use(cors({
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Niet toegestaan door CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// Rate limiting configuratie
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minuten
  max: 100, // maximaal 100 requests per IP per windowMs
  message: { message: "Te veel requests van dit IP, probeer het later opnieuw" },
  standardHeaders: true,
  legacyHeaders: false,
});

// Pas rate limiting toe op alle routes
app.use(limiter);

// Striktere limiet voor login en registratie endpoints
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 uur
  max: 5, // maximaal 5 pogingen per uur
  message: { message: "Te veel inlogpogingen, probeer het later opnieuw" },
  standardHeaders: true,
  legacyHeaders: false,
});

// Pas de striktere limiet toe op auth endpoints
app.use("/api/login", authLimiter);
app.use("/api/register", authLimiter);
app.use("/api/reset-password", authLimiter);

// Verbeterde error handling middleware
const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("Server error:", err);
  
  // Log security-gerelateerde events
  if (err.status === 401 || err.status === 403) {
    log(`Security event: ${err.message} from IP ${req.ip}`);
  }

  // Verberg gevoelige error details in productie
  const isProduction = process.env.NODE_ENV === "production";
  const status = err.status || err.statusCode || 500;
  const message = isProduction 
    ? "Er is een fout opgetreden" 
    : err.message || "Internal Server Error";

  res.status(status).json({ message });
};

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Health check
app.get("/health", (req, res) => {
  res.send("ok");
});

// Email service
if (!process.env.SENDGRID_API_KEY) {
  console.warn("Warning: SENDGRID_API_KEY not set. Email notifications will be disabled.");
} else {
  initializeEmailService(process.env.SENDGRID_API_KEY, "w.kastelijn@student.fontys.nl");
  log("Email service initialized");
}

// Logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }
      log(logLine);
    }
  });

  next();
});

// Global error handling
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
});
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

// Start server
(async () => {
  try {
    log("Starting server setup...");
    setupAuth(app);
    log("Authentication setup complete");

    const server = await registerRoutes(app);
    log("Routes registered successfully");

    app.use(errorHandler);

    if (process.env.NODE_ENV === "development") {
      await setupVite(app, server);
      log("Vite setup complete");
    } else {
      serveStatic(app); // 👈 zorgt voor client side routing (SPA)
      log("Static serving setup complete");
    }

    const port = process.env.PORT || 5000;
    server.listen(Number(port), () => {
      log(`Server started on port ${port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
})();