const express = require('express');
require("dotenv").config();
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require("cors");
const { sendResponse } = require("./helpers/utils");
const { StatusCodes } = require("http-status-codes");

const indexRouter = require('./routes/index');
const app = express();

// ✅ Cấu hình CORS cho cả local và Netlify
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5001",
  "https://book-store-thao-fe.netlify.app"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.error("❌ Blocked by CORS:", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
  methods: ["GET", "POST", "PUT", "DELETE"]
}));

// Middleware chuẩn khác
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(logger('dev'));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// ✅ Kết nối MongoDB
const mongoose = require("mongoose");
const mongoURI = process.env.MONGODB_URI;
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
})
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((error) => {
    console.error("❌ MongoDB Connection Error:", error.message);
    process.exit(1);
  });

// ✅ Mount route chính
app.use('/api', indexRouter);

// ✅ Route root để test
app.get("/", (req, res) => {
  res.send("API is running 🚀");
});

// ✅ 404 Error Handler
app.use((req, res, next) => {
  console.log("Request Body:", req.body);
  const err = new Error("Not Found");
  err.statusCode = StatusCodes.NOT_FOUND;
  next(err);
});

// ✅ Global Error Handler
app.use((err, req, res, next) => {
  console.log("🔥 Middleware lỗi đã nhận lỗi");
  console.error("🔥 Lỗi toàn cục:", err);

  const statusCode = err.statusCode || 500;
  const message = err.message || "Lỗi không xác định từ máy chủ!";
  const errorType = err.errorType || err.name || "UnknownError";

  res.status(statusCode).json({
    success: false,
    message,
    errorType,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

module.exports = app;
