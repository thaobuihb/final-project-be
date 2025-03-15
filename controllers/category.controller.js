const Category = require("../models/Category");
const Book = require("../models/Book");
const { sendResponse, catchAsync, AppError } = require("../helpers/utils");
const { StatusCodes } = require("http-status-codes");


const categoryController = {};

categoryController.createCategory = async (req, res, next) => {
  try {
    console.log("📩 Dữ liệu nhận được từ client:", req.body);
    const { categoryName, description } = req.body;

    if (!categoryName || categoryName.trim() === "") {
      const error = new Error("Tên danh mục không được để trống!");
      error.statusCode = 400;
      return next(error); // Đẩy lỗi vào middleware lỗi
    }

    // Kiểm tra trùng lặp danh mục
    const existingCategory = await Category.findOne({
      categoryName: { $regex: `^${categoryName.trim()}$`, $options: "i" },
    });

    if (existingCategory) {
      console.error("❌ Backend: Danh mục đã tồn tại");
      return res.status(400).json({ success: false, message: "Tên danh mục đã tồn tại!" });
    }    

    // Nếu không trùng, thêm danh mục mới
    const newCategory = new Category({
      categoryName: categoryName.trim(),
      description,
    });

    await newCategory.save();
    return res.status(201).json({ success: true, data: newCategory });
  } catch (error) {
    next(error); // Đảm bảo lỗi được đẩy vào middleware lỗi
  }
};




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
    throw new AppError(StatusCodes.NOT_FOUND, "Category not found", "Delete Category Error");
  }

  category.isDeleted = true;
  await category.save();

  await Book.updateMany(
    { category: id },
    { $unset: { category: "", categoryName: "" } } 
  );

  sendResponse(
    res,
    StatusCodes.OK,
    true,
    null,
    null,
    "Category deleted and related books updated successfully"
  );
});


categoryController.getPopularCategories = catchAsync(async (req, res, next) => {
  const popularCategories = await Category.aggregate([
      {
          $lookup: {
              from: 'books', 
              localField: '_id', 
              foreignField: 'categoryId', 
              as: 'books' 
          }
      },
      {
          $project: {
              name: 1, 
              bookCount: { $size: '$books' }, 
              representativeBook: { $arrayElemAt: ['$books.img', 0] } 
          }
      },
      {
          $sort: { bookCount: -1 } 
      },
      {
          $limit: 5 
      }
  ]);

  if (!popularCategories || popularCategories.length === 0) {
      return next(new AppError(StatusCodes.NOT_FOUND, "No popular categories found", "Category Error"));
  }

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
