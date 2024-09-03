const Book = require("../models/Book.js");
const Review = require("../models/Review.js");
const { sendResponse, catchAsync, AppError } = require("../helpers/utils");
const mongoose = require("mongoose");
const { ObjectId } = require("mongoose").Types;
const { StatusCodes } = require("http-status-codes");
const bookController = {};

//create book
bookController.createBook = catchAsync(async (req, res, next) => {
  const { name, author, price, publicationDate, img, description, category } =
    req.body;
  if (!name || !author || !price || !publicationDate || !img || !description) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Missing required fields", "Create Book Error");
  }

  const book = await Book.create({
    name,
    author,
    price,
    publicationDate,
    img,
    description,
    category,
  });

  sendResponse(
    res,
    StatusCodes.OK,
    true,
    book,
    null,
    "Create new book successful"
  );
});

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
        { categories: { $regex: new RegExp(search, "i") } },
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
        from: "bookcategories",
        let: { bookId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$$bookId", "$bookId"] },
            },
          },
          {
            $lookup: {
              from: "categories",
              localField: "categoryId",
              foreignField: "_id",
              as: "category",
            },
          },
          {
            $unwind: "$category",
          },
          {
            $project: {
              _id: 0,
              categoryName: "$category.categoryName",
            },
          },
        ],
        as: "categories",
      },
    },
    {
      $project: {
        name: 1,
        author: 1,
        price: 1,
        publicationDate: 1,
        img: 1,
        description: 1,
        categories: "$categories.categoryName",
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
  const bookId = req.params.id;

  const [book] = await Book.aggregate([
    {
      $match: { _id: new mongoose.Types.ObjectId(bookId), isDeleted: false },
    },
    {
      $lookup: {
        from: "bookcategories",
        let: { bookId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$$bookId", "$bookId"] },
              isDelete: false,
            },
          },
          {
            $lookup: {
              from: "categories",
              localField: "categoryId",
              foreignField: "_id",
              as: "category",
            },
          },
          {
            $unwind: "$category",
          },
          {
            $project: {
              _id: 0,
              categoryName: "$category.categoryName",
            },
          },
        ],
        as: "categories",
      },
    },
    {
      $project: {
        name: 1,
        author: 1,
        price: 1,
        publicationDate: 1,
        description: 1,
        img: 1,
        categories: "$categories.categoryName",
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

  sendResponse(res, StatusCodes.OK, true, book, null, "Book retrieved successfully");
});

//Update a book
bookController.updateBook = catchAsync(async (req, res, next) => {
  const bookId = req.params.id;
  const updateData = req.body;

  const book = await Book.findByIdAndUpdate(
    bookId,
    { $set: { isDeleted: false, ...updateData } },
    { new: true }
  );
  if (!book) {
    throw new AppError(StatusCodes.NOT_FOUND, "Book not found", "Update Book Error");
  }
  sendResponse(res, StatusCodes.OK, true, book, null, "Book updated successfully");
});

//Create or update discounted information for book
bookController.discountBook = catchAsync(async (req, res, next) => {
  const { bookId, discountRate } = req.body;

  // Validate required fields
  if (!bookId || discountRate == null) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Missing required fields", "Discount Book Error");
  }

  // Find book by ID
  const book = await Book.findById(bookId);
  if (!book) {
    throw new AppError(StatusCodes.NOT_FOUND, "Book not found", "Discount Book Error");
  }

  // Calculate discounted price
  const discountedPrice = book.price - (book.price * discountRate) / 100;

  // Update discount details
  book.discountRate = discountRate;
  book.discountedPrice = discountedPrice;

  // Save the book with discount
  await book.save();

  sendResponse(res, StatusCodes.OK, true, book, null, "Discount applied successfully");
});

//Delete discounted information of a book

bookController.deleteDiscountBook = catchAsync(async (req, res, next) => {
  const { bookId } = req.params;

  const book = await Book.findById(bookId);
  if (!book) {
    throw new AppError(StatusCodes.NOT_FOUND, "Book not found", "Delete Discount Error");
  }

  // Reset discount-related fields
  book.discountRate = 0;
  book.discountedPrice = null;

  await book.save();

  sendResponse(res, StatusCodes.OK, true, null, null, "Discount removed successfully");
});

//Get all discounted books
bookController.getDiscountBook = catchAsync(async (req, res, next) => {
  try {
    // Thực hiện truy vấn để lấy các sách giảm giá
    const discountedBooks = await Book.aggregate([
      {
        $match: {
          discount: { $gt: 0 }, // Lọc những sách có giảm giá
          isDeleted: false, 
        },
      },
      {
        $lookup: {
          from: "categories", // Kết nối với bảng bookcategories
          let: { bookId: "$_id" }, // Sử dụng bookId trong lookup
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$$bookId", "$bookId"],
                },
              },
            },
            {
              $lookup: {
                from: "categories", // Kết nối với bảng categories
                localField: "categoryId", // Dùng categoryId trong bookcategories
                foreignField: "_id", // Nối với _id trong bảng categories
                as: "category", // Lưu vào biến category
              },
            },
            {
              $unwind: "$category", // Tách mảng category thành các đối tượng riêng biệt
            },
            {
              $project: {
                _id: 0,
                categoryName: "$category.categoryName", // Chỉ lấy tên category
              },
            },
          ],
          as: "categories", // Lưu mảng categories vào đối tượng sách
        },
      },
      {
        $project: {
          name: 1,
          author: 1,
          price: 1,
          discount: 1,
          description: 1,
          img: 1,
          categories: "$categories.categoryName", // Hiển thị category name thay vì đối tượng category
        },
      },
    ]);

    // Kiểm tra nếu không tìm thấy sách giảm giá nào
    if (!discountedBooks || discountedBooks.length === 0) {
      throw new AppError(
        StatusCodes.NOT_FOUND,
        "No discounted books found",
        "Get Discounted Books Error"
      );
    }

    // Gửi kết quả về client
    sendResponse(
      res,
      StatusCodes.OK,
      true,
      discountedBooks,
      null,
      "Discounted books retrieved successfully"
    );
  } catch (error) {
    // Xử lý lỗi khi giá trị _id không hợp lệ hoặc các lỗi khác
    if (
      error instanceof mongoose.Error.CastError &&
      error.kind === "ObjectId"
    ) {
      next(
        new AppError(
          StatusCodes.BAD_REQUEST,
          "Invalid ObjectId format",
          "Get Discounted Books Error"
        )
      );
    } else {
      next(error);
    }
  }
});

//Delete a book
bookController.deleteBook = catchAsync(async (req, res, next) => {
  const bookId = req.params.id;

  const book = await Book.findOne({ _id: bookId, isDeleted: false });

  if (!book) {
    throw new AppError(StatusCodes.NOT_FOUND, "Book not found", "Delete Book Error");
  }

  book.isDeleted = true;
  await book.save();

  sendResponse(res, StatusCodes.OK, true, null, null, "Book deleted successfully");
});

module.exports = bookController;
