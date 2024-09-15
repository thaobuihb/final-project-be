const Cart = require("../models/Cart");
const Book = require("../models/Book");
const { sendResponse, catchAsync, AppError } = require("../helpers/utils");
const { StatusCodes } = require("http-status-codes");

const cartController = {};

// Add or update a book to the cart
cartController.addOrUpdateBookInCart = catchAsync(async (req, res) => {
  const userId = req.userId;
  const { bookId, quantity } = req.body;

  if (!bookId) {
    return sendResponse(
      res,
      StatusCodes.BAD_REQUEST,
      false,
      null,
      "Book ID is required",
      "Cart update failed"
    );
  }

  // Tìm sách theo ID
  const book = await Book.findById(bookId);
  if (!book) {
    return sendResponse(
      res,
      StatusCodes.NOT_FOUND,
      false,
      null,
      "Book not found",
      "Cart update failed"
    );
  }

  // Giá gốc và giá giảm (nếu có)
  const originalPrice = book.price;
  const discountPrice = book.discountedPrice || originalPrice;
  
  // Tính discountRate (mức giảm giá)
  const discountRate = book.discountRate
    ? ((originalPrice - book.discountedPrice) / originalPrice) * 100 
    : 0;

  const name = book.name;

  let cart = await Cart.findOne({ userId });

  if (!cart) {
    if (quantity > 0) {
      cart = new Cart({
        userId,
        books: [
          {
            bookId,
            name, // Thêm tên sách vào
            quantity: parseInt(quantity),
            originalPrice,
            discountPrice, // Giá đã giảm (nếu có)
            discountRate,  // Ghi giảm giá = 0 nếu không có
            totalPrice: parseFloat(discountPrice) * parseInt(quantity), // Tổng tiền theo giá đã giảm
          },
        ],
      });
    } else {
      return sendResponse(
        res,
        StatusCodes.BAD_REQUEST,
        false,
        null,
        "Cannot add a book with quantity 0",
        "Cart update failed"
      );
    }
  } else {
    let bookExists = false;

    // Cập nhật nếu sách đã có trong giỏ hàng
    cart.books = cart.books.map((bookItem) => {
      if (bookItem.bookId.toString() === bookId) {
        if (parseInt(quantity) === 0) {
          return null; // Xóa sách nếu số lượng bằng 0
        } else {
          bookExists = true;
          return {
            ...bookItem,
            name, // Đảm bảo tên sách được cập nhật
            quantity: parseInt(quantity),
            discountPrice, // Cập nhật giá đã giảm
            discountRate,  // Cập nhật giảm giá
            totalPrice: parseFloat(discountPrice) * parseInt(quantity), // Tính tổng tiền
          };
        }
      }
      return bookItem;
    });

    // Xóa sách có số lượng bằng 0
    cart.books = cart.books.filter((book) => book !== null);

    // Thêm sách mới nếu chưa tồn tại trong giỏ hàng
    if (!bookExists && parseInt(quantity) > 0) {
      cart.books.push({
        bookId,
        name, // Thêm tên sách vào
        quantity: parseInt(quantity),
        originalPrice,
        discountPrice, // Giá đã giảm (nếu có)
        discountRate,  // Ghi giảm giá = 0 nếu không có
        totalPrice: parseFloat(discountPrice) * parseInt(quantity), // Tính tổng tiền
      });
    }
  }

  // Cập nhật tổng tiền giỏ hàng
  cart.totalPrice = cart.books.reduce((total, bookItem) => {
    return total + bookItem.totalPrice;
  }, 0);

  await cart.save();
  return sendResponse(
    res,
    StatusCodes.OK,
    true,
    cart,
    null,
    "Cart updated successfully"
  );
});

//Delete cart
cartController.clearCart = catchAsync(async (req, res) => {
  const { userId } = req.params;

  let cart = await Cart.findOne({ userId });

  if (!cart) {
    return sendResponse(
      res,
      StatusCodes.NOT_FOUND,
      false,
      null,
      "Cart not found",
      "Clear cart failed"
    );
  }

  cart.books = [];
  cart.totalPrice = 0;

  await cart.save();

  return sendResponse(
    res,
    StatusCodes.OK,
    true,
    null,
    null,
    "Cart cleared successfully"
  );
});

// Get the user's cart
cartController.getCart = catchAsync(async (req, res) => {
  const { userId } = req.params;

  const cart = await Cart.findOne({ userId }).populate("books.bookId");

  if (!cart) {
    throw new AppError("Cart not found", StatusCodes.NOT_FOUND);
  }

  return sendResponse(
    res,
    StatusCodes.OK,
    true,
    cart.books,
    null,
    "Cart retrieved successfully"
  );
});

module.exports = cartController;
