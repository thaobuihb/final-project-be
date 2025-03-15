const express = require("express");
const router = express.Router();
const bookController = require("../controllers/book.controller");
const authentication = require("../middlewares/authentication");
const validators = require("../middlewares/validators");

// router.get(
//   "/admin/books",
//   authentication.loginRequired,
//   authentication.authorize(["admin"]),
//   bookController.getAdminBooks
// );

/**
 * @route POST /books/
 * @description Create a new book
 * @body { name, author, price, publicationDate }
 * @access admin
 */
router.post(
  "/",
  authentication.loginRequired,
  authentication.authorize(["admin"]),
  validators.validate(validators.createBookValidator),
  bookController.createBook
);

/**
 * @route GET /books
 * @description Get all books
 * @body none
 * @access Public
 */
router.get("/", bookController.getAllBooks);

router.get("/best-seller", bookController.getBestSellerBooks);

/**
 * @route GET /books/new-released
 * @description Get newly released books
 * @body none
 * @access Public
 */
router.get("/new-released", bookController.getNewlyReleasedBooks);

/**
 * @route GET /books/discounted
 * @description Get all discounted books
 * @body none
 * @access Public
 */
router.get("/discounted", bookController.getDiscountedBooks);

/**
 * @route GET /books/categories
 * @description Get list of book categories
 * @body none
 * @access Public
 */
router.get("/categories", bookController.getCategoryOfBooks);

/**
 * @route GET /books/:id
 * @description Get book by id
 * @body none
 * @access Public
 */
router.get(
  "/:id",
  validators.validateObjectId("id"),
  bookController.getBookById
);

/**
 * @route GET /books/category/:categoryId
 * @description Get books by categoryId
 * @body none
 * @access Public
 */
router.get("/category/:categoryId", bookController.getBooksByCategoryId);

/**
 * @route PUT /books/:id
 * @description Update a book
 * @body { name, author, price, publicationDate }
 * @access admin
 */
router.put(
  "/:id",
  authentication.loginRequired,
  authentication.authorize(["admin"]),
  validators.validateObjectId("id"),
  bookController.updateBook
);

/**
 * @route DELETE /books/:id
 * @description Delete a book
 * @body none
 * @access admin
 */
router.delete(
  "/:id",
  authentication.loginRequired,
  authentication.authorize(["admin"]),
  validators.validateObjectId("id"),
  bookController.deleteBook
);

/**
 * @route POST /books/wishlist
 * @description Get books by a list of IDs
 * @body { bookIds: [Array of book IDs] }
 * @access Public
 */
router.post("/wishlist", bookController.getBooksByIds);

/**
 * @route POST /books/carts
 * @description Get books by a list of IDs for cart
 * @body { bookIds: [Array of book IDs] }
 * @access Public
 */
router.post("/carts", bookController.getBooksByCartIds);

/**
 * @route GET /books/:bookId/with-category
 * @description Get book details along with books from the same category
 * @body none
 * @access Public
 */
router.get(
  "/:bookId/with-category",
  validators.validateObjectId("bookId"),
  bookController.getBookWithCategory
);

module.exports = router;
