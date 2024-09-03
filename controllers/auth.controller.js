const { catchAsync, AppError, sendResponse } = require("../helpers/utils");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const { StatusCodes } = require("http-status-codes");




const authController = {};

authController.loginWithEmail = catchAsync(async (req, res, next) => {
    //get data from request
    const { name, email, password } = req.body;
  
    //Validation
    const user = await User.findOne({ email }, "+password");
    if (!user)
      throw new AppError(StatusCodes.BAD_REQUEST,  "Invalid Credentials", "Login Error");
  
    //Process
    const isMatch = await bcrypt.compare(password, user.password); //ma hoa va so sanh password
    if (!isMatch) throw new AppError(StatusCodes.BAD_REQUEST, "Wrong password", "Login Error");
    const accessToken = await user.generateToken();

      //Response
    sendResponse(res, StatusCodes.OK, true, { user, accessToken   }, null, "Login succsessful");
  });

module.exports = authController;