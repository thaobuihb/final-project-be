const Book = require("../models/Book");
const Wishlist = require("../models/Wishlist");
const { sendResponse, catchAsync, AppError } = require("../helpers/utils");
const { StatusCodes } = require("http-status-codes");

const wishlistController = {};

// 1. Add a book to the wishlist (for guest or logged-in users)
wishlistController.addToWishlist = catchAsync(async (req, res, next) => {
  const { userId, bookId } = req.body;

  let wishlist = await Wishlist.findOne({ userId });

  if (!wishlist) {
    wishlist = new Wishlist({ userId, books: [] });
  }

  const bookExists = wishlist.books.some((item) => item.bookId.toString() === bookId);

  if (bookExists) {
    return sendResponse(res, StatusCodes.OK, false, null, "Sách đã có trong danh sách yêu thích");
  }

  const book = await Book.findById(bookId);

  if (!book) {
    return sendResponse(res, StatusCodes.NOT_FOUND, false, null, "Không tìm thấy cuốn sách này");
  }

  wishlist.books.push({
    bookId: book._id.toString(),
    name: book.name,
    price: book.price,
    discountedPrice: book.discountedPrice,
    img: book.img,
  });

  await wishlist.save();

  return sendResponse(res, StatusCodes.OK, true, wishlist.books, null, "Đã thêm sách vào wishlist");
});

// 2. Remove a book from the wishlist (for guest or logged-in users)
wishlistController.removeFromWishlist = catchAsync(async (req, res, next) => {
  const { userId } = req.body;
  const { guestId } = req;
  const { bookId } = req.body;

  console.log("Received userId:", userId);
  console.log("Received bookId:", bookId);


  const filter = userId ? { userId } : { guestId };

  const wishlist = await Wishlist.findOne( filter );

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
  const userId = req.user ? req.user._id : null;
  const { guestId } = req;
  
  
  const filter = userId ? { userId } : { guestId };
  const wishlist = await Wishlist.findOne(filter).populate("books.bookId");

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
    {books: wishlist.books,
      userId: wishlist.userId},
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
