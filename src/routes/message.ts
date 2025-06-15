import { Router } from "express";
import { authMiddleware } from "../utils/authMiddleware";
import prisma from "../lib/prisma";
import redis from "../redis";

const route = Router();

// @ts-ignore
route.post("/message", authMiddleware, async (req, res) => {
  const { chatId, content, receiverId } = req.body;
  //@ts-ignore
  const senderId = req.userId;

  try {
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

    await redis.publish(
      "new_message",
      JSON.stringify({
        senderId,
        chatId,
        content,
        receiverId,
      })
    );

    return res.json({ message });
  } catch (e) {
    res.status(500).json({
      message: "something went wrong",
    });
  }
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
