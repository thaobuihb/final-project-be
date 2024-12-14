const jwt = require("jsonwebtoken");
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || process.env.JWT_SECRET; 
const { AppError, sendResponse } = require("../helpers/utils");
const { StatusCodes } = require("http-status-codes");

const authentication = {};

// Middleware yêu cầu đăng nhập
authentication.loginRequired = (req, res, next) => {
  try {

    // console.log("Middleware authentication.loginRequired được gọi");

    const tokenString = req.headers.authorization;
    // console.log("Received token:", tokenString);
    if (!tokenString) {
      throw new AppError(
        StatusCodes.UNAUTHORIZED,
        "Login Required",
        "Authentication Error"
      );
    }

    const token = tokenString.replace("Bearer ", "");
    jwt.verify(token, JWT_SECRET_KEY, (err, payload) => {
      if (err) {
        if (err.name === "TokenExpiredError") {
          throw new AppError(
            StatusCodes.UNAUTHORIZED,
            "Token expired",
            "Authentication Error"
          );
        } else {
          throw new AppError(
            StatusCodes.UNAUTHORIZED,
            "Token is invalid",
            "Authentication Error"
          );
        }
      }

      // Gán thông tin người dùng vào request
      req.role = payload.role;
      req.userId = payload._id;
      // console.log("UserId từ token:123456", req.userId);
      next();
    });
  } catch (error) {
    // console.error("Error in loginRequired middleware: LOI", error);
    next(error);
  }
};

// Middleware kiểm tra vai trò người dùng
authentication.authorize = (roles) => {
  return (req, res, next) => {
    try {
      const userRole = req.role;

      if (!roles.includes(userRole)) {
        return sendResponse(
          res,
          StatusCodes.FORBIDDEN,
          false,
          null,
          "Unauthorized",
          "Authorization Error"
        );
      }

      next(); // Tiếp tục nếu người dùng có quyền hợp lệ
    } catch (error) {
      return sendResponse(
        res,
        StatusCodes.FORBIDDEN,
        false,
        null,
        "Authorization failed",
        "Authorization Error"
      );
    }
  };
};

// Middleware dành cho khách (guest)
authentication.guestIdMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]; // Lấy token từ header Authorization

  if (!token) {
    return res.status(401).json({ message: "Token không được cung cấp" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET_KEY); // Xác minh token với secret
    req.user = decoded; // Gán thông tin người dùng vào request
    next();
  } catch (error) {
    return res.status(401).json({ message: "Token không hợp lệ", error });
  }
};

module.exports = authentication;
