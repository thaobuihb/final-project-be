const { sendResponse, AppError, catchAsync } = require("../helpers/utils");
const User = require("../models/User");
const bcrypt = require("bcryptjs");

const userController = {};

userController.register = catchAsync(async (req, res, next) => {
  //get data from request
  let { name, email, password } = req.body;

  //Validation
  let user = await User.findOne({ email });
  if (user)
    throw new AppError(400, "User already exists", "Registration Error");

  //Process
  const salt = await bcrypt.genSalt(10);
  password = await bcrypt.hash(password, salt);
  user = await User.create({ name, email, password });
  const accessToken = await user.generateToken();
  //Response
  sendResponse(
    res,
    200,
    true,
    { user, accessToken },
    null,
    "Create user succsessful"
  );
});

userController.getUsers = catchAsync(async (req, res, next) => {
  const users = await User.find({ isDeleted: false });

  sendResponse(res, 200, true, users, null, "Users retrieved successfully");
});

userController.getCurrentUser = catchAsync(async (req, res, next) => {
  //get data from request
  const currentUserId = req.userId;

  //Validation
  const user = await User.findById(currentUserId);
  if (!user)
    throw new AppError(400, "User not found", "Get current user error");

  //Response
  return sendResponse(
    res,
    200,
    true,
    user,
    null,
    "Get current user successful"
  );
});

userController.getUserById = catchAsync(async (req, res, next) => {
  const userId = req.params.id;

  const user = await User.findOne({ _id: userId, isDeleted: false });

  if (!user) {
    throw new AppError(404, "User not found", "Profile Error");
  }

  sendResponse(res, 200, true, user, null, "Get User profile successfully");
});

userController.updateUser = catchAsync(async (req, res, next) => {
  const currentUserId = req.userId;
  const userId = req.params.id;
  if(currentUserId !== userId)
  throw new AppError(400, "Permission required", " Update Profile error")
  const {
    name,
    email,
    password,
    gender,
    birthday,
    address,
    city,
    state,
    zipcode,
    role,
  } = req.body;

  // Fetch user from the database
  let user = await User.findOne({ _id: userId, isDeleted: false });

  if (!user) {
    throw new AppError(404, "User not found", "Profile Update Error");
  }

  // Update user profile fields

  user.name = name || user.name;
  user.email = email || user.email;
  user.gender = gender || user.gender;
  user.birthday = birthday || user.birthday;
  user.address = address || user.address;
  user.city = city || user.city;
  user.state = state || user.state;
  user.zipcode = zipcode || user.zipcode;
  user.role = role || user.role

  // Update password if provided
  if (password) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
  }

  // Save the updated user profile
  user = await user.save();

  sendResponse(res, 200, true, user, null, "User profile updated successfully");
});

userController.deleteUser = catchAsync(async (req, res, next) => {
  const userId = req.params.id;

  // Find the user by ID
  const user = await User.findOne({ _id: userId, isDeleted: false });

  if (!user) {
    throw new AppError(404, "User not found", "Delete User Error");
  }

  // Mark the user as deleted
  user.isDeleted = true;
  await user.save();

  sendResponse(res, 200, true, null, null, "User deleted successfully");
});

module.exports = userController;
