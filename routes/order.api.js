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
 * @route PUT /orders/:userId/:orderid
 * @description Update a order
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
// router.put("/:orderId/cancel", orderController.cancelOrder);

/**
 * @route GET /orders/
 * @description GET all order
 * @body none
 * @access admin
 */
// router.get("/", orderController.getAllOrders);
/**
 * @route  Put/orders/:id
 * @description Update Order for Admin
 * @body none
 * @access Admin
 */
// Update Order for Admin
// router.put("/:orderId", orderController.updateOrderAD);

/**
 * @route DELETE /orders/:id
 * @description delete an order by id
 * @body none
 * @access Admin
 */
// router.delete("/:orderId", orderController.deleteOrder);

module.exports = router;
