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
    // authentication.authorize(["admin"]),
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
    // authentication.loginRequired,
    bookController.getAllBooks
  );


/**
 * @route GET /books/:id
 * @description Get book by id
 * @body none
 * @access Public
 */

router.get(
    '/:id',
    // authentication.loginRequired,
    bookController.getBookById
  );



/**
 * @route PUT /books/:id
 * @description Update a book
 * @body { name, author, price, publicationDate }
 * @access admin
 */

router.put(
    '/:id',
    // authentication.loginRequired,
    // authentication.authorize(["admin"]),
    bookController.updateBook
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