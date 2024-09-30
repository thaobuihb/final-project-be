const Category = require("../models/Category");
const Book = require("../models/Book");
const { sendResponse, catchAsync, AppError } = require("../helpers/utils");
const { StatusCodes } = require("http-status-codes");


const categoryController = {};

categoryController.createCategory = catchAsync(async (req, res, next) => {
  if (Array.isArray(req.body)) {
    const categoriesData = req.body;

    const createdCategories = [];

    for (const categoryData of categoriesData) {
      const { categoryName, description } = categoryData;

      const category = await Category.create({ categoryName, description });

      createdCategories.push(category);
    }

    sendResponse(
      res,
      StatusCodes.CREATED,
      true,
      createdCategories,
      null,
      "Categories created successfully"
    );
  } else {
    const { categoryName, description } = req.body;

    const category = await Category.create({ categoryName, description });

    sendResponse(
      res,
      StatusCodes.CREATED,
      true,
      category,
      null,
      "Category created successfully"
    );
  }
});

categoryController.getAllCategories = catchAsync(async (req, res, next) => {
  const categories = await Category.find({ isDeleted: false });

  sendResponse(
    res,
    StatusCodes.OK,
    true,
    categories,
    null,
    "Categories retrieved successfully"
  );
});

categoryController.getCategoryById = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { page = 1, limit = 10, search, minPrice, maxPrice } = req.query;
  
  const category = await Category.findById({ _id: id, isDeleted: false });
  console.log("Category found:", category);

  if (!category) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      "Category not found",
      "Category Error"
    );
  }

  let searchQuery = {
    categoryId: category._id,
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

  const totalBooks = await Book.countDocuments(searchQuery);
  const totalPages = Math.ceil(totalBooks / limit);

  const skipItems = (page - 1) * limit;

  const books = await Book.find(searchQuery)
    .skip(skipItems)
    .limit(limit)
    .select("-isDeleted");

  const response = {
    category,
    books,
    totalPages,
    currentPage: page,
    totalBooks,
  };

  sendResponse(
    res,
    StatusCodes.OK,
    true,
    response,
    null,
    "Category and books retrieved successfully"
  );
});

categoryController.updateCategory = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { categoryName, description, createdAt, updatedAt } = req.body;

  const category = await Category.findByIdAndUpdate(
    id,
    { categoryName, description, createdAt, updatedAt, isDeleted: false },
    { new: true }
  );

  if (!category) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      "Category not found",
      "Category Error"
    );
  }

  sendResponse(
    res,
    StatusCodes.OK,
    true,
    category,
    null,
    "Category updated successfully"
  );
});

categoryController.deleteCategory = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const category = await Category.findOne({ _id: id, isDeleted: false });

  if (!category) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      "Category not found",
      "Category Error"
    );
  }
  category.isDeleted = true;
  await category.save();

  sendResponse(
    res,
    StatusCodes.OK,
    true,
    null,
    null,
    "Category deleted successfully"
  );
});

categoryController.getPopularCategories = catchAsync(async (req, res, next) => {
  const popularCategories = await Category.aggregate([
      {
          $lookup: {
              from: 'books', // Tên collection sách
              localField: '_id', // Trường ID của danh mục
              foreignField: 'categoryId', // Trường ID danh mục trong sách
              as: 'books' // Kết quả sẽ được lưu vào biến 'books'
          }
      },
      {
          $project: {
              name: 1, // Lấy trường tên danh mục
              bookCount: { $size: '$books' }, // Đếm số sách trong danh mục
              representativeBook: { $arrayElemAt: ['$books.img', 0] } // Lấy ảnh của cuốn sách đầu tiên làm đại diện
          }
      },
      {
          $sort: { bookCount: -1 } // Sắp xếp theo số lượng sách giảm dần
      },
      {
          $limit: 5 // Giới hạn số lượng danh mục phổ biến trả về
      }
  ]);

  // Nếu không tìm thấy danh mục nào
  if (!popularCategories || popularCategories.length === 0) {
      return next(new AppError(StatusCodes.NOT_FOUND, "No popular categories found", "Category Error"));
  }

  // Gửi phản hồi
  sendResponse(
      res,
      StatusCodes.OK,
      true,
      popularCategories,
      null,
      "Popular categories retrieved successfully"
  );
});


module.exports = categoryController;
