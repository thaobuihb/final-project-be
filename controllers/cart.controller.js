const Cart = require("../models/Cart");
const Book = require("../models/Book");
const { sendResponse, catchAsync, AppError } = require("../helpers/utils");
const { StatusCodes } = require("http-status-codes");
const validators = require("../middlewares/validators");

const cartController = {};

// Add or update a book to the cart
cartController.addOrUpdateBookInCart = catchAsync(async (req, res) => {
  const userId = req.userId;
  const { bookId, quantity } = req.body;
  validators.checkObjectId(userId, bookId)

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

  const originalPrice = book.price;
  const discountPrice = book.discountedPrice || originalPrice;
  
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
            name, 
            quantity: parseInt(quantity),
            originalPrice,
            discountPrice, 
            discountRate, 
            totalPrice: parseFloat(discountPrice) * parseInt(quantity), 
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

    cart.books = cart.books.map((bookItem) => {
      if (bookItem.bookId.toString() === bookId) {
        if (parseInt(quantity) === 0) {
          return null; 
        } else {
          bookExists = true;
          return {
            ...bookItem,
            name, 
            quantity: parseInt(quantity),
            discountPrice, 
            discountRate, 
            totalPrice: parseFloat(discountPrice) * parseInt(quantity), 
          };
        }
      }
      return bookItem;
    });

    cart.books = cart.books.filter((book) => book !== null);

    if (!bookExists && parseInt(quantity) > 0) {
      cart.books.push({
        bookId,
        name, 
        quantity: parseInt(quantity),
        originalPrice,
        discountPrice, 
        discountRate,  
        totalPrice: parseFloat(discountPrice) * parseInt(quantity), 
      });
    }
  }

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
  validators.checkObjectId(userId)

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
  validators.checkObjectId(userId)

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
