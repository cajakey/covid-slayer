import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/User.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "changeme";

// Register
router.post("/register", async (req, res) => {
  try {
    const { username, fullname, email, password, avatar = "" } = req.body;

    // Validate required fields
    if (!username || !fullname || !email || !password) {
      return res.status(400).json({ error: "Username, fullname, email, and password are required" });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({ 
      username, 
      fullname, 
      email, 
      password: hashedPassword, 
      avatar 
    });
    await user.save();

    res.json({ message: "User registered successfully!" });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: "Username or email already exists" });
    }
    res.status(400).json({ error: err.message });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // compare hashed password
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, {
      expiresIn: "1h"
    });

    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: "Login failed" });
  }
});

export default router;