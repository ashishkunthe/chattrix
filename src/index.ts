import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT;

app.use(express.json());
app.use(cors());
app.use("/api", authRoutes);

app.listen(PORT, () => {
  console.log("server is running");
});
