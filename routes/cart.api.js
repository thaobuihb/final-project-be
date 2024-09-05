const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cart.controller");
const authentication = require("../middlewares/authentication");

/**
 * @route POST /carts/:userId
 * @description Add a new book to the cart
 * @body { bookId, quantity }
 * @access User
 */
router.post(
  "/:userId",
   authentication.loginRequired,
  cartController.addOrUpdateBookToCart
);

/**
 * @route PUT /carts/:id
 * @description Update the quantity of a book in the cart
 * @body { bookId, quantity }
 * @access User
 */

router.get(
  "/:userId",
  authentication.loginRequired,
  cartController.getCart
);

/**
 * @route DELETE /carts/:id
 * @description Remove a book from the cart
 * @body none
 * @access User
 */
router.delete(
  "/:id",
  authentication.loginRequired,
  cartController.removeBookFromCart
);

module.exports = router;
