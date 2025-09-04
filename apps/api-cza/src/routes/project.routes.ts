// src/routes/project.routes.ts
import { Router } from "express";
import {
  createProject,
  getAllProjects,
  getProjectById,
  updateProject,
  deleteProject,
  seedProjects,
  assignUserToProject,
} from "../controllers/project.controller.js";
import { protect, restrictTo } from "../middleware/auth.middleware.js";
import { UserType } from "../models/user.model.js";

const router = Router();

/**
 * @route   GET /api/projects
 * @desc    Get a list of all projects.
 * @access  Private (Requires authentication)
 * ---
 * @route   POST /api/projects
 * @desc    Create a new project.
 * @access  Private (Admin or Editor)
 */
router.route("/")
  .get(protect(), getAllProjects)
  .post(protect(), restrictTo(UserType.Admin, UserType.Editor), createProject);

/**
 * @route   GET /api/projects/:id
 * @desc    Get a single project by its ID.
 * @access  Private (Requires authentication)
 * ---
 * @route   PATCH /api/projects/:id
 * @desc    Update a project by its ID.
 * @access  Private (Admin or Editor)
 * ---
 * @route   DELETE /api/projects/:id
 * @desc    Delete a project by its ID.
 * @access  Private (Admin only)
 */
router.route("/:id")
  .get(protect(), getProjectById)
  .patch(protect(), restrictTo(UserType.Admin, UserType.Editor), updateProject)
  .delete(protect(), restrictTo(UserType.Admin), deleteProject);

/**
 * @route   POST /api/projects/seed
 * @desc    Seed the database with template projects.
 * @access  Public (Typically for development purposes)
 */
router.post("/seed", seedProjects);

/**
 * @route   POST /api/projects/:projectId/users
 * @desc    Assigns a user to a project. Expects { "userId": "..." } in the body.
 * @access  Private (Admin or Editor)
 */
router.post(
  "/:projectId/users",
  protect(), // Garante que o usuário esteja logado
  restrictTo(UserType.Admin, UserType.Editor), // Garante que seja Admin ou Editor
  assignUserToProject // Chama a função do controller
);

export default router;