// src/models/user.model.ts
import { Schema, model, Document } from "mongoose";
import bcrypt from "bcrypt";
import crypto from "crypto";

export enum UserType {
  Admin = "admin",
  Editor = "editor",
  Finaluser = "finalUser",
}

// Interface for the User document
export interface IUser extends Document {
  username: string;
  email: string;
  password?: string; // Password is optional when fetching user data
  role: UserType;
  apiKey?: string;
  projects: Schema.Types.ObjectId[]; // Array of references to Project documents
  createdAt: Date;
  // Method to compare login password with the stored hash
  comparePassword(candidatePassword: string): Promise<boolean>;
  [key: string]: any;
}

const userSchema = new Schema<IUser>({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    select: false, // Prevents the password from being returned in queries by default
  },
  role: {
    type: String,
    enum: Object.values(UserType),
    required: true,
  },
  apiKey: { type: String, unique: true, index: true, select: false },

  projects: [
    {
      type: Schema.Types.ObjectId,
      ref: "Project", // Establishes a link to the Project model
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// --- Mongoose Middleware for Password Hashing and API key creation ---
userSchema.pre("save", async function (next) {
  try {
    // Hash password if new/modified
    if (this.isModified("password") && this.password) {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    }

    // Generate API key if new user
    if (this.isNew) {
      this.apiKey = crypto.randomBytes(3).toString("hex");
    }

    next();
  } catch (error) {
    if (error instanceof Error) {
      return next(error);
    }
    return next(new Error("User pre-save failed"));
  }
});

// --- Mongoose Instance Method for Password Comparison ---
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

// --- JSON Transformation ---
userSchema.set("toJSON", {
  transform: (doc, ret: Partial<IUser>) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    if ("password" in ret) {
      delete ret.password;
    }
    if ("apiKey" in ret) {
      delete ret.apiKey;
    }
    return ret;
  },
});

export default model<IUser>("User", userSchema);
