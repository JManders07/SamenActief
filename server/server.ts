import express from "express";
import { registerRoutes } from "./routes";
import { startCronJobs } from "./cron";

const app = express();
const port = process.env.PORT || 3000;

const server = await registerRoutes(app);
startCronJobs(); // Start de cron jobs

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 