const { catchAsync, AppError, sendResponse } = require("../helpers/utils");
const User = require("../models/User");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");

// console.log("Crypto Module:", crypto);
// console.log("Crypto.randomBytes:", typeof crypto.randomBytes);

const { StatusCodes } = require("http-status-codes");

const authController = {};
// đăng nhập với email
authController.loginWithEmail = catchAsync(async (req, res, next) => {
  const { name, email, password } = req.body;

  const user = await User.findOne({ email }, "+password");
  if (!user)
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Invalid Credentials",
      "Login Error"
    );

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch)
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Wrong password",
      "Login Error"
    );
  const accessToken = await user.generateToken();

  sendResponse(
    res,
    StatusCodes.OK,
    true,
    { user, accessToken },
    null,
    "Login succsessful"
  );
});

// quên mật khẩu
authController.forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user)
    throw new AppError(
      StatusCodes.NOT_FOUND,
      "User not found",
      "Forgot Password Error"
    );

  const resetToken = crypto.randomBytes(32).toString("hex");
  user.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;
  await user.save({ validateBeforeSave: false }); 


  const resetUrl = `http://localhost:3000/reset-password/${resetToken}`;
  const message = `Click vào link này để đặt lại mật khẩu: ${resetUrl}`;

  console.log("=== Simulated Email ===");
  console.log(`To: ${email}`);
  console.log(`Subject: Password Reset Request`);
  console.log(`Message: ${message}`);
  console.log("=======================");

  sendResponse(
    res,
    StatusCodes.OK,
    true,
    { resetUrl },
    null,
    "Password reset link generated."
  );
});


authController.resetPassword = catchAsync(async (req, res, next) => {
  const { token, password } = req.body;
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  console.log("🔑 Token client gửi lên:", token);
  console.log("🔒 Token đã hash:", hashedToken);

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() },
  }).select("+password +oldPasswords"); 
  if (!user) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Invalid or expired token",
      "Reset Password Error"
    );
  }

  
  const isSameAsCurrent = await bcrypt.compare(password, user.password);
  if (isSameAsCurrent) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Mật khẩu mới không được trùng với mật khẩu hiện tại",
      "Reset Password Error"
    );
  }

  if (user.oldPasswords && user.oldPasswords.length > 0) {
    const matchedBefore = await Promise.all(
      user.oldPasswords.map((oldHash) => bcrypt.compare(password, oldHash))
    );
    if (matchedBefore.includes(true)) {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        "Mật khẩu mới không được trùng với mật khẩu đã sử dụng trước đây",
        "Reset Password Error"
      );
    }
  }

  user.oldPasswords = user.oldPasswords?.slice(-4) || [];
  user.oldPasswords.push(user.password);

  user.password = await bcrypt.hash(password, 10);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;

  await user.save();

  sendResponse(
    res,
    StatusCodes.OK,
    true,
    null,
    null,
    "Password has been reset successfully."
  );
});

module.exports = authController;
