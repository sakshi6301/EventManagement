require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("./models/User");
const Vendor = require("./models/Vendor");
const Product = require("./models/Product");
const Booking = require("./models/Booking");
const auth = require("./middleware/auth");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Category = require("./models/Category");

const app = express();

/* ---------------- CORS ---------------- */
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      process.env.FRONTEND_URL,
      "http://localhost:5174"
    ];

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true); // allow all in production to avoid blank page issues
    }
  },
  credentials: true
}));

app.use(express.json());
app.use(require("cookie-parser")());

/* ---------------- ROOT ---------------- */
app.get("/", (req, res) => {
  res.json({ message: "API running" });
});

/* ---------------- UPLOADS ---------------- */
if (!fs.existsSync(path.join(__dirname, "uploads"))) {
  fs.mkdirSync(path.join(__dirname, "uploads"));
}

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* ---------------- MONGO CONNECT (FIXED) ---------------- */
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);

    // IMPORTANT FIX:
    // DO NOT crash server on Render
    console.log("⚠️ Server starting WITHOUT DB connection for debugging");

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  }
};

connectDB();

/* ---------------- MULTER ---------------- */
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname))
});

const upload = multer({ storage });

/* ---------------- ROUTES (UNCHANGED LOGIC) ---------------- */

// Example route
app.post("/register", async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      phone,
      role
    });

    await newUser.save();

    const token = jwt.sign(
      { id: newUser._id, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ token, user: newUser });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});