import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma";
import dotenv from "dotenv";

dotenv.config();

const route = Router();

// @ts-ignore
route.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const isExist = await prisma.user.findFirst({ where: { email: email } });

    if (isExist) {
      return res.json({ message: "user already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 5);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET as string);

    res.status(201).json({
      message: "User created",
      details: { name: user.name, email: user.email },
      token,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      message: "Something went wrong",
    });
  }
});

// @ts-ignore

route.post("/signin", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET as string);

    res.json({
      message: "Signin successful",
      token,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

export default route;
