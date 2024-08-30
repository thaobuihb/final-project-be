const Book = require("../models/Book.js");
const Review = require("../models/Review.js");
const { sendResponse, catchAsync, AppError } = require("../helpers/utils");
const mongoose = require("mongoose");
const bookController = {};

//create book
bookController.createBook = catchAsync(async (req, res, next) => {
  const { name, author, price, publicationDate, img, description } = req.body;
  if (!name || !author || !price || !publicationDate || !img || !description) {
    throw new AppError(400, "Missing required fields", "Create Book Error");
  }

  const book = await Book.create({
    name,
    author,
    price,
    publicationDate,
    img,
    description,
  });

  sendResponse(res, 200, true, book, null, "Create new book successful");
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
  
    sendResponse(res, 200, true, response, null, "Books retrieved successfully");
  });

// Get book by id
bookController.getlBookById = catchAsync(async (req, res, next) => {

});

// Search for books by name, author, genre, or other criteria
bookController.searchBook = catchAsync(async (req, res, next) => {});

//Filter books by various criteria
bookController.filterBook = catchAsync(async (req, res, next) => {});

//Update a book
bookController.updateBook = catchAsync(async (req, res, next) => {});

//Create or update discounted information for book
bookController.discountBook = catchAsync(async (req, res, next) => {});

//Update discounted information of a book
bookController.updateDiscountBookById = catchAsync(
  async (req, res, next) => {}
);

//Delete discounted information of a book
bookController.deleteDiscountBook = catchAsync(async (req, res, next) => {});

//Get all discounted books
bookController.getDiscountBook = catchAsync(async (req, res, next) => {});

//Delete a book
bookController.deleteBook = catchAsync(async (req, res, next) => {});

module.exports = bookController;
