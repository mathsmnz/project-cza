// src/controllers/file.controller.ts
import { Request, Response } from "express";
import File, { FileType } from "../models/file.model.js";
import mongoose from "mongoose";
import { Readable } from "stream";
import { gfs } from "../config/gridfs.config.js";

export const uploadFile = async (req: Request, res: Response) => {
  if (!gfs) {
    return res.status(500).json({ message: "GridFS is not initialized." });
  }

  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded." });
  }

  const file = req.file;

  try {
    const { uniqueId, projectId, createdBy, fileType } = req.body;

    const readableStream = Readable.from(req.file.buffer);
    const uploadStream = gfs.openUploadStream(req.file.originalname);

    readableStream.pipe(uploadStream);

    uploadStream.on("error", (error) => {
      res
        .status(500)
        .json({ message: `Error uploading file: ${error.message}` });
    });

    uploadStream.on("finish", async () => {
      const gridfsId = uploadStream.id;

      const newFile = new File({
        gridfsId: gridfsId,
        uniqueId: uniqueId,
        fileName: file.originalname,
        fileType: fileType as FileType,
        project: projectId,
        createdBy: createdBy,
      });

      await newFile.save();

      res.status(201).json({
        message: "File uploaded successfully.",
        file: newFile,
      });
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    }
  }
};

export const getFileById = async (req: Request, res: Response) => {
  if (!gfs) {
    return res.status(500).json({ message: "GridFS is not initialized." });
  }

  try {
    const fileId = new mongoose.Types.ObjectId(req.params.id);
    const downloadStream = gfs.openDownloadStream(fileId);

    downloadStream.on("error", (err) => {
      return res.status(400).json({ message: "File not found or invalid ID." });
    });

    downloadStream.pipe(res);
  } catch (error) {
    res.status(400).json({ message: "Invalid file ID format." });
  }
};
