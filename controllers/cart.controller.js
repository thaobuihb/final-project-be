const Cart = require("../models/Cart");
const { sendResponse, catchAsync, AppError } = require("../helpers/utils");

const cartController = {};

// Add a new book to the cart
cartController.addBookToCart = catchAsync(async (req, res) => {
  const { userId } = req.params;
  const { bookId, quantity, price } = req.body;

  if (!bookId || !quantity || !price) {
    return sendResponse(
      res,
      400,
      false,
      null,
      "Book ID, quantity, and price are required",
      "Add to cart failed"
    );
  }

  // Find or create a cart for the user
  let cart = await Cart.findOne({ userId });

  if (!cart) {
    cart = new Cart({
      userId,
      books: [
        { bookId, quantity: parseInt(quantity), price: parseFloat(price) },
      ],
    });
  } else {
    // Check if the book already exists in the cart
    const existingBookIndex = cart.books.findIndex(
      (book) => book.bookId.toString() === bookId
    );

    if (existingBookIndex >= 0) {
      // Update quantity if book already exists
      cart.books[existingBookIndex].quantity = parseInt(quantity);
      cart.books[existingBookIndex].price = parseFloat(price);
    } else {
      // Add new book to cart
      cart.books.push({
        bookId,
        quantity: parseInt(quantity),
        price: parseFloat(price),
      });
    }
  }

  await cart.save();

  return sendResponse(
    res,
    200,
    true,
    cart.books,
    null,
    "Book added to cart successfully"
  );
});

// Update the quantity of a book in the cart
cartController.updateBookQuantityInCart = catchAsync(async (req, res) => {
    const { userId } = req.params;
    const { bookId, quantity, price } = req.body;
  
    console.log("Request:", req.body);
  
    if (!bookId) {
      return sendResponse(
        res,
        400,
        false,
        null,
        "Book ID is required",
        "Cart update failed"
      );
    }
  
    let cart = await Cart.findOne({ userId });
    console.log(cart.books);
    if (!cart) {
      console.log("Creating new cart...");
  
      cart = new Cart({
        userId,
        books: [
          { bookId, quantity: parseInt(quantity), price: parseFloat(price) },
        ],
      });
    } else {
      console.log("Updating existing cart...");
  
      let bookExists = false;
  
      cart.books = cart.books.map((book) => {
        if (book.bookId === bookId) {
          if (parseInt(quantity) === 0) {
            return null;
          } else {
            bookExists = true;
            return {
              ...book,
              quantity: parseInt(quantity),
              price: parseFloat(price),
            };
          }
        }
        return book;
      });
  
      cart.books = cart.books.filter((book) => book !== null);
  
      if (!bookExists && parseInt(quantity) > 0) {
        cart.books.push({
          bookId,
          quantity: parseInt(quantity),
          price: parseFloat(price),
        });
      }
  
      await cart.save();
    }
  
    return sendResponse(res, 200, true, null, null, "Cart updated successfully");
});

// Get the user's cart
cartController.getCart = catchAsync(async (req, res) => {
  const { userId } = req.params;

  const cart = await Cart.findOne({ userId }).populate("books.bookId"); // Populate to get detailed book information

  if (!cart) {
    throw new AppError("Cart not found", 404);
  }

  return sendResponse(
    res,
    200,
    true,
    cart.books,
    null,
    "Cart retrieved successfully"
  );
});

// Remove a book from the cart
cartController.removeBookFromCart = catchAsync(async (req, res) => {
  const { id } = req.params; // Book ID
  const { userId } = req.query; // User ID from query parameters

  if (!userId) {
    return sendResponse(
      res,
      400,
      false,
      null,
      "User ID is required",
      "Removal failed"
    );
  }

  // Find the cart for the given userId
  let cart = await Cart.findOne({ userId });

  if (!cart) {
    throw new AppError("Cart not found", 404);
  }

  // Remove the book from the cart
  cart.books = cart.books.filter(
    (book) => book.bookId.toString() !== id
  );

  await cart.save();

  return sendResponse(
    res,
    200,
    true,
    cart.books,
    null,
    "Book removed from cart successfully"
  );
});

module.exports = cartController;
