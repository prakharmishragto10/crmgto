import express from "express";
import cors from "cors";
import helmet from "helmet";

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
export default app;
