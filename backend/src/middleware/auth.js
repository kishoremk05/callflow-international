import { supabase } from "../config/supabase.js";
import { AppError } from "./errorHandler.js";

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AppError("No token provided", 401);
    }

    const token = authHeader.substring(7);

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      throw new AppError("Invalid or expired token", 401);
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

export const requireRole = (roles) => {
  return async (req, res, next) => {
    try {
      const { data: userRole, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", req.user.id)
        .single();

      if (error || !userRole) {
        throw new AppError("User role not found", 403);
      }

      if (!roles.includes(userRole.role)) {
        throw new AppError("Insufficient permissions", 403);
      }

      req.userRole = userRole.role;
      next();
    } catch (error) {
      next(error);
    }
  };
};
