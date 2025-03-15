const jwt = require("jsonwebtoken");
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || process.env.JWT_SECRET;
const { AppError, sendResponse } = require("../helpers/utils");
const { StatusCodes } = require("http-status-codes");

const authentication = {};

// Middleware yêu cầu đăng nhập
authentication.loginRequired = (req, res, next) => {
  try {
    const tokenString = req.headers.authorization;

    // Bypass authentication nếu là đơn hàng của khách (Guest Order)
    if (req.originalUrl.includes("/orders/guest")) {
      return next();
    }

    if (!tokenString) {
      console.error("Token not found in request headers.");
      return next(
        new AppError(
          StatusCodes.UNAUTHORIZED,
          "Login Required",
          "Authentication Error"
        )
      );
    }

    const token = tokenString.replace("Bearer ", "");

    jwt.verify(token, JWT_SECRET_KEY, (err, payload) => {
      if (err) {
        if (err.name === "TokenExpiredError") {
          console.error("Token expired.");
          return next(
            new AppError(
              StatusCodes.UNAUTHORIZED,
              "Token expired",
              "Authentication Error"
            )
          );
        } else {
          console.error("Token is invalid.");
          return next(
            new AppError(
              StatusCodes.UNAUTHORIZED,
              "Token is invalid",
              "Authentication Error"
            )
          );
        }
      }

      // Nếu xác thực thành công, gán thông tin user vào request
      req.user = payload;
      req.userId = payload._id;
      req.role = payload.role;

      return next(); // Đảm bảo gọi `next()` khi xác thực thành công
    });
  } catch (error) {
    console.error("Error in loginRequired middleware:", error.message);
    return next(error);
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

      next();
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
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Token không được cung cấp" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET_KEY);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Token không hợp lệ", error });
  }
};

module.exports = authentication;
