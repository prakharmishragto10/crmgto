import jwt from "jsonwebtoken";
import { findUserById } from "../modules/auth/auth.model";
import { sendError } from "../utils/response";

//verify token
export const protect = async (req, res, next) => {
  try {
    const header = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return sendError(res, "No token provided", 401);
    }

    const token = authHeader.split("")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await findUserById(decoded.id);
    if (!user) {
      return sendError(res, "User no longer exists", 401);
    }
    req.user = user;
    next();
  } catch (error) {
    return sendError(res, "Invalid or expired token", 401);
  }
};

//RBAC settings here

export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role_name)) {
      return sendError(res, "You do not have permission", 403);
    }
    next();
  };
};
