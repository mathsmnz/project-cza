// src/models/file.model.ts
import { Schema, model, Document } from "mongoose";

// Defines the allowed file types
export enum FileType {
  Image = "image",
  IFC = "ifc",
}

// Interface for the File document
export interface IFile extends Document {
  uniqueId: string;
  fileName: string;
  fileType: FileType;
  project: Schema.Types.ObjectId;
  createdBy: Schema.Types.ObjectId;
  gridfsId: Schema.Types.ObjectId; // The ID of the file in GridFS
  createdAt: Date;
}

const fileSchema = new Schema<IFile>({
  uniqueId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  fileName: {
    type: String,
    required: true,
  },
  fileType: {
    type: String,
    enum: Object.values(FileType),
    required: true,
  },
  project: {
    type: Schema.Types.ObjectId,
    ref: "Project",
    required: true,
    index: true,
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  gridfsId: {
    type: Schema.Types.ObjectId,
    required: true,
    unique: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default model<IFile>("File", fileSchema);
