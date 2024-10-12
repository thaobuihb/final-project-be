const Book = require("../models/Book");
const Wishlist = require("../models/Wishlist");
const { sendResponse, catchAsync, AppError } = require("../helpers/utils");
const { StatusCodes } = require("http-status-codes");

const wishlistController = {};

// 1. Add a book to the wishlist (for guest or logged-in users)
wishlistController.addToWishlist = catchAsync(async (req, res, next) => {
  const { guestId } = req;  
  const { bookId } = req.body;

  const book = await Book.findById(bookId);
  if (!book) {
    return sendResponse(
      res,
      StatusCodes.NOT_FOUND,
      false,
      null,
      "Book not found",
      "Add to Wishlist Failed"
    );
  }

  let wishlist = await Wishlist.findOne({ guestId });

  if (!wishlist) {
    wishlist = new Wishlist({ guestId, books: [] });
  }

  const bookExists = wishlist.books.some(
    (item) => item.bookId.toString() === bookId
  );

  if (bookExists) {
    return sendResponse(
      res,
      StatusCodes.BAD_REQUEST,
      false,
      null,
      "Book already in wishlist",
      "Add to Wishlist Failed"
    );
  }

  wishlist.books.push({
    bookId,
    name: book.name,
    price: book.price,
    discountedPrice: book.discounted_price,
    img: book.img,
  });

  await wishlist.save();

  return sendResponse(
    res,
    StatusCodes.OK,
    true,
    wishlist,
    null,
    "Book added to wishlist successfully"
  );
});

// 2. Remove a book from the wishlist (for guest or logged-in users)
wishlistController.removeFromWishlist = catchAsync(async (req, res, next) => {
  const { guestId } = req;
  const { bookId } = req.body;

  const wishlist = await Wishlist.findOne({ guestId });

  if (!wishlist) {
    return sendResponse(
      res,
      StatusCodes.NOT_FOUND,
      false,
      null,
      "Wishlist not found",
      "Remove from Wishlist Failed"
    );
  }

  wishlist.books = wishlist.books.filter(
    (bookItem) => bookItem.bookId.toString() !== bookId
  );

  await wishlist.save();

  return sendResponse(
    res,
    StatusCodes.OK,
    true,
    null,
    "Book removed from wishlist successfully"
  );
});

// 3. Get the wishlist for a guest (using guestId) or logged-in user
wishlistController.getWishlist = catchAsync(async (req, res, next) => {
  const { guestId } = req;

  const wishlist = await Wishlist.findOne({ guestId }).populate("books.bookId");

  if (!wishlist) {
    return sendResponse(
      res,
      StatusCodes.NOT_FOUND,
      false,
      null,
      "Wishlist not found",
      "Get Wishlist Failed"
    );
  }

  const formattedBooks = wishlist.books.map((item) => ({
    bookId: item.bookId._id,
    name: item.bookId.name,
    img: item.bookId.img,
    price: item.bookId.price,
    discountedPrice: item.bookId.discountedPrice,
  }));

  return sendResponse(
    res,
    StatusCodes.OK,
    true,
    formattedBooks,
    null,
    "Get wishlist successful"
  );
});

// 4. Sync wishlist after user logs in (sync between localStorage and server)
wishlistController.syncWishlist = catchAsync(async (req, res, next) => {
  // localWishList is list of book ids stored in localStorage
  const { userId, localWishlist } = req.body;

  let wishlist = await Wishlist.findOne({ userId });

  if (!wishlist) {
    wishlist = new Wishlist({ userId, books: [] });
  }

  // Filter book ids that not existed in wished list
  const newBookIdsToWishedList = localWishlist.filter(
    (localBookIds) => !wishlist.books.some((item) => item.bookId.toString() === localBookIds)
  );

  // Find books with given ids from the above filter
  await Book.find({ _id: { $in: newBookIdsToWishedList } })
  .then(newWishedBooks => {
    // Map through the result to transform the _id to bookId and make it a string
    const transformedBooks = newWishedBooks.map(book => ({
      ...book.toObject(),  // Convert Mongoose document to a plain JavaScript object
      bookId: book._id.toString(),  // Replace _id with bookId as a string
      _id: undefined  // Optionally remove the original _id field
    }));

    transformedBooks.forEach(book => {
      wishlist.books.push({
        bookId: book.bookId,
        name: book.name,
        price: book.price,
        discountedPrice: book.discountedPrice,
        img: book.img,
      });
    });
  })
  .catch(err => {
    console.error(err);
  });

  await wishlist.save();

  return sendResponse(
    res,
    StatusCodes.OK,
    true,
    wishlist.books,
    null,
    "Wishlist synced successfully"
  );
});



// 5. Get wishlist by userId (for logged-in users)
wishlistController.getWishlistByUserId = catchAsync(async (req, res, next) => {
  const { userId } = req.params;

  const wishlist = await Wishlist.findOne({ userId }).populate("books.bookId");

  if (!wishlist) {
    return sendResponse(
      res,
      StatusCodes.NOT_FOUND,
      false,
      null,
      "Wishlist not found",
      "Get Wishlist Failed"
    );
  }

  const formattedBooks = wishlist.books.map((item) => ({
    bookId: item.bookId._id,
    name: item.bookId.name,
    img: item.bookId.img,
    price: item.bookId.price,
    discountedPrice: item.bookId.discountedPrice,
  }));

  return sendResponse(
    res,
    StatusCodes.OK,
    true,
    formattedBooks,
    null,
    "Get wishlist by userId successful"
  );
});

module.exports = wishlistController;
