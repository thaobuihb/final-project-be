const jwt = require("jsonwebtoken");
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || process.env.JWT_SECRET; 
const { AppError, sendResponse } = require("../helpers/utils");
const { StatusCodes } = require("http-status-codes");

const authentication = {};

// Middleware yêu cầu đăng nhập
authentication.loginRequired = (req, res, next) => {
  try {
    
    // console.log("Request Headers:%%%%%", req.headers);

    const tokenString = req.headers.authorization;
    // console.log("Authorization Header:", tokenString);

    // Bỏ qua kiểm tra đăng nhập cho các route công khai
    if (req.originalUrl.includes("/orders/guest")) {
      // console.log("Public route accessed, skipping authentication:", req.originalUrl);
      return next();
    }

    if (!tokenString) {
      console.error("Token not found in request headers.");
      throw new AppError(
        StatusCodes.UNAUTHORIZED,
        "Login Required",
        "Authentication Error"
      );
    }

    const token = tokenString.replace("Bearer ", "");
    // console.log("Extracted Token:", token);

    jwt.verify(token, JWT_SECRET_KEY, (err, payload) => {
      if (err) {
        if (err.name === "TokenExpiredError") {
          console.error("Token expired.");
          throw new AppError(
            StatusCodes.UNAUTHORIZED,
            "Token expired",
            "Authentication Error"
          );
        } else {
          console.error("Token is invalid.");
          throw new AppError(
            StatusCodes.UNAUTHORIZED,
            "Token is invalid",
            "Authentication Error"
          );
        }
      }

      
      // console.log("Token Payload:", payload);

      // Gán thông tin người dùng vào request
      req.role = payload.role;
      req.userId = payload._id;

      
      // console.log("UserId from Token:", req.userId);

      next();
    });
  } catch (error) {
    console.error("Error in loginRequired middleware:", error.message);
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
  const token = req.headers.authorization?.split(' ')[1]; 

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
