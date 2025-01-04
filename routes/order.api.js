const express = require("express");
const router = express.Router();
const orderController = require("../controllers/order.controller");
const authentication = require("../middlewares/authentication");
const validators = require("../middlewares/validators");



/**
 * @route POST /orders/guest
 * @description Create an order for guest users
 * @body { books, shippingAddress, paymentMethod }
 * @access Public
 */
router.post("/guest", orderController.createGuestOrder);



/**
 * @route GET /orders/guest/:orderCode
 * @description Get guest order details by order code
 * @body none
 * @access Public
 */
router.get("/guest/:orderCode", (req, res, next) => {
  console.log("Accessing route: /guest/:orderCode");
  next();
}, orderController.getGuestOrderByCode);



router.get(
  "/purchase-history/:userId",
  (req, res, next) => {
    // console.log("Route nhận được: THAO", req.method, req.originalUrl);
    next();
  },
  authentication.loginRequired,
  orderController.getPurchaseHistory
);


/**
 * @route PUT /orders/:orderId/payment-status
 * @description Update payment status of an order
 * @body { paymentStatus }
 * @access Admin
 */
router.put(
  "/:orderId/payment-status",
  authentication.loginRequired,
  authentication.authorize(["admin"]),
  validators.validateObjectId("orderId"),
  orderController.updatePaymentStatus
);


/**
 * @route GET /orders/status/:status
 * @description Get all orders by specific status
 * @body none
 * @access Admin
 */
router.get(
  "/status/:status",
  authentication.loginRequired,
  authentication.authorize(["admin"]),
  orderController.getOrdersByStatus
);


/**
 * @route GET /orders/track/:orderId
 * @description Track status of an order
 * @body none
 * @access User
 */
router.get(
  "/track/:orderId",
  authentication.loginRequired,
  validators.validateObjectId("orderId"),
  orderController.trackOrderStatus
);


/**
 * @route PUT /orders/:orderId/shipping-address
 * @description Update shipping address of an order
 * @body { shippingAddress }
 * @access User
 */
router.put(
  "/:orderId/shipping-address",
  authentication.loginRequired,
  validators.validateObjectId("orderId"),
  orderController.updateShippingAddress
);


/**
 * @route POST /orders/:orderId/feedback
 * @description Add feedback for an order
 * @body { feedback }
 * @access User
 */
router.post(
  "/:orderId/feedback",
  authentication.loginRequired,
  validators.validateObjectId("orderId"),
  orderController.addOrderFeedback
);


/**
 * @route POST /orders/:id
 * @description Create a order
 * @body { books, shippingAddress, paymentMethods}
 * @access User
 */
router.post(
  "/:userId",
  authentication.loginRequired,
  validators.validateObjectId("userId"),
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
  validators.validateObjectId("userId"),
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
  validators.validateObjectId("userId", "orderId"),
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
  validators.validateObjectId("userId", "orderId"),
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
  validators.validateObjectId("orderId"),
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
  validators.validateObjectId("userId", "orderId"),
  orderController.deleteOrder
);


module.exports = router;
