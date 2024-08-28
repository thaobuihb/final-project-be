var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.status(200).send("Welcome to BookStore!")
});

/**
 * @route POST /auth/login
 * @description Log in with username and password
 * @body {email, passsword}
 * @access Public
 */


//  User apis


/**
 * @route POST /users
 * @description Register for a new account
 * @body {name, email, passsword}
 * @access Public
 */



/**
 * @route GET /users
 * @description get all User
 * @body none
 * @access admin
 */



/**
 * @route GET /users/:id
 * @description get a User by id
 * @body none
 * @access Public
 */



/**
 * @route PUT /users/:id
 * @description update a user
 * @body none
 * @access User
 */


/**
 * @route DELETE /users/:id
 * @description delete a User
 * @body none
 * @access admin
 */


//  Book apis


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
 * @route PUT /books/:id
 * @description Update a book
 * @body { name, author, price, publicationDate }
 * @access admin
 */



/**
 * @route DELETE /books/:id
 * @description Delete a book
 * @body none
 * @access admin
 */


// Category apis


/**
 * @route POST /categories/
 * @description create a new category
 * @body { categoryName, description }
 * @access admin
 */



/**
 * @route GET /categories/
 * @description Get all category
 * @body none
 * @access Public
 */



/**
 * @route GET /categories/:id
 * @description Get a category by id
 * @body none
 * @access Public
 */


/**
 * @route PUT /categories/:id
 * @description Update a category by id
 * @body { categoryName, description }
 * @access Admin
 */



/**
 * @route DELETE /categories/:id
 * @description Delete a category by id
 * @body none
 * @access Admin
 */


//  Book categories apis


/**
 * @route GET /bookCategory/
 * @description Get all bookCategory
 * @body none
 * @access Admin
 */



/**
 * @route POST /bookCategory/
 * @description Create a new bookCategory
 * @body { bookId, categoryIds }
 * @access Admin
 */



/**
 * @route DELETE /bookCategory/:id
 * @description DELETE a bookCategory
 * @body none
 * @access Admin
 */


// Review apis


/**
 * @route GET /reviews/:id
 * @description Get all review of a user
 * @body none
 * @access Public
 */



/**
 * @route POST /reviews/:id
 * @description Create a new review
 * @body { bookId, comment }
 * @access User
 */



/**
 * @route PUT /reviews/:id
 * @description Update a review
 * @body { reviewId, comment }
 * @access User
 */



/**
 * @route DELETE /reviews/:id
 * @description Delete a review
 * @body { reviewId }
 * @access User
 */





/**
 * @route PUT /carts/:id
 * @description Update cart
 * @body { bookId, quantity, price }
 * @access User
 */



/**
 * @route POST /orders/:id
 * @description Create a order
 * @body { books, shippingAddress }
 * @access User
 */


/**
 * @route GET /orders/
 * @description GET all order
 * @body none
 * @access admin
 */



/**
 * @route GET /orders/:userid
 * @description GET all order of a user
 * @body none
 * @access User , amdin
 */



/**
 * @route PUT /orders/:userid/:orderid
 * @description Update a order
 * @body { status }
 * @access User , amdin
 */


module.exports = router;
