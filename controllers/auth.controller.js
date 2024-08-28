const { catchAsync, AppError, sendResponse } = require("../helpers/utils");
const user = require("../models/User");
const bcrypt = require("bcryptjs");



const authController = {};

authController.loginWithEmail = catchAsync(async (req, res, next) => {
    //get data from request
    const { name, email, password } = req.body;
  
    //Validation
    const user = await User.findOne({ email }, "+password");
    if (!user)
      throw new AppError(400,  "Invalid Credentials", "Login Error");
  
    //Process
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new AppError(400, "Wrong password", "Login Error");
    const accessToken = await user.generateToken();

      //Response
    sendResponse(res, 200, true, { user, accessToken   }, null, "Login succsessful");
  });

module.exports = authController;