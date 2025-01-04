const adminController = {};
const Book = require("../models/Book");
const Order = require("../models/Order");
const User = require("../models/User");
const DeletedBook = require("../models/DeletedBook");
const mongoose = require("mongoose");
const Category = require("../models/Category");
const Joi = require("joi");

const { sendResponse, catchAsync, AppError } = require("../helpers/utils");
const { StatusCodes } = require("http-status-codes");

const updateBookSchema = Joi.object({
  name: Joi.string().optional(),
  author: Joi.string().optional(),
  price: Joi.number().positive().optional(),
  publicationDate: Joi.date().optional(),
  img: Joi.string().optional(),
  description: Joi.string().optional(),
  categoryId: Joi.string().optional(),
  discountRate: Joi.number().min(0).max(100).optional(),
});

// Tổng quan
adminController.getDashboardData = async (req, res, next) => {
  try {
    const totalBooks = await Book.countDocuments({ isDeleted: false });
    const totalOrders = await Order.countDocuments();
    const totalUsers = await User.countDocuments();
    const totalRevenue = await Order.aggregate([
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);

    const response = {
      totalBooks,
      totalOrders,
      totalUsers,
      totalRevenue: totalRevenue[0]?.total || 0,
    };

    sendResponse(res, 200, true, response, null, "Dashboard data retrieved");
  } catch (err) {
    next(err);
  }
};

// lấy danh sách sách
adminController.getBooks = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 10, search } = req.query;

  const query = { isDeleted: false };

  if (search) {
    query.name = { $regex: search, $options: "i" };
  }

  const books = await Book.aggregate([
    { $match: query },
    {
      $group: {
        _id: "$_id",
        doc: { $first: "$$ROOT" },
      },
    },
    { $replaceRoot: { newRoot: "$doc" } },
    { $skip: (page - 1) * parseInt(limit) },
    { $limit: parseInt(limit) },
  ]);

  const totalBooks = await Book.countDocuments(query);
  const totalPages = Math.ceil(totalBooks / limit);

  sendResponse(
    res,
    200,
    true,
    { books, totalBooks, totalPages },
    null,
    "Books fetched successfully"
  );
});

// thêm sách
adminController.createBook = catchAsync(async (req, res, next) => {
  const {
    name,
    author,
    price,
    publicationDate,
    img,
    description,
    category,
    discountRate,
  } = req.body;

  const categoryData = await Category.findById(category);
  if (!categoryData) {
    throw new AppError(404, "Category not found", "Create Book Error");
  }

  const discountedPrice = discountRate
    ? parseFloat((price - (price * discountRate) / 100).toFixed(2))
    : price;

  const book = await Book.create({
    name,
    author,
    price,
    publicationDate,
    img,
    description,
    category,
    categoryName: categoryData.name,
    discountRate,
    discountedPrice,
  });

  sendResponse(res, 201, true, book, null, "Book created successfully");
});

//Tạo sách
adminController.createBook = catchAsync(async (req, res, next) => {
  const {
    name,
    author,
    price,
    publicationDate,
    img,
    description,
    categoryId,
    discountRate,
  } = req.body;

  const category = await Category.findById(categoryId);
  if (!category) {
    return res.status(StatusCodes.NOT_FOUND).json({
      success: false,
      message: "Category not found",
    });
  }

  let discountedPrice = price;
  if (discountRate && discountRate > 0) {
    discountedPrice = (price - (price * discountRate) / 100).toFixed(2);
  }

  const newBook = await Book.create({
    name,
    author,
    price,
    discountedPrice,
    discountRate: discountRate || 0,
    publicationDate,
    img,
    description,
    category: category._id,
    categoryName: category.name,
  });

  sendResponse(
    res,
    StatusCodes.CREATED,
    true,
    newBook,
    null,
    "Book created successfully"
  );
});

// Cập nhật sách
adminController.updateBook = catchAsync(async (req, res, next) => {
  const { bookId } = req.params;
  const { error, value } = updateBookSchema.validate(req.body);

  if (error) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: error.details[0].message,
    });
  }

  const book = await Book.findById(bookId);
  if (!book) {
    return res.status(StatusCodes.NOT_FOUND).json({
      success: false,
      message: "Book not found",
    });
  }

  if (value.categoryId) {
    const category = await Category.findById(value.categoryId);
    if (!category) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "Category not found",
      });
    }
    book.category = category._id;
    book.categoryName = category.name;
  }

  // Cập nhật các trường khác nếu có
  Object.keys(value).forEach((key) => {
    book[key] = value[key];
  });

  // Tính toán giá giảm giá nếu có
  if (value.price && value.discountRate) {
    book.discountedPrice = (
      value.price -
      (value.price * value.discountRate) / 100
    ).toFixed(2);
  }

  await book.save();

  sendResponse(
    res,
    StatusCodes.OK,
    true,
    book,
    null,
    "Book updated successfully"
  );
});

//xoá sách
adminController.softDeleteBook = async (req, res, next) => {
  try {
    const { bookId } = req.params;

    // Tìm sách cần xóa
    const book = await Book.findById(bookId);
    if (!book) {
      return res
        .status(404)
        .json({ success: false, message: "Book not found" });
    }

    // Sao chép sách sang collection `deletedBooks` với đầy đủ trường
    const deletedBookData = {
      ...book.toObject(),
      deletedAt: new Date(),
    };

    // Thêm điều kiện kiểm tra `categoryName` nếu thiếu
    if (!deletedBookData.categoryName) {
      const category = await Category.findById(book.category);
      deletedBookData.categoryName = category
        ? category.name
        : "Unknown Category";
    }

    await DeletedBook.create(deletedBookData);
    await Book.findByIdAndDelete(bookId);

    res
      .status(200)
      .json({ success: true, message: "Book soft deleted successfully" });
  } catch (err) {
    next(err);
  }
};

// Fetch deleted books API
adminController.getDeletedBooks = async (req, res, next) => {
  try {
    const deletedBooks = await DeletedBook.find({});
    res.status(200).json({ success: true, data: deletedBooks });
  } catch (err) {
    next(err);
  }
};

// Restore book API
adminController.restoreBook = async (req, res, next) => {
  try {
    const { id } = req.params;

    const deletedBook = await DeletedBook.findById(id);
    if (!deletedBook) {
      return res
        .status(404)
        .json({ success: false, message: "Book not found in deleted books" });
    }

    // Kiểm tra và đảm bảo categoryName tồn tại
    if (!deletedBook.categoryName) {
      const category = await Category.findById(deletedBook.category);
      deletedBook.categoryName = category ? category.name : "Unknown Category";
    }

    // Xóa _id để tránh trùng lặp
    const restoredBookData = { ...deletedBook.toObject() };
    delete restoredBookData._id;

    const restoredBook = await Book.create(restoredBookData);
    await DeletedBook.findByIdAndDelete(id);

    res
      .status(200)
      .json({
        success: true,
        data: restoredBook,
        message: "Book restored successfully",
      });
  } catch (err) {
    next(err);
  }
};
// Permanently delete book API
adminController.permanentlyDeleteBook = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Xóa sách khỏi `deletedBooks`
    const deletedBook = await DeletedBook.findByIdAndDelete(id);
    if (!deletedBook) {
      return res
        .status(404)
        .json({ success: false, message: "Book not found in deleted books" });
    }

    res
      .status(200)
      .json({ success: true, message: "Book permanently deleted" });
  } catch (err) {
    next(err);
  }
};

module.exports = adminController;
