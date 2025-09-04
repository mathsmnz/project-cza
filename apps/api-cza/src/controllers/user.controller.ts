// src/controllers/user.controller.ts
import { Request, Response } from "express";
import User, { UserType } from "../models/user.model";
import { signAccessToken, signRefreshToken } from "../utils/token";
import jwt from "jsonwebtoken"

// This route is for any new user to sign up. They are ALWAYS a 'Finaluser'.
export const registerUser = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;

    const newUser = new User({
      username: username,
      email: email,
      password: password,
      role: UserType.Finaluser, 
    });

    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 11000) {
      return res.status(409).json({
        message: 'Conflict: A user with the provided username or email already exists.',
      });
    }
    if (error instanceof Error && error.name === 'ValidationError') {
      return res.status(400).json({
          message: 'Validation failed. Please check the provided data.',
      });
    }
    return res.status(500).json({
      message: 'Internal Server Error: An unexpected error occurred.',
    });
  }
};

// This route allows an admin to create a new user with any role.
export const registerUserByAdmin = async (req: Request, res: Response) => {
    try {
        const { username, email, password, role } = req.body;

        // An admin MUST provide a role when creating a user this way.
        if (!role || !Object.values(UserType).includes(role)) {
            return res.status(400).json({ message: "A valid role is required." });
        }

        const newUser = new User({
            username: username,
            email: email,
            password: password,
            role: role, 
        });

        const savedUser = await newUser.save();
        res.status(201).json(savedUser);
    } catch (error: unknown) {
        if (error && typeof error === 'object' && 'code' in error && error.code === 11000) {
            return res.status(409).json({
                message: 'Conflict: A user with the provided username or email already exists.',
            });
        }
        if (error instanceof Error && error.name === 'ValidationError') {
            return res.status(400).json({
                message: 'Validation failed. Please check the provided data.',
            });
        }
        return res.status(500).json({
            message: 'Internal Server Error: An unexpected error occurred.',
        });
    }
};

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "An unknown error occurred" });
    }
  }
};

export const seedUsers = async (req: Request, res: Response) => {
  try {
    const templateUsers = [
      {
        username: "admin_user",
        email: "admin@example.com",
        password: "PasswordAdmin123!",
        role: UserType.Admin,
        projects: [],
      },
      {
        username: "editor_user",
        email: "editor@example.com",
        password: "PasswordEditor456!",
        role: UserType.Editor,
        projects: [],
      },
      {
        username: "final_user",
        email: "user@example.com",
        password: "PasswordUser789!",
        role: UserType.Finaluser,
        projects: [],
      },
    ];

    await User.deleteMany({
      email: { $in: templateUsers.map((u) => u.email) },
    });

    const createdUsers = await User.create(templateUsers);

    res.status(201).json({
      message: `${createdUsers.length} users seeded successfully.`,
      users: createdUsers,
    });
  } catch (error) {
    if (error instanceof Error) {
      res
        .status(500)
        .json({ message: `User seeding failed: ${error.message}` });
    } else {
      res
        .status(500)
        .json({ message: "An unknown error occurred during user seeding." });
    }
  }
};

// --- Authentication ---
export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  console.log(req.body);
  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Please provide email and password." });
  }

  const user = await User.findOne({ email }).select("+password");
  console.log(user);
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ message: "Incorrect email or password." });
  }

  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  res.status(200).json({
    message: "Login successful.",
    accessToken,
    user, // The toJSON transform will clean this object
  });
};

export const logoutUser = (req: Request, res: Response) => {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
  res.json({ message: "Logged out successfully" });
};

export const refreshToken = async (req: Request, res: Response) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.status(401).json({ message: "No refresh token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET as string) as { id: string };
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ message: "User not found" });

    const newAccessToken = signAccessToken(user);
    const newRefreshToken = signRefreshToken(user);

    // Rotate refresh token
    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ accessToken: newAccessToken });
  } catch (err) {
    res.status(403).json({ message: "Invalid or expired refresh token" });
  }
};


// --- Admin-Only Password Reset ---
export const adminResetPassword = async (req: Request, res: Response) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword) {
      return res
        .status(400)
        .json({ message: "Please provide a new password." });
    }

    const user = await User.findById(req.params.id).select("+password");
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    user.password = newPassword;
    await user.save(); // The pre-save hook hashes the new password automatically

    res
      .status(200)
      .json({ message: `Password for user ${user.username} has been reset.` });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    }
  }
};
