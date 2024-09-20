const Book = require("../models/Book.js");
const Review = require("../models/Review.js");
const Category = require("../models/Category.js");
const { sendResponse, catchAsync, AppError } = require("../helpers/utils");
const mongoose = require("mongoose");
const { ObjectId } = require("mongoose").Types;
const { StatusCodes } = require("http-status-codes");

const bookController = {};

// Create book
bookController.createBook = [
  catchAsync(async (req, res, next) => {
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
      throw new AppError(
        StatusCodes.NOT_FOUND,
        "Category not found",
        "Create Book Error"
      );
    }

    let discountedPrice = price;
    if (discountRate && discountRate > 0) {
      discountedPrice = price - (price * discountRate) / 100;
    }

    const book = await Book.create({
      name,
      author,
      price,
      discountedPrice: discountedPrice, 
      discountRate: discountRate || 0,   
      publicationDate,
      img,
      description,
      category: category._id, 
    });

    console.log(book);

    sendResponse(
      res,
      StatusCodes.OK,
      true,
      book,
      null,
      "Create new book successful"
    );
  }),
];

//Get all books
bookController.getAllBooks = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 10, search, minPrice, maxPrice } = req.query;

  const pageNumber = parseInt(page);
  const limitNumber = parseInt(limit);
  const skip = (pageNumber - 1) * limitNumber;

  const searchQuery = {
    isDeleted: false,
  };

  if (search) {
    const yearPattern = /\b\d{4}\b/;
    const yearMatch = search.match(yearPattern);

    if (yearMatch) {
      searchQuery.publicationDate = {
        $regex: new RegExp(`\\b${yearMatch[0]}\\b`),
      };
    } else {
      searchQuery.$or = [
        { name: { $regex: new RegExp(search, "i") } },
        { author: { $regex: new RegExp(search, "i") } },
        { publicationDate: { $regex: new RegExp(search, "i") } },
      ];
    }
  }

  if (minPrice && maxPrice) {
    const minPriceValue = parseFloat(minPrice);
    const maxPriceValue = parseFloat(maxPrice);
    searchQuery.price = { $gte: minPriceValue, $lte: maxPriceValue };
  }

  const result = await Book.aggregate([
    {
      $match: searchQuery,
    },
    {
      $lookup: {
        from: "categories",
        localField: "category",
        foreignField: "_id",
        as: "category",
      },
    },
    {
      $unwind: "$category",
    },
    {
      $project: {
        name: 1,
        author: 1,
        price: 1,
        publicationDate: 1,
        img: 1,
        description: 1,
        discountRate: 1,
        discountedPrice: 1,
        categoryName: "$category.categoryName",
      },
    },
    {
      $facet: {
        paginatedBooks: [{ $skip: skip }, { $limit: limitNumber }],
        totalCount: [{ $count: "total" }],
      },
    },
  ]);

  const { paginatedBooks, totalCount } = result[0];
  const totalPages =
    paginatedBooks.length > 0
      ? Math.ceil(totalCount[0].total / limitNumber)
      : 0;

  const response = {
    books: paginatedBooks,
    totalPages,
  };

  sendResponse(
    res,
    StatusCodes.OK,
    true,
    response,
    null,
    "Books retrieved successfully"
  );
});

// Get book by id
bookController.getBookById = catchAsync(async (req, res, next) => {
  const { id: bookId } = req.params;
  const [book] = await Book.aggregate([
    {
      $match: { _id: new mongoose.Types.ObjectId(bookId), isDeleted: false },
    },
    {
      $lookup: {
        from: "categories",
        localField: "category",
        foreignField: "_id",
        as: "category",
      },
    },
    {
      $unwind: "$category",
    },
    {
      $project: {
        name: 1,
        author: 1,
        price: 1,
        publicationDate: 1,
        description: 1,
        img: 1,
        categoryName: "$category.categoryName",
      },
    },
  ]);

  if (!book) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      "Book not found",
      "Get Book Error"
    );
  }

  const reviews = await Review.find({ bookId: book._id, isDeleted: false });
  book.reviews = reviews;

  sendResponse(
    res,
    StatusCodes.OK,
    true,
    book,
    null,
    "Book retrieved successfully"
  );
});

// Update a book
bookController.updateBook = catchAsync(async (req, res, next) => {
  const bookId = req.params.id;
  const updateData = req.body;

  if (updateData.discountRate !== undefined) {
    const originalPrice = updateData.price;
    const discountRate = updateData.discountRate;
    const discountedPrice =
      originalPrice - (originalPrice * discountRate) / 100;
    updateData.discountedPrice = discountedPrice;
  }

  const book = await Book.findByIdAndUpdate(
    bookId,
    { $set: { isDeleted: false, ...updateData } },
    { new: true }
  );
  if (!book) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      "Book not found",
      "Update Book Error"
    );
  }
  sendResponse(
    res,
    StatusCodes.OK,
    true,
    book,
    null,
    "Book updated successfully"
  );
});

// Delete a book
bookController.deleteBook = catchAsync(async (req, res, next) => {
  const { id: bookId } = req.params;

  const book = await Book.findByIdAndUpdate(
    bookId,
    { $set: { isDeleted: true } },
    { new: true }
  );

  if (!book) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      "Book not found",
      "Delete Book Error"
    );
  }

  sendResponse(
    res,
    StatusCodes.OK,
    true,
    book,
    null,
    "Book deleted successfully"
  );
});

module.exports = bookController;
