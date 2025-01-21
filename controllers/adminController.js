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
    query.name = { $regex: search, $options: "i" },
    { isbn: { $regex: search, $options: "i" } } 
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
