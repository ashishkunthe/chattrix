import { WebSocketServer, WebSocket } from "ws";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

// 🧠 Mapping: userId => WebSocket connection
export const connectedUsers = new Map<number, WebSocket>();

export function initWebSocket(server: any) {
  const wss = new WebSocketServer({ server });

  wss.on("connection", (ws) => {
    console.log("🟢 New WebSocket connection");
    let currentUserId: number | null = null;

    ws.on("message", (data) => {
      const msg = JSON.parse(data.toString());

      // 1️⃣ Handle Authentication
      if (msg.type === "auth") {
        try {
          const decoded = jwt.verify(
            msg.token,
            process.env.JWT_SECRET as string
          ) as { id: number };
          currentUserId = decoded.id;

          // Save socket connection
          connectedUsers.set(currentUserId, ws);
          console.log(`✅ Authenticated user ${currentUserId}`);
        } catch (err) {
          console.log("❌ Invalid token");
          ws.close();
        }
        return;
      }

      // 2️⃣ Optional: handle direct WS messages (not used right now)
      if (msg.type === "send_message") {
        if (!currentUserId) return;
        const { to, content } = msg;

        const receiverSocket = connectedUsers.get(to);
        if (receiverSocket && receiverSocket.readyState === WebSocket.OPEN) {
          receiverSocket.send(
            JSON.stringify({
              type: "new_message",
              from: currentUserId,
              content,
            })
          );
        }
      }
    });

    ws.on("close", () => {
      console.log(`🔴 User ${currentUserId} disconnected`);
      if (currentUserId) connectedUsers.delete(currentUserId);
    });
  });
}
