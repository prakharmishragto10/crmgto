import express from "express";
import cors from "cors";
import helmet from "helmet";
import authRoutes from "./src/modules/auth/auth.routes.js";
const app = express();

// Global Middlewares
app.use(cors());
app.use(helmet());
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.json({
    message: "Crm server is running",
  });
});
//auth routes
app.use("/api/auth", authRoutes);
export default app;
