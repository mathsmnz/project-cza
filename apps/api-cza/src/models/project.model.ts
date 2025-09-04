// src/models/project.model.ts
import { Schema, model, Document, Types } from "mongoose";

// --- Subdocument Interface & Schema ---
export interface ICustomizationSelection extends Types.Subdocument {
  id: string;
  label: string;
  description: string;
  relatedCombos: string[];
  relatedGroups: string[];
}

const customizationSelectionSchema = new Schema<ICustomizationSelection>(
  {
    id: { type: String, required: true },
    label: { type: String, required: true },
    description: { type: String, required: true },
    relatedCombos: [{ type: String }],
    relatedGroups: [{ type: String }],
  },
  { _id: false }
);

// --- Main Project Interface & Schema ---
export interface IProject extends Document {
  name: string;
  id: string; // Custom unique ID
  users: Schema.Types.ObjectId[];
  images: Schema.Types.ObjectId[];
  ifcs: Schema.Types.ObjectId[];
  customizations: ICustomizationSelection[];
  createdAt: Date;
}

const projectSchema = new Schema<IProject>({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  id: {
    type: String,
    required: true,
    unique: true,
  },
  users: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  images: [
    {
      type: Schema.Types.ObjectId,
      ref: "File",
    },
  ],
  ifcs: [
    {
      type: Schema.Types.ObjectId,
      ref: "File",
    },
  ],
  // --- Array of Customization Selections ---
  customizations: [customizationSelectionSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default model<IProject>("Project", projectSchema);
