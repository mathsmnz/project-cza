// src/routes/file.routes.ts
import { Router } from "express";
import multer from "multer";
import { uploadFile, getFileById } from "../controllers/file.controller";
import { protect, restrictTo } from "../middleware/auth.middleware";
import { UserType } from "../models/user.model";

const router = Router();

// Configure multer to store files in memory as buffers
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Route to handle file upload. The field name in the form-data should be 'file'.
router.post("/upload", protect(), restrictTo(UserType.Admin, UserType.Editor), upload.single("file"), uploadFile);

// Route to get a file by its GridFS ID
router.get("/:id", getFileById);

export default router;
