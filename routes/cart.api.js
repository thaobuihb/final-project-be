const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cart.controller");
const authentication = require("../middlewares/authentication");
// const validators = require("../middlewares/validators");

/**
 * @route POST /carts
 * @description Add/update book in the cart
 * @body { bookId, quantity }
 * @access User
 */
router.post(
  "/",
  // authentication.loginRequired,
  cartController.addOrUpdateBookInCart
);

/**
 * @route GET /carts
 * @description Get all items in the cart of a user
 * @access User
 */
router.get(
  "/",
  authentication.loginRequired,
  cartController.getCart
);

/**
 * @route DELETE /carts
 * @description Clear the cart of a user
 * @access User
 */
router.delete(
  "/",
  authentication.loginRequired,
  cartController.clearCart
);

/**
 * @route POST /carts/sync
 * @description Sync local cart with server cart after login
 * @body { userId, cart }
 * @access User
 */
router.post("/sync", authentication.loginRequired, cartController.syncCartAfterLogin);


/**
 * @route PUT /carts/update
 * @description Update the quantity of a book in the cart
 * @body { bookId, quantity }
 * @access User
 */
router.put(
  "/update",
  authentication.loginRequired,
  cartController.updateBookQuantity
);

/**
 * @route DELETE /carts/item
 * @description Remove a book from the cart
 * @body { bookId }
 * @access User
 */
router.delete(
  "/item",
  authentication.loginRequired,
  cartController.removeBookFromCart
);



module.exports = router;
