// src/middleware/auth.middleware.ts
import { Request, Response, NextFunction } from "express";
import User, { IUser, UserType } from "../models/user.model.js";
import jwt from "jsonwebtoken";

interface DecodedToken {
  id: string;
  role?: UserType;
  iat: number;
  exp: number;
}

/**
 * Middleware to protect routes:
 * - Always requires a valid JWT
 * - Optionally requires API key verification for sensitive routes
 *
 * @param requireApiKey Whether to check x-api-key header (default: false)
 */
export const protect = (requireApiKey = false) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // --- 1. Extract JWT ---
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res
          .status(401)
          .json({ message: "Unauthorized: No token provided." });
      }

      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(
        token,
        process.env.JWT_ACCESS_SECRET!
      ) as DecodedToken;

      // --- 2. Load user from DB ---
      const user = await User.findById(decoded.id).select("+apiKey");
      if (!user) {
        return res
          .status(401)
          .json({ message: "Unauthorized: User not found." });
      }

      req.user = user as IUser;

      // --- 3. Optional API key check ---
      if (requireApiKey) {
        const apiKey = req.headers["x-api-key"];
        if (!apiKey || typeof apiKey !== "string") {
          return res
            .status(401)
            .json({ message: "Unauthorized: API key is required." });
        }
        if (user.apiKey !== apiKey) {
          return res
            .status(403)
            .json({ message: "Forbidden: Invalid API key." });
        }
      }

      next();
    } catch (err) {
      return res
        .status(401)
        .json({ message: "Unauthorized: Invalid or expired token." });
    }
  };
};

// --- Role-based authorization ---
export const restrictTo = (...roles: UserType[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Forbidden: You do not have permission for this action.",
      });
    }
    next();
  };
};
