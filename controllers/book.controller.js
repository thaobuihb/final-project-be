const Book = require("../models/Book.js");
const Review = require("../models/Review.js");
const Category = require("../models/Category.js");
const { sendResponse, catchAsync, AppError } = require("../helpers/utils");
const mongoose = require("mongoose");
const { StatusCodes } = require("http-status-codes");

const bookController = {};

// Create book
bookController.createBook = catchAsync(async (req, res, next) => {
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
    discountedPrice = (price - (price * discountRate) / 100).toFixed(2);
  }

  const book = await Book.create({
    name,
    author,
    price,
    discountedPrice,
    discountRate: discountRate || 0,
    publicationDate,
    img,
    description,
    category: category._id,
  });

  sendResponse(
    res,
    StatusCodes.CREATED,
    true,
    book,
    null,
    "Create new book successful"
  );
});

// Get all books
bookController.getAllBooks = catchAsync(async (req, res, next) => {
  const {
    page = 1,
    limit = 30,
    search,
    minPrice,
    maxPrice,
    category,
  } = req.query;

  const pageNumber = parseInt(page);
  const limitNumber = parseInt(limit);
  const skip = (pageNumber - 1) * limitNumber;

  const searchQuery = { isDeleted: false };

  // Tìm kiếm sách theo từ khóa
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

  // Lọc theo giá
  if (minPrice && maxPrice) {
    const minPriceValue = parseFloat(minPrice);
    const maxPriceValue = parseFloat(maxPrice);
    searchQuery.price = { $gte: minPriceValue, $lte: maxPriceValue };
  }

  // Lọc theo danh mục (category) hoặc theo tên danh mục (categoryName)
  if (category) {
    if (mongoose.Types.ObjectId.isValid(category)) {
      searchQuery["category"] = new mongoose.Types.ObjectId(category);
    } else {
      // Tìm kiếm theo tên danh mục không phân biệt chữ hoa chữ thường
      searchQuery["categoryName"] = { $regex: new RegExp(category, "i") };
    }
  }

  // Truy vấn sách từ MongoDB
  const result = await Book.aggregate([
    {
      $match: searchQuery,
    },
    {
      $lookup: {
        from: "categories", // Liên kết với bảng categories để lấy tên danh mục
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
        categoryName: "$category.categoryName", // Lấy tên danh mục từ bảng categories
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
        discountRate: 1,
        discountedPrice: 1,
        publicationDate: 1,
        description: 1,
        img: 1,
        categoryName: "$category.categoryName",
        category: "$category.category",
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
    const discountedPrice = (
      originalPrice -
      (originalPrice * discountRate) / 100
    ).toFixed(2);
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

// Get discounted books
bookController.getDiscountedBooks = catchAsync(async (req, res, next) => {
  const discountedBooks = await Book.find({
    discountRate: { $gt: 0 },
    isDeleted: false,
  });

  if (!discountedBooks || discountedBooks.length === 0) {
    throw new AppError(StatusCodes.NOT_FOUND, "No discounted books found");
  }

  sendResponse(
    res,
    StatusCodes.OK,
    true,
    discountedBooks,
    null,
    "Discounted books retrieved successfully"
  );
});

// Get newly released books
bookController.getNewlyReleasedBooks = catchAsync(async (req, res) => {
  const books = await Book.find({ isDeleted: false }).sort({
    publicationDate: -1,
  });

  if (books.length === 0) {
    throw new AppError(StatusCodes.NOT_FOUND, "No newly released books found.");
  }

  sendResponse(
    res,
    StatusCodes.OK,
    true,
    books,
    null,
    "Newly released books retrieved successfully"
  );
});

bookController.getBooksByCategoryId = catchAsync(async (req, res) => {
  const { categoryId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(categoryId)) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Invalid categoryId.",
      "Get Books by Category Error"
    );
  }

  const books = await Book.find({ category: categoryId, isDeleted: false });

  if (!books || books.length === 0) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      "No books found in this category.",
      "Get Books by Category Error"
    );
  }

  sendResponse(
    res,
    StatusCodes.OK,
    true,
    books,
    null,
    "Books retrieved successfully"
  );
});

bookController.getCategoryOfBooks = catchAsync(async (req, res) => {
  const books = await Book.find();

  const categories = {};

  books.forEach((book) => {
    const categoryId = book.category.toString();
    const categoryName = book.categoryName;

    if (!categories[categoryId]) {
      categories[categoryId] = {
        id: categoryId,
        name: categoryName,
        count: 0,
        sampleBookImage: book.img || null,
      };
    }
    categories[categoryId].count += 1;
  });

  const categoriesArray = Object.values(categories);

  res.status(200).json({
    status: "success",
    data: {
      categories: categoriesArray,
    },
  });
});

bookController.getBooksByIds = async (req, res, next) => {
  try {
    let { bookIds } = req.body;

    if (!bookIds || !Array.isArray(bookIds)) {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        "Invalid input: bookIds must be an array",
        "Get Books by IDs Error"
      );
    }

    bookIds = bookIds.filter((id) => id);

    if (bookIds.length === 0) {
      return sendResponse(
        res,
        StatusCodes.OK,
        true,
        [],
        null,
        "No valid book IDs provided"
      );
    }

    const books = await Book.find({ _id: { $in: bookIds }, isDeleted: false });

    return sendResponse(
      res,
      StatusCodes.OK,
      true,
      books,
      null,
      "Books retrieved successfully"
    );
  } catch (error) {
    next(error);
  }
};

bookController.getBooksByCartIds = catchAsync(async (req, res, next) => {
  const { bookIds } = req.body;

  if (!bookIds || !Array.isArray(bookIds)) {
    throw new AppError(400, "Invalid book IDs", "Get Books by Cart IDs Error");
  }

  const books = await Book.find({ _id: { $in: bookIds } });

  return sendResponse(
    res,
    200,
    true,
    books,
    null,
    "Books fetched successfully"
  );
});

module.exports = bookController;
