import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import adminUsersRouter from "./routes/admin/users";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Admin routes
app.use("/api/admin/users", adminUsersRouter);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server draait op poort ${PORT}`);
}); 