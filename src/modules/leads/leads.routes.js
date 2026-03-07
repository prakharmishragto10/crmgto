import express from "express";
import {
  addLead,
  getLeads,
  getLead,
  changeLeadStatus,
  reassignLead,
  overdueLeads,
  addNotes,
} from "./leads.controller.js";
import { protect, restrictTo } from "../../middleware/auth.js";

const router = express.Router();

// ALL ROUTES PROTECTED
router.use(protect);

// LEADS CRUD
router.post("/", addLead);
router.get("/", getLeads);
router.get("/overdue", restrictTo("super_admin"), overdueLeads);
router.get("/:id", getLead);

// LEAD ACTIONS
router.patch("/:id/status", changeLeadStatus);
router.patch("/:id/assign", restrictTo("super_admin"), reassignLead);
router.patch("/:id/notes", addNotes);

export default router;
