import { Router } from "express";
import { authMiddleware } from "../utils/authMiddleware";
import prisma from "../lib/prisma";

const route = Router();

// @ts-ignore
route.post("/message", authMiddleware, async (req, res) => {
  const { chatId, content } = req.body;
  //@ts-ignore
  const senderId = req.userId;

  const message = await prisma.message.create({
    data: {
      content,
      chatId,
      senderId,
    },
    include: {
      sender: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return res.json({ message });
});

// @ts-ignore
route.get("/messages/:chatId", authMiddleware, async (req, res) => {
  const chatId = req.params.chatId;

  const messages = await prisma.message.findMany({
    where: { chatId },
    include: {
      sender: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  res.json({ messages });
});

export default route;
