const Book = require("../models/Book.js");
const Wishlist = require("../models/Wishlist.js");
const { sendResponse, catchAsync, AppError } = require("../helpers/utils");
const { StatusCodes } = require("http-status-codes");

const wishlistController = {};

wishlistController.createWishlist = catchAsync(async (req, res) => {
    const guestId = req.headers['x-guest-id'] || req.ip; 
    if (!guestId) {
      return sendResponse(
        res,
        StatusCodes.BAD_REQUEST,
        false,
        null,
        "Guest ID not provided",
        "Create Wishlist Failed"
      );
    }
  
    let wishlist = await Wishlist.findOne({ guestId });
  
    if (wishlist) {
      return sendResponse(
        res,
        StatusCodes.BAD_REQUEST,
        false,
        null,
        "Wishlist already exists",
        "Create Wishlist Failed"
      );
    }
  
    wishlist = new Wishlist({
      guestId, 
      books: [],
    });
  
    await wishlist.save();
    return sendResponse(
      res,
      StatusCodes.CREATED,
      true,
      wishlist,
      null,
      "Wishlist created successfully"
    );
  });

  wishlistController.addToWishlist = catchAsync(async (req, res) => {
    const guestId = req.headers['x-guest-id'] || req.ip; 
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
      wishlist = new Wishlist({
        guestId, 
        books: [],
      });
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
  

  wishlistController.addToWishlist = catchAsync(async (req, res) => {
    const guestId = req.headers['x-guest-id'] || req.ip; 
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
      wishlist = new Wishlist({
        guestId,
        books: [],
      });
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
  
    // Chỉ lấy thông tin sách từ danh sách wishlist
    const addedBook = wishlist.books.find((item) => item.bookId.toString() === bookId);
  
    return sendResponse(
      res,
      StatusCodes.OK,
      true,
      addedBook, 
      null,
      "Book added to wishlist successfully"
    );
  });

  wishlistController.getWishlist = catchAsync(async (req, res) => {
    const guestId = req.headers['x-guest-id'] || req.ip; 
  
    if (!guestId) {
      return sendResponse(
        res,
        StatusCodes.BAD_REQUEST,
        false,
        null,
        "Guest ID not provided",
        "Get Wishlist Failed"
      );
    }
  
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
  

  wishlistController.removeFromWishlist = catchAsync(async (req, res) => {
    const guestId = req.headers['x-guest-id'] || req.ip;
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

  module.exports = wishlistController;