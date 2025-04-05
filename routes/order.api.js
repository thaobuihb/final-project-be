const express = require("express");
const router = express.Router();
const orderController = require("../controllers/order.controller");
const authentication = require("../middlewares/authentication");
const validators = require("../middlewares/validators");


/**
 * @route GET /orders/guest/:orderCode
 * @description Get guest order details by order code
 * @body none
 * @access Public
 */
router.get("/guest/:orderCode", (req, res, next) => {
  // console.log("Accessing route: /guest/:orderCode");
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

// 🛒 Tạo đơn hàng
router.post("/guest", orderController.createGuestOrder);
router.post(
  "/:userId",
  authentication.loginRequired,
  validators.validateObjectId("userId"),
  orderController.createOrder
);

// 📦 Lấy thông tin đơn hàng
router.get("/find/:orderCode", orderController.getOrderByCode);
router.get(
  "/user/:userId",
  authentication.loginRequired,
  validators.validateObjectId("userId"),
  orderController.getOrdersByUserId
);
router.get(
  "/:userId/:orderId",
  authentication.loginRequired,
  validators.validateObjectId("userId", "orderId"),
  orderController.getOrderById
);
router.get(
  "/status/:status",
  authentication.loginRequired,
  authentication.authorize(["admin"]),
  orderController.getOrdersByStatus
);
router.get(
  "/track/:orderId",
  authentication.loginRequired,
  validators.validateObjectId("orderId"),
  orderController.trackOrderStatus
);

router.get(
  "/",
  authentication.loginRequired,
  authentication.authorize(["admin"]),
  orderController.getAllOrders
);

// 🔄 Cập nhật đơn hàng
router.put(
  "/admin/:orderId",
  authentication.loginRequired,
  authentication.authorize(["admin"]),
  validators.validateObjectId("orderId"),
  orderController.updateOrderAD
);
router.put(
  "/:userId/:orderId",
  authentication.loginRequired,
  validators.validateObjectId("userId", "orderId"),
  orderController.updateOrderByUser
);

router.put("/guest/cancel/:orderCode", orderController.cancelGuestOrder);


router.put(
  "/:orderId/payment-status",
  authentication.loginRequired,
  authentication.authorize(["admin"]),
  validators.validateObjectId("orderId"),
  orderController.updatePaymentStatus
);
router.put(
  "/:orderId/shipping-address",
  authentication.loginRequired,
  validators.validateObjectId("orderId"),
  orderController.updateShippingAddress
);

// 📝 Thêm đánh giá đơn hàng
router.post(
  "/:orderId/feedback",
  authentication.loginRequired,
  validators.validateObjectId("orderId"),
  orderController.addOrderFeedback
);

// ❌ Xóa đơn hàng
router.delete(
  "/admin/:orderId",
  authentication.loginRequired,
  authentication.authorize(["admin"]),
  validators.validateObjectId("orderId"),
  orderController.deleteOrder
);


module.exports = router;
