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

//admin tạo quản lý
userController.addUser = catchAsync(async (req, res) => {
  const { name, email, password, role } = req.body;

  // Chỉ Admin có quyền thêm người dùng
  if (req.user.role !== "admin") {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      "You are not allowed to add users",
      "Authorization Error"
    );
  }

  // Chỉ cho phép thêm role là 'manager'
  if (role && role !== "manager") {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      "You can only add users with role 'manager'",
      "Authorization Error"
    );
  }

  let user = await User.findOne({ email });
  if (user) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "User already exists",
      "Add User Error"
    );
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  user = await User.create({
    name,
    email,
    password: hashedPassword,
    role: "manager", 
  });

  sendResponse(
    res,
    StatusCodes.CREATED,
    true,
    user,
    null,
    "Manager added successfully"
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

  // Lấy thông tin người dùng từ cơ sở dữ liệu
  let user = await User.findOne({ _id: userId, isDeleted: false });

  if (!user) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      "User not found",
      "Profile Update Error"
    );
  }

  // Kiểm tra xem người dùng hiện tại có quyền admin hay không
  const currentUser = await User.findById(currentUserId);

  if (currentUser.role !== "admin" && currentUserId !== userId) {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      "Permission denied",
      "Update User Error"
    );
  }

  const { role, isDeleted } = req.body;

  // Chỉ admin được thay đổi `role` và `isDeleted`
  if (currentUser.role === "admin") {
    if (role && !["admin", "manager", "customer"].includes(role)) {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        "Invalid role value",
        "Update User Error"
      );
    }

    if (role) user.role = role;
    if (typeof isDeleted === "boolean") user.isDeleted = isDeleted;
  } else {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      "Only admins can update role and isDeleted fields",
      "Update User Error"
    );
  }

  user = await user.save();

  sendResponse(
    res,
    StatusCodes.OK,
    true,
    user,
    null,
    "User updated successfully"
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
