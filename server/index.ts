import express, { Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupAuth } from "./auth";
import { setupVite, serveStatic, log } from "./vite";
import { initializeEmailService } from "./email";
import path from "path";
import rateLimit from "express-rate-limit";
import dataBreachRouter from "./routes/data-breach";
import dataRetentionRouter from "./routes/data-retention";
import adminRouter from "./routes/admin";

const app = express();

// Rate limiting configuratie
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minuten
  max: 100, // maximaal 100 requests per IP per windowMs
  message: { message: "Te veel requests van dit IP, probeer het later opnieuw" },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
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

// Voeg de nieuwe routes toe
app.use("/api/data-breach", dataBreachRouter);
app.use("/api/data-retention", dataRetentionRouter);

// Admin routes
app.use("/api/admin", adminRouter);
log("Admin routes registered");

// Start server
(async () => {
  try {
    log("Starting server setup...");
    setupAuth(app);
    log("Authentication setup complete");

    const server = await registerRoutes(app);
    log("Routes registered successfully");

    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      console.error("Server error:", err);
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      res.status(status).json({ message });
    });

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