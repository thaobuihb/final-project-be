const express = require("express");
const router = express.Router();
const orderController = require("../controllers/order.controller");
const authentication = require("../middlewares/authentication");

/**
 * @route POST /orders/:id
 * @description Create a order
 * @body { books, shippingAddress, paymentMethods}
 * @access User
 */
router.post(
  "/:userId",
  authentication.loginRequired,
  orderController.createOrder
);

/**
 * @route GET /orders/:userId
 * @description GET all order of a user
 * @body none
 * @access User
 */
router.get(
  "/:userId",
  authentication.loginRequired,
  orderController.getOrdersByUserId
);

/**
 * @route GET /orders/:userId/:orderId
 * @description Get a order of a user
 * @body { status }
 * @access User , amdin
 */
router.get(
  "/:userId/:orderId",
  authentication.loginRequired,
  orderController.getOrderById
);

/**
 * @route Put /orders/:id
 * @description Cancer a order
 * @body none
 * @access user
 */
router.put(
  "/:userId/:orderId",
  authentication.loginRequired,
  orderController.updateOrderByUser
);

/**
 * @route GET /orders/
 * @description GET all order by admin
 * @body none
 * @access admin
 */
router.get(
  "/",
  authentication.loginRequired,
  authentication.authorize(["admin"]),
  orderController.getAllOrders
);

/**
 * @route  Put/orders/:orderId
 * @description Update Order for Admin
 * @body none
 * @access Admin
 */
router.put(
  "/:orderId",
  authentication.loginRequired,
  authentication.authorize(["admin"]),
  orderController.updateOrderAD
);

/**
 * @route DELETE /orders/:orderId
 * @description delete an order by id
 * @body none
 * @access Admin
 */
router.delete(
  "/:userId/:orderId",
  authentication.loginRequired,
  authentication.authorize(["admin"]),
  orderController.deleteOrder
);

module.exports = router;
