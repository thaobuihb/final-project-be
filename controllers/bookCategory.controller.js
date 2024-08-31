const BookCategory = require("../models/BookCategory");
const { sendResponse, catchAsync, AppError } = require("../helpers/utils");
const mongoose = require("mongoose");

const bookCategoryController = {};

// Get all bookCategories
bookCategoryController.getAllBookCategories = catchAsync(async (req, res, next) => {
    const bookCategories = await BookCategory.find({}).populate("categoryId bookId"); // populate to display details of category and book
    sendResponse(res, 200, true, bookCategories, null, "Fetched all bookCategories successfully");
  });
  
  // Create a new bookCategory
  const createBookCategory = catchAsync(async (req, res, next) => {
    const { bookId, categoryIds } = req.body;
  
    // Validate input
    if (!bookId || !categoryIds || !categoryIds.length) {
      return next(new AppError(400, "Missing required information for creating bookCategory", "Create BookCategory Error"));
    }
  
    // Create records for each categoryId
    const newBookCategories = await Promise.all(
      categoryIds.map(async (categoryId) => {
        return await BookCategory.create({ bookId, categoryId });
      })
    );
  
    sendResponse(res, 201, true, newBookCategories, null, "Created bookCategory successfully");
  });

  bookCategoryController.createBookCategory = catchAsync(async (req, res) => {
    const { bookId, categoryIds } = req.body;
  
    // Check if the book exists
    const book = await Book.findById(bookId);
    if (!book) {
      throw new AppError("Book not found", 404);
    }
  
    // Check if all categories exist
    const categories = await Category.find({ _id: { $in: categoryIds } });
    if (categories.length !== categoryIds.length) {
      throw new AppError("One or more categories not found", 404);
    }
  
    const createdBookCategories = [];
  
    // Iterate through the categoryIds and create the links
    for (const categoryId of categoryIds) {
      const existingLink = await BookCategory.findOne({ bookId, categoryId });
      if (existingLink) {
        throw new AppError("Link already exists between book and category", 400);
      }
  
      const newBookCategory = new BookCategory({
        categoryId,
        bookId,
      });
  
      const savedBookCategory = await newBookCategory.save();
  
      createdBookCategories.push(savedBookCategory);
    }
  
    return sendResponse(
      res,
      201,
      true,
      createdBookCategories,
      null,
      "Book category created successfully"
    );
  });
  

  bookCategoryController.updateBookCategory = catchAsync(async (req, res) => {
    const { bookId } = req.params;
    const { categoryIds } = req.body;
  
    const book = await Book.findById(bookId);
    if (!book) {
      throw new AppError("Book not found", 404);
    }
  
    await BookCategory.deleteMany({ bookId });
  
    const updatedBookCategories = [];
  
    for (const categoryId of categoryIds) {
      const category = await Category.findById(categoryId);
      if (!category) {
        throw new AppError("Category not found", 404);
      }
  
      const newBookCategory = new BookCategory({
        categoryId,
        bookId,
      });
  
      const savedBookCategory = await newBookCategory.save();
  
      updatedBookCategories.push(savedBookCategory);
    }
  
    return sendResponse(
      res,
      201,
      true,
      updatedBookCategories,
      null,
      "Book category updated successfully"
    );
  });
  
  bookCategoryController.deleteBookCategory = catchAsync(async (req, res) => {
    const { bookcategoryId } = req.params;
  
    const bookCategory = await BookCategory.findOne({
      bookcategoryId,
      isDeleted: false,
    });
  
    if (!bookCategory) {
      return sendResponse(
        res,
        404,
        false,
        null,
        "Book category not found",
        "Delete failed"
      );
    }
  
    bookCategory.isDeleted = true;
    await bookCategory.save();
  
    return sendResponse(
      res,
      200,
      true,
      null,
      null,
      "Book category marked as deleted successfully"
    );
  });

module.exports = bookCategoryController;