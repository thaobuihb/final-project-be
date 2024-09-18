const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cart.controller");
const authentication = require("../middlewares/authentication");
const validators = require("../middlewares/validators");

/**
 * @route POST /carts/:userId
 * @description Add/update book in the cart
 * @body { bookId, quantity }
 * @access User
 */
router.post(
  "/",
  authentication.loginRequired,
  validators.validateObjectId("userId"),
  cartController.addOrUpdateBookInCart
);

/**
 * @route GET /carts/:userId
 * @description Get all cart of a user
 * @body { bookId, quantity }
 * @access User
 */

router.get(
  "/:userId",
  authentication.loginRequired,
  validators.validateObjectId("userId"),
  cartController.getCart
);

/**
 * @route DELETE /carts/:userId
 * @description Delete cart
 * @body {}
 * @access User
 */
router.delete(
  "/:userId",
  authentication.loginRequired,
  validators.validateObjectId("userId"),
  cartController.clearCart
);

module.exports = router;
