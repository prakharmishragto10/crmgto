import bcrypt from "bcryptjs";
import {
  createStaffUser,
  getAllStaff,
  updatePassword,
  toggleUserStatus,
  getAllRoles,
} from "../auth/auth.model.js";
import {
  markAttendance,
  getAttendanceByMonth,
  getMonthlySummary,
  getAllStaffAttendanceByDate,
} from "./staff.model.js";
import { sendSuccess, sendError } from "../../utils/response.js";

// CREATE STAFF — super_admin only
export const createStaff = async (req, res) => {
  try {
    const { name, email, phone, role_id, branch_id } = req.body;

    if (!name || !email || !role_id || !branch_id) {
      return sendError(res, "Name, email, role and branch are required", 400);
    }

    const tempPassword = "Welcome@123";
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    const user = await createStaffUser({
      name,
      email,
      phone,
      password: hashedPassword,
      role_id,
      branch_id,
      created_by: req.user.id,
    });

    return sendSuccess(
      res,
      { ...user, temp_password: tempPassword },
      "Staff created successfully",
      201,
    );
  } catch (error) {
    console.error("Create staff error:", error);
    if (error.code === "23505") {
      return sendError(res, "Email already exists", 400);
    }
    return sendError(res, "Failed to create staff", 500);
  }
};

// GET ALL STAFF — super_admin only
export const getStaff = async (req, res) => {
  try {
    const staff = await getAllStaff();
    return sendSuccess(res, staff, "Staff fetched successfully");
  } catch (error) {
    console.error("Get staff error:", error);
    return sendError(res, "Failed to fetch staff", 500);
  }
};

// TOGGLE STAFF STATUS — super_admin only
export const toggleStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await toggleUserStatus(id);
    if (!user) {
      return sendError(res, "User not found", 404);
    }
    return sendSuccess(
      res,
      user,
      `User ${user.is_active ? "activated" : "deactivated"}`,
    );
  } catch (error) {
    console.error("Toggle status error:", error);
    return sendError(res, "Failed to toggle status", 500);
  }
};

// CHANGE PASSWORD — logged in user can change passs
export const changePassword = async (req, res) => {
  try {
    const { old_password, new_password } = req.body;

    if (!old_password || !new_password) {
      return sendError(res, "Old and new password are required", 400);
    }

    if (new_password.length < 6) {
      return sendError(res, "Password must be at least 6 characters", 400);
    }

    const isMatch = await bcrypt.compare(old_password, req.user.password);
    if (!isMatch) {
      return sendError(res, "Old password is incorrect", 401);
    }

    const hashedPassword = await bcrypt.hash(new_password, 10);
    const updated = await updatePassword(req.user.id, hashedPassword);

    return sendSuccess(res, updated, "Password changed successfully");
  } catch (error) {
    console.error("Change password error:", error);
    return sendError(res, "Failed to change password", 500);
  }
};

// GET ALL ROLES — for dropdown
export const getRoles = async (req, res) => {
  try {
    const roles = await getAllRoles();
    return sendSuccess(res, roles, "Roles fetched");
  } catch (error) {
    return sendError(res, "Failed to fetch roles", 500);
  }
};

// MARK ATTENDANCE  self ya admin dono mark kar sakte hain
export const markStaffAttendance = async (req, res) => {
  try {
    const { date, status, user_id } = req.body;

    if (!date || !status) {
      return sendError(res, "Date and status are required", 400);
    }

    if (!["present", "absent"].includes(status)) {
      return sendError(res, "Status must be present or absent", 400);
    }

    // Admin kisi ke liye bhi mark kar sakta hai
    // Employee sirf apni khud mark kar sakta hai
    let targetUserId;

    if (req.user.role_name === "super_admin" && user_id) {
      targetUserId = user_id;
    } else {
      targetUserId = req.user.id;
    }

    const attendance = await markAttendance({
      user_id: targetUserId,
      date,
      status,
      marked_by: req.user.id,
    });

    return sendSuccess(res, attendance, "Attendance marked successfully");
  } catch (error) {
    console.error("Mark attendance error:", error);
    return sendError(res, "Failed to mark attendance", 500);
  }
};
// GET ATTENDANCE BY MONTH
export const getMonthlyAttendance = async (req, res) => {
  try {
    const { user_id } = req.params;
    const { month, year } = req.query;

    if (!month || !year) {
      return sendError(res, "Month and year are required", 400);
    }

    const [records, summary] = await Promise.all([
      getAttendanceByMonth(user_id, month, year),
      getMonthlySummary(user_id, month, year),
    ]);

    return sendSuccess(res, { records, summary }, "Attendance fetched");
  } catch (error) {
    console.error("Get attendance error:", error);
    return sendError(res, "Failed to fetch attendance", 500);
  }
};

// GET ALL STAFF ATTENDANCE BY DATE
export const getDailyAttendance = async (req, res) => {
  try {
    const { date } = req.params;
    const records = await getAllStaffAttendanceByDate(date);
    return sendSuccess(res, records, "Daily attendance fetched");
  } catch (error) {
    console.error("Daily attendance error:", error);
    return sendError(res, "Failed to fetch daily attendance", 500);
  }
};
