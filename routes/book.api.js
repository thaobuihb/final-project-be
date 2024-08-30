const express = require('express');
const router = express.Router();
const bookController = require("../controllers/book.controller");
const authentication = require("../middlewares/authentication");

/**
 * @route POST /books/
 * @description Create a new book
 * @body { name, author, price, publicationDate }
 * @access admin
 */
router.post(
    '/',
    authentication.loginRequired,
    authentication.authorize(["admin"]),
    bookController.createBook
  );
  

/**
 * @route GET /books
 * @description Get all books
 * @body none
 * @access Public
 */
router.get(
    '/',
    authentication.loginRequired,
    bookController.getAllBooks
  );


/**
 * @route GET /books/:id
 * @description Get book by id
 * @body none
 * @access Public
 */

router.post(
    '/:id',
    authentication.loginRequired,
    bookController.getlBookById
  );

/**
 * @route GET /books/search
 * @description Search for books by name, author, genre, or other criteria
 * @query { name, author, genre, priceRange, rating }
 * @access Public
 */
router.get(
    '/search',
    authentication.loginRequired,
    bookController.searchBook
  );

/**
 * @route GET /books/filter
 * @description Filter books by various criteria (e.g., genre, price, rating)
 * @query { genre, minPrice, maxPrice, minRating }
 * @access Public
 */
router.get(
    '/search',
    authentication.loginRequired,
    bookController.filterBook
  );


/**
 * @route PUT /books/:id
 * @description Update a book
 * @body { name, author, price, publicationDate }
 * @access admin
 */

router.put(
    '/:id',
    authentication.loginRequired,
    authentication.authorize(["admin"]),
    bookController.createBook
  );

/**
 * @route POST /books/discount
 * @description Create or update discounted information for a book
 * @body { bookId, discountRate, discountedPrice }
 * @access Admin
 */

router.post(
    '/discount',
    authentication.loginRequired,
    authentication.authorize(["admin"]),
    bookController.discountBook
  );

/**
 * @route PUT /books/discount/:id
 * @description Update discounted information of a book
 * @body { discountRate, discountedPrice }
 * @access Admin
 */

router.put(
    '/discount/:id',
    authentication.loginRequired,
    authentication.authorize(["admin"]),
    bookController.discountBook
  );

/**
 * @route DELETE /books/discount/:id
 * @description Delete discounted information of a book
 * @body none
 * @access Admin
 */

router.delete(
    '/discount/:id',
    authentication.loginRequired,
    authentication.authorize(["admin"]),
    bookController.deleteBook
  );

/**
 * @route GET /books/discount
 * @description Get all discounted books
 * @body none
 * @access Public
 */

router.get(
    '/discount',
    authentication.loginRequired,
    authentication.authorize(["admin"]),
    bookController.getDiscountBook
  );

/**
 * @route DELETE /books/:id
 * @description Delete a book
 * @body none
 * @access admin
 */

router.delete(
    '/:id',
    authentication.loginRequired,
    authentication.authorize(["admin"]),
    bookController.deleteBook
  );

module.exports = router