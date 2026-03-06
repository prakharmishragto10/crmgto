import express from "express";
import { login, getMe, seedSuperAdmin } from "./auth.controller.js";
import { protect, restrictTo } from "../../middleware/auth.js";

const router = express.Router();

// PUBLIC ROUTES
router.post("/login", login);

// ONE TIME SEED ROUTE — super admin banane ke liye
router.post("/seed-admin", seedSuperAdmin);

// PROTECTED ROUTES
router.get("/me", protect, getMe);

export default router;
