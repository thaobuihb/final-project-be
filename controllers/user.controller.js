const { sendResponse, AppError, catchAsync } = require("../helpers/utils");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const { StatusCodes } = require("http-status-codes");

const userController = {};

// Đăng ký người dùng mới
userController.register = catchAsync(async (req, res, next) => {
  let { name, email, password } = req.body;

  let user = await User.findOne({ email });
  if (user)
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "User already exists",
      "Registration Error"
    );

  const salt = await bcrypt.genSalt(10);
  password = await bcrypt.hash(password, salt);
  user = await User.create({ name, email, password });
  const accessToken = await user.generateToken();

  sendResponse(
    res,
    StatusCodes.OK,
    true,
    { user, accessToken },
    null,
    "User created successfully"
  );
});

// Lấy tất cả người dùng (ngoại trừ admin)
userController.getUsers = catchAsync(async (req, res, next) => {
  const users = await User.find({ isDeleted: false, role: { $ne: "admin" } });
  sendResponse(
    res,
    StatusCodes.OK,
    true,
    users,
    null,
    "Users retrieved successfully"
  );
});

// Lấy thông tin người dùng hiện tại
userController.getCurrentUser = catchAsync(async (req, res, next) => {
  const currentUserId = req.userId;

  const user = await User.findById(currentUserId);

  if (!user) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      "User not found",
      "Get current user error"
    );
  }

  return sendResponse(
    res,
    StatusCodes.OK,
    true,
    user,
    null,
    "Current user retrieved successfully"
  );
});

// Lấy thông tin người dùng theo ID
userController.getUserById = catchAsync(async (req, res, next) => {
  const userId = req.params.id;
  const currentUserId = req.userId;

  const currentUser = await User.findById(currentUserId);

  if (currentUser.role !== "admin" && currentUserId !== userId) {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      "Access denied",
      "Unauthorized access"
    );
  }

  const user = await User.findOne({ _id: userId, isDeleted: false });
  if (!user) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      "User not found",
      "Profile Error"
    );
  }

  sendResponse(
    res,
    StatusCodes.OK,
    true,
    user,
    null,
    "User profile retrieved successfully"
  );
});

// Cập nhật thông tin người dùng
userController.updateUser = catchAsync(async (req, res, next) => {
  const currentUserId = req.userId;
  const userId = req.params.id;
  
  if (currentUserId !== userId) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Permission required",
      "Profile Update error"
    );
  }

  let user = await User.findOne({ _id: userId, isDeleted: false });

  if (!user) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      "User not found",
      "Profile Update Error"
    );
  }

  const {
    name,
    email,
    password,
    gender,
    birthday,
    city,
    state,
    district,
    ward,
    street,
    houseNumber,
    phone,
    zipcode,
    role,
  } = req.body;

  // Cập nhật thông tin người dùng
  user.name = name || user.name;
  user.email = email || user.email;
  user.gender = gender || user.gender;
  user.birthday = birthday || user.birthday;
  user.city = city || user.city;
  user.state = state || user.state;
  user.district = district || user.district;
  user.ward = ward || user.ward;
  user.street = street || user.street;
  user.houseNumber = houseNumber || user.houseNumber;
  user.phone = phone || user.phone;
  user.zipcode = zipcode || user.zipcode;
  user.role = role || user.role;

  if (password) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
  }

  user = await user.save();

  sendResponse(
    res,
    StatusCodes.OK,
    true,
    user,
    null,
    "User profile updated successfully"
  );
});

// Xóa người dùng
userController.deleteUser = catchAsync(async (req, res, next) => {
  const userId = req.params.id;

  const user = await User.findOne({ _id: userId, isDeleted: false });

  if (!user) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      "User not found",
      "Delete User Error"
    );
  }

  user.isDeleted = true;
  await user.save();

  sendResponse(
    res,
    StatusCodes.OK,
    true,
    null,
    null,
    "User deleted successfully"
  );
});

module.exports = userController;
