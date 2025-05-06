import { Router } from "express";
import { authMiddleware } from "../utils/authMiddleware";
import prisma from "../lib/prisma";

const route = Router();

// @ts-ignore
route.post("/chat", authMiddleware, async (req, res) => {
  const { targetUserId } = req.body;
  // @ts-ignore
  const senderUserId = req.userId;

  const userExist = await prisma.user.findFirst({
    where: { id: targetUserId },
  });

  if (!userExist) {
    return res.status(400).json({
      message: "the recieving user don't exist",
    });
  }

  try {
    const chatExist = await prisma.chat.findFirst({
      where: {
        OR: [
          { user1Id: senderUserId, user2Id: targetUserId },
          { user1Id: targetUserId, user2Id: senderUserId },
        ],
      },
    });
    if (chatExist) {
      return res.json({ chatExist });
    } else {
      const newChat = await prisma.chat.create({
        data: {
          user1: { connect: { id: senderUserId } },
          user2: { connect: { id: targetUserId } },
        },
      });
      return res.json({ newChat });
    }
  } catch (error) {
    console.log(error);
    res.json({ message: "somrthing went wrong" });
  }
});

// @ts-ignore
route.get("/chat", authMiddleware, async (req, res) => {
  // @ts-ignore
  const userId = req.userId;
  try {
    const chat = await prisma.chat.findMany({
      where: {
        OR: [{ user1Id: userId }, { user2Id: userId }],
      },
      include: {
        user1: {
          select: { id: true, name: true, email: true },
        },
        user2: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return res.json({ chat });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "something went wrong",
    });
  }
});

// @ts-ignore
route.get("/users", authMiddleware, async (req, res) => {
  // @ts-ignore
  const currentUserId = req.userId;

  try {
    const users = await prisma.user.findMany({
      where: {
        NOT: { id: currentUserId },
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    res.json({ users });
  } catch (error) {
    console.log("Error fetching users:", error);
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

export default route;
