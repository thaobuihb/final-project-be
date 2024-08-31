const express = require('express');
const router = express.Router();
const orderController = require("../controllers/order.controller")

/**
 * @route POST /orders/:id
 * @description Create a order
 * @body { books, shippingAddress }
 * @access User
 */
router.post("/:userId", orderController.createOrder);



/**
 * @route GET /orders/
 * @description GET all order
 * @body none
 * @access admin
 */
router.get("/", orderController.getOrder);



/**
 * @route GET /orders/:userid
 * @description GET all order of a user
 * @body none
 * @access User , amdin
 */
router.get("/:userId", orderController.getAllOrder);



/**
 * @route PUT /orders/:userid/:orderid
 * @description Update a order
 * @body { status }
 * @access User , amdin
 */
router.get("/:userId/:orderId", orderController.getOrderById);

/**
 * @route Put /orders/:id
 * @description Cancer a order
 * @body none
 * @access user
 */
router.put("/:userId/:orderId", orderController.updateOrder);

/**
 * @route  Put/orders/:id
 * @description Update Order for Admin
 * @body none
 * @access Admin
 */
// Update Order for Admin
router.put("/:orderId", orderController.updateOrderAD);

/**
 * @route DELETE /orders/:id
 * @description delete an order by id
 * @body none
 * @access Admin
 */
router.delete("/:userId/:orderId", orderController.deleteOrder);



module.exports = router