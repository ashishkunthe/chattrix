import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import authRoutes from "./routes/auth";
import chatRoutes from "./routes/chat";
import messageRoutes from "./routes/message";
import { initWebSocket } from "./websocket";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

// Routes
app.use("/api", authRoutes);
app.use("/api", chatRoutes);
app.use("/api", messageRoutes);

const server = http.createServer(app);

initWebSocket(server);

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
