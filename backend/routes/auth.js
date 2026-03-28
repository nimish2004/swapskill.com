const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const verifyToken = require("../middleware/verifyToken");
const JWT_SECRET = process.env.JWT_SECRET;

// ✅ SIGNUP
router.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    res.status(201).json({
      message: "User created",
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ LOGIN
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  console.log("📥 Received login request:", req.body);

  if (!email || !password) {
    console.log("❌ Missing email or password");
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    const user = await User.findOne({ email });
    console.log("🔍 User found in DB:", user);

    if (!user) {
      console.log("❌ No user with that email");
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    console.log("✅ Password match?", isMatch);

    if (!isMatch) {
      console.log("❌ Password didn't match");
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    console.log("🎉 Login successful");
    res.json({
      message: "Login successful",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        canTeach: user.canTeach,
        wantToLearn: user.wantToLearn,
        pricePerHour: user.pricePerHour || 0,
      },
    });
  } catch (err) {
    console.error("💥 Login error:", err.message);
    res.status(500).json({ error: err.message });
  }
});



// ✅ UPDATE PROFILE
router.put("/update", verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name, canTeach, wantToLearn, pricePerHour } = req.body;

    if (!userId || !name) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { name, canTeach, wantToLearn, pricePerHour: Number(pricePerHour) || 0 },
      { new: true }
    );

    res.status(200).json({
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        canTeach: updatedUser.canTeach,
        wantToLearn: updatedUser.wantToLearn,
        pricePerHour: updatedUser.pricePerHour || 0,
      },
    });
  } catch (err) {
    console.error("Update Error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
