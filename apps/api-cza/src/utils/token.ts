import * as jwt from "jsonwebtoken";
import { IUser } from "../models/user.model";

export const signAccessToken = (user: IUser) => {
  const accessSecret = process.env.JWT_ACCESS_SECRET!;
  const expiresIn = process.env.JWT_ACCESS_EXPIRES || "15m";

  return jwt.sign(
    { id: user._id, role: user.role },
    accessSecret,
    { expiresIn:"15m" }
  );
};

export const signRefreshToken = (user: IUser) => {
  const refreshSecret = process.env.JWT_REFRESH_SECRET!;
  const expiresIn = process.env.JWT_REFRESH_EXPIRES || "7d";

  return jwt.sign(
    { id: user._id },
    refreshSecret,
    { expiresIn:"7d" }
  );
};
