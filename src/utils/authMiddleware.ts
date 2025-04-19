import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export interface AuthenticatedRequest extends Request {
  userId?: number;
}

export const authenticateToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  jwt.verify(token, process.env.JWT_SECRET!, (err, payload) => {
    if (err) return res.status(403).json({ message: "Invalid token" });

    const { id } = payload as { id: number };
    req.userId = id;
    next();
  });
};
