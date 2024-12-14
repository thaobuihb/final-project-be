const Cart = require("../models/Cart");
const Book = require("../models/Book");
const { sendResponse, catchAsync, AppError } = require("../helpers/utils");
const { StatusCodes } = require("http-status-codes");

const cartController = {};

// Helper function to calculate book details
const calculateBookDetails = (book, quantity) => {
  const originalPrice = book.price;
  const discountPrice = book.discountedPrice || originalPrice;
  const discountRate = book.discountRate
    ? ((originalPrice - book.discountedPrice) / originalPrice) * 100
    : 0;

  const totalPrice = parseFloat(discountPrice) * parseInt(quantity);
  return { originalPrice, discountPrice, discountRate, totalPrice };
};

// Add or update a book in the cart
cartController.addOrUpdateBookInCart = catchAsync(async (req, res) => {
  const userId = req.body.userId || req.userId;
  const { bookId, quantity, price } = req.body;

  if (!userId) {
    return sendResponse(
      res,
      StatusCodes.BAD_REQUEST,
      false,
      null,
      "User ID is required",
      "Cart update failed"
    );
  }

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

  if (!price) {
    return sendResponse(
      res,
      StatusCodes.BAD_REQUEST,
      false,
      null,
      "Price is required",
      "Cart update failed"
    );
  }

  let userCart = await Cart.findOne({ userId });

  if (!userCart) {
    // Nếu giỏ hàng chưa tồn tại, tạo giỏ hàng mới
    userCart = new Cart({
      userId,
      books: [{ bookId, quantity, price }],
    });
  } else {

    // console.log("Updating existing cart for user:", userId);

    // Nếu giỏ hàng đã tồn tại, kiểm tra và thêm hoặc cập nhật sách
    const existingItem = userCart.books.find(item => item.bookId?.toString() === bookId.toString());
    // console.log("Existing item in cart:", existingItem);



    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      userCart.books.push({ bookId, quantity, price });
    }
  }

  userCart.totalPrice = userCart.books.reduce((total, bookItem) => total + bookItem.price * bookItem.quantity, 0);
  
  await userCart.save();

  return sendResponse(
    res,
    StatusCodes.OK,
    true,
    userCart.books,
    null,
    "Cart updated successfully"
  );
});

// Remove a book from the cart
cartController.removeBookFromCart = catchAsync(async (req, res) => {
  const userId = req.userId;
  const { bookId } = req.body;

  let cart = await Cart.findOne({ userId });
  if (!cart) {
    return sendResponse(
      res,
      StatusCodes.NOT_FOUND,
      false,
      null,
      "Cart not found",
      "Remove book failed"
    );
  }

  cart.books = cart.books.filter(
    (bookItem) => bookItem.bookId.toString() !== bookId
  );
  cart.totalPrice = cart.books.reduce(
    (total, bookItem) => total + bookItem.totalPrice,
    0
  );

  await cart.save();
  return sendResponse(
    res,
    StatusCodes.OK,
    true,
    cart,
    null,
    "Book removed from cart successfully"
  );
});

// Clear the cart
cartController.clearCart = catchAsync(async (req, res) => {
  const userId = req.userId;

  if (!userId) {
    return sendResponse(
      res,
      StatusCodes.BAD_REQUEST,
      false,
      null,
      "User ID is required",
      "Clear cart failed"
    );
  }

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
  const userId = req.userId;
  const cart = await Cart.findOne({ userId }).populate("books.bookId");

  if (!cart) {
    throw new AppError(StatusCodes.NOT_FOUND, "Cart not found");
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

cartController.syncCartAfterLogin = catchAsync(async (req, res) => {
  const { userId, cart } = req.body;

  // Tìm giỏ hàng hiện tại của người dùng
  let userCart = await Cart.findOne({ userId });

  if (!userCart) {
    // Nếu giỏ hàng không tồn tại, tạo giỏ hàng mới từ local cart
    userCart = new Cart({
      userId,
      books: cart.map((item) => ({
        bookId: item.bookId,
        quantity: item.quantity,
        price: item.price,
      })),
    });
  } else {
    // Nếu giỏ hàng đã tồn tại, cập nhật từng sách
    cart.forEach((localItem) => {
      const existingItem = userCart.books.find(
        (item) => item.bookId.toString() === localItem.bookId
      );

      if (existingItem) {
        // Nếu sách đã có trong giỏ, tăng số lượng
        existingItem.quantity += localItem.quantity;
      } else {
        // Nếu sách chưa có, thêm vào giỏ hàng
        userCart.books.push({
          bookId: localItem.bookId,
          quantity: localItem.quantity,
          price: localItem.price,
        });
      }
    });
  }

  // Tính toán tổng giá trị của giỏ hàng
  userCart.totalPrice = userCart.books.reduce(
    (total, bookItem) => total + bookItem.price * bookItem.quantity,
    0
  );

  await userCart.save();

  return sendResponse(
    res,
    StatusCodes.OK,
    true,
    userCart.books,
    null,
    "Cart synced successfully after login"
  );
});


// Update the quantity of a book in the cart
cartController.updateBookQuantity = catchAsync(async (req, res) => {
  const userId = req.userId;
  const { bookId, quantity } = req.body;

  if (quantity < 1) {
    return sendResponse(
      res,
      StatusCodes.BAD_REQUEST,
      false,
      null,
      "Quantity must be at least 1",
      "Update quantity failed"
    );
  }

  let cart = await Cart.findOne({ userId });
  if (!cart) {
    return sendResponse(
      res,
      StatusCodes.NOT_FOUND,
      false,
      null,
      "Cart not found",
      "Update quantity failed"
    );
  }

  const bookIndex = cart.books.findIndex(
    (item) => item.bookId.toString() === bookId.toString()
  );

  if (bookIndex === -1) {
    return sendResponse(
      res,
      StatusCodes.NOT_FOUND,
      false,
      null,
      "Book not found in cart",
      "Update quantity failed"
    );
  }

  cart.books[bookIndex].quantity = quantity;

  cart.totalPrice = cart.books.reduce(
    (total, bookItem) => total + bookItem.price * bookItem.quantity,
    0
  );

  await cart.save();

  return sendResponse(
    res,
    StatusCodes.OK,
    true,
    cart,
    null,
    "Quantity updated successfully"
  );
});

cartController.removeBookFromCart = catchAsync(async (req, res) => {
  const userId = req.userId;
  const { bookId } = req.body;

  let cart = await Cart.findOne({ userId });
  if (!cart) {
    return sendResponse(
      res,
      StatusCodes.NOT_FOUND,
      false,
      null,
      "Cart not found",
      "Remove book failed"
    );
  }

  cart.books = cart.books.filter(
    (bookItem) => bookItem.bookId.toString() !== bookId
  );

  cart.totalPrice = cart.books.reduce(
    (total, bookItem) => total + bookItem.price * bookItem.quantity,
    0
  );

  await cart.save();

  return sendResponse(
    res,
    StatusCodes.OK,
    true,
    cart,
    null,
    "Book removed from cart successfully"
  );
});



module.exports = cartController;
