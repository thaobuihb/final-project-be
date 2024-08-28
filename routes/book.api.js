const express = require('express');
const router = express.Router();

/**
 * @route POST /books/
 * @description Create a new book
 * @body { name, author, price, publicationDate }
 * @access admin
 */

/**
 * @route GET /books
 * @description Get all books
 * @body none
 * @access Public
 */

/**
 * @route GET /books/:id
 * @description Get book by id
 * @body none
 * @access Public
 */

/**
 * @route GET /books/search
 * @description Search for books by name, author, genre, or other criteria
 * @query { name, author, genre, priceRange, rating }
 * @access Public
 */

/**
 * @route GET /books/filter
 * @description Filter books by various criteria (e.g., genre, price, rating)
 * @query { genre, minPrice, maxPrice, minRating }
 * @access Public
 */

/**
 * @route PUT /books/:id
 * @description Update a book
 * @body { name, author, price, publicationDate }
 * @access admin
 */

/**
 * @route POST /books/discount
 * @description Create or update discounted information for a book
 * @body { bookId, discountRate, discountedPrice }
 * @access Admin
 */

/**
 * @route PUT /books/discount/:id
 * @description Update discounted information of a book
 * @body { discountRate, discountedPrice }
 * @access Admin
 */

/**
 * @route DELETE /books/discount/:id
 * @description Delete discounted information of a book
 * @body none
 * @access Admin
 */

/**
 * @route GET /books/discount
 * @description Get all discounted books
 * @body none
 * @access Public
 */

/**
 * @route DELETE /books/:id
 * @description Delete a book
 * @body none
 * @access admin
 */

module.exports = router