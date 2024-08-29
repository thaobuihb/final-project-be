const jwt = require("jsonwebtoken");
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
const { AppError, sendResponse } = require("../helpers/utils");
const User = require("../models/User");


const authentication = {};

authentication.loginRequired = (req, res, next) => {
    try {
      const tokenString = req.headers.authorization;
      if (!tokenString)
        throw new AppError(401, "Login Required", "Authentication Error");
  
      const token = tokenString.replace("Bearer", "");
      jwt.verify(token, JWT_SECRET_KEY, async (err, payload) => {
        if (err) {
          if (err.name === "TokenExpiredError") {
            throw new AppError(401, "Token expired", "Authentication Error");
          } else {
            throw new AppError(401, "Token is invalid", "Authentication Error");
          }
        }
        // Fetch the user from the database based on payload._id
      const user = await User.findById(payload._id);
      if (!user) {
        throw new AppError(401, "User not found", "Authentication Error");
      }

      req.user = user;
        next(); 
      });
    } catch (error) {
      next(error);
    }
  };
  
  authentication.authorize = (roles) => {
    console.log("given roles: ", roles);
    return async (req, res, next) => {
      try {
        // Kiểm tra vai trò người dùng
        const userRole = req.user.role;

        console.log(`User Role: ${userRole}`);
      console.log(`Allowed Roles: ${roles}`);

        if (!roles.includes(userRole)) {
          return sendResponse(
            res,
            403,
            false,
            null,
            "Unauthorized",
            "Authorization Error"
          );
        }
  
        next(); // Cho phép tiếp tục nếu người dùng có quyền hợp lệ
      } catch (error) {
        return sendResponse(
          res,
          403,
          false,
          null,
          "Authorization failed",
          "Authorization Error"
        );
      }
    };
  };
  

module.exports = authentication;
