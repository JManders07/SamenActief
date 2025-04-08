import express, { Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupAuth } from "./auth";
import { setupVite, serveStatic, log } from "./vite";
import { initializeEmailService } from "./email";
import path from "path";

const app = express();
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