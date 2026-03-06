import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  findUserByEmail,
  findUserById,
  createUser,
  getAllRoles,
} from "./auth.model.js";
import { sendSuccess, sendError } from "../../utils/response.js";

// LOGIN
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendError(res, "Email and password are required", 400);
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return sendError(res, "Invalid credentials", 401);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return sendError(res, "Invalid credentials", 401);
    }

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role_name,
        branch_id: user.branch_id,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN },
    );

    return sendSuccess(
      res,
      {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role_name,
          branch: user.branch_name,
        },
      },
      "Login successful",
    );
  } catch (error) {
    console.error("Login error:", error);
    return sendError(res, "Login failed", 500);
  }
};

// GET CURRENT USER (me)
export const getMe = async (req, res) => {
  try {
    const user = await findUserById(req.user.id);
    if (!user) {
      return sendError(res, "User not found", 404);
    }

    return sendSuccess(
      res,
      {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role_name,
        branch: user.branch_name,
      },
      "User fetched",
    );
  } catch (error) {
    console.error("GetMe error:", error);
    return sendError(res, "Failed to fetch user", 500);
  }
};

// SEED SUPER ADMIN (one time use)
export const seedSuperAdmin = async (req, res) => {
  try {
    const existing = await findUserByEmail("admin@crmgto.com");
    if (existing) {
      return sendError(res, "Super admin already exists", 400);
    }

    const roles = await getAllRoles();
    const superAdminRole = roles.find((r) => r.name === "super_admin");

    const hashedPassword = await bcrypt.hash("Admin@123", 10);

    const user = await createUser({
      name: "Super Admin",
      email: "admin@crmgto.com",
      password: hashedPassword,
      role_id: superAdminRole.id,
      branch_id: 1,
      created_by: null,
    });

    return sendSuccess(res, user, "Super admin seeded successfully", 201);
  } catch (error) {
    console.error("Seed error:", error);
    return sendError(res, "Seeding failed", 500);
  }
};
