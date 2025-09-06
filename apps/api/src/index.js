import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

import authRoutes from "./routes/auth.js";
import { authMiddleware } from "./middleware/auth.js";
import gameRoutes from "./routes/game.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Health check endpoint for Railway
app.get("/", (req, res) => {
  res.json({ 
    status: "OK", 
    message: "Covid Slayer API is running",
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ 
    status: "OK", 
    message: "Covid Slayer API is healthy",
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.API_PORT || 4000;
const MONGO_URI = process.env.MONGODB_URI;

// Mongo connection
mongoose.connect(MONGO_URI).then(() => {
  console.log("✅ MongoDB connected");
}).catch(err => console.error("❌ MongoDB error", err));

// Routes
app.use("/auth", authRoutes);
app.use("/game", gameRoutes);

// Example protected route
app.get("/profile", authMiddleware, (req, res) => {
  res.json({ message: `Hello ${req.user.username}!`, user: req.user });
});

app.listen(PORT, () => {
  console.log(`🚀 API running on http://localhost:${PORT}`);
});