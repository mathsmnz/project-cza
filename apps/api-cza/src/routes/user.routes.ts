// src/routes/user.routes.ts
import { Router } from "express";
import { protect, restrictTo } from "../middleware/auth.middleware.js";
import { UserType } from "../models/user.model.js";
import {
  registerUser,
  getAllUsers,
  seedUsers,
  loginUser,
  adminResetPassword,
  refreshToken,
  registerUserByAdmin,
} from "../controllers/user.controller.js";

const router = Router();

/**
 * @route   GET /api/users/profile
 * @desc    Fetches the profile of the currently authenticated user
 * @access  Private (Requires a valid access token)
 */
router.get("/profile", protect(), (req, res) => {
  res.json({ user: req.user });
});

/**
 * @route   GET /api/users
 * @desc    Retrieves a list of all users
 * @access  Private (Admin only)
 */
router.get("/", protect(), restrictTo(UserType.Admin), getAllUsers);

/**
 * @route   POST /api/users/register
 * @desc    Registers a new user with the default role of 'finalUser'
 * @access  Public
 */
router.post("/register", registerUser);

/**
 * @route   POST /api/users/registerWithRole
 * @desc    Registers a new user with the role set by admin
 * @access  Private (Admin only)
 */
router.post(
  "/registerWithRole",
  protect(), // <-- This middleware is required for authentication
  restrictTo(UserType.Admin), // <-- This middleware is required for authorization
  registerUserByAdmin
);

/**
 * @route   POST /api/users/seed
 * @desc    Seeds the database with template users (admin, editor, finalUser).
 * Deletes existing template users before creating new ones to prevent duplicates.
 * @access  Public (Typically for development/setup purposes)
 */
router.post("/seed", seedUsers);

/**
 * @route   POST /api/users/refresh-token
 * @desc    Issues a new access token using a valid refresh token sent via an httpOnly cookie.
 * This allows the session to be extended without the user logging in again.
 * @access  Public (Requires a valid 'refreshToken' cookie)
 */
router.post("/refresh-token", refreshToken);

/**
 * @route   POST /api/users/login
 * @desc    Authenticates a user with email and password.
 * On success, it returns an access token and sets a refresh token in an httpOnly cookie.
 * @access  Public
 */
router.post("/login", loginUser);

/**
 * @route   PATCH /api/users/:id/reset-password
 * @desc    Allows an admin to reset the password for a specific user.
 * The new password is provided in the request body.
 * @access  Private (Admin only)
 * @param   {string} id - The MongoDB ObjectId of the user to update.
 */
router.patch(
  "/:id/reset-password",
  protect(), // First, authenticate the request
  restrictTo(UserType.Admin), // Then, authorize the user
  adminResetPassword
);

export default router;
