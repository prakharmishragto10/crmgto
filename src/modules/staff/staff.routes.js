import express from "express";
import {
  createStaff,
  getStaff,
  toggleStatus,
  changePassword,
  getRoles,
  markStaffAttendance,
  getMonthlyAttendance,
  getDailyAttendance,
} from "./staff.controller.js";
import { protect, restrictTo } from "../../middleware/auth.js";

const router = express.Router();

// ALL ROUTES PROTECTED
router.use(protect);

// STAFF MANAGEMENT — super_admin only
router.post("/", restrictTo("super_admin"), createStaff);
router.get("/", restrictTo("super_admin"), getStaff);
router.patch("/:id/toggle-status", restrictTo("super_admin"), toggleStatus);

// ROLES DROPDOWN
router.get("/roles", getRoles);

// PASSWORD CHANGE — apna khud
router.patch("/change-password", changePassword);

// ATTENDANCE
router.post("/attendance", markStaffAttendance);
router.get(
  "/attendance/daily/:date",
  restrictTo("super_admin"),
  getDailyAttendance,
);
router.get(
  "/attendance/:user_id/monthly",
  restrictTo("super_admin"),
  getMonthlyAttendance,
);

export default router;
