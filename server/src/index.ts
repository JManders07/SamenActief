import express from "express";
import cors from "cors";
import { config } from "dotenv";
import authRoutes from "./routes/auth.js";
import adminRoutes from "./routes/admin.js";

config();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api", authRoutes);
app.use("/api/admin", adminRoutes);

const port = process.env.PORT || 3001;

app.listen(port, () => {
  console.log(`Server draait op poort ${port}`);
}); 