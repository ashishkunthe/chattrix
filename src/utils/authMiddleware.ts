import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

// Define the shape of your JWT payload
interface JwtPayload {
  id: number;
}

// Extend Express Request to include userId
declare module "express" {
  interface Request {
    userId?: number;
  }
}

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as JwtPayload;
    req.userId = decoded.id;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
}
