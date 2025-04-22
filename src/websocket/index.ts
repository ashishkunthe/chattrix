import { WebSocketServer, WebSocket } from "ws";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const userConnections = new Map<number, WebSocket>();

export function initWebSocket(server: any) {
  const wss = new WebSocketServer({ server });

  wss.on("connection", (ws: WebSocket, req) => {
    const params = new URLSearchParams(req.url?.split("?")[1]);
    const token = params.get("token");

    if (!token) {
      ws.close();
      return;
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
        id: number;
      };
      const userId = decoded.id;

      // Store the WebSocket connection
      userConnections.set(userId, ws);
      console.log(`User ${userId} connected`);

      ws.on("message", (data) => {
        const message = JSON.parse(data.toString());
        const { chatId, content, receiverId } = message;

        console.log("Message received from", userId, "to", receiverId);

        // Send to the receiver if connected
        const receiverSocket = userConnections.get(receiverId);
        if (receiverSocket && receiverSocket.readyState === WebSocket.OPEN) {
          receiverSocket.send(
            JSON.stringify({ chatId, content, senderId: userId })
          );
        }
      });

      ws.on("close", () => {
        userConnections.delete(userId);
        console.log(`User ${userId} disconnected`);
      });
    } catch (err) {
      console.log("Invalid token");
      ws.close();
    }
  });

  return wss;
}
