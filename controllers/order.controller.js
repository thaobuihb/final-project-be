const { sendResponse, catchAsync, AppError } = require("../helpers/utils");
const Order = require("../models/Order");
const Book = require("../models/Book");
const User = require("../models/User");
const Cart = require("../models/Cart");
const { StatusCodes } = require("http-status-codes");
const { v4: uuidv4 } = require("uuid");

const orderController = {};

// Tạo đơn hàng
orderController.createOrder = catchAsync(async (req, res) => {
  const { userId } = req.params;
  const { books, shippingAddress, paymentMethods } = req.body;

  // console.log("Dữ liệu nhận được trong req.body:", req.body);

  // 1. Kiểm tra người dùng
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      "Không tìm thấy người dùng",
      "Create Order Error"
    );
  }

  // 2. Kiểm tra danh sách sách
  if (!Array.isArray(books) || books.length === 0) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Không có sách trong đơn hàng",
      "Create Order Error"
    );
  }

  // 3. Kiểm tra phương thức thanh toán
  const validPaymentMethods = ["After receive", "PayPal"];
  const trimmedPaymentMethod = paymentMethods?.trim();
  if (
    !trimmedPaymentMethod ||
    !validPaymentMethods.includes(trimmedPaymentMethod)
  ) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Phương thức thanh toán không hợp lệ",
      "Create Order Error"
    );
  }

  // 4. Kiểm tra thông tin giao hàng
  const requiredAddressFields = [
    "fullName",
    "phone",
    "addressLine",
    "city",
    "state",
    "ward",
    "country",
  ];

  for (const field of requiredAddressFields) {
    if (!shippingAddress || !shippingAddress[field]) {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        `Trường "${field}" trong địa chỉ giao hàng là bắt buộc`,
        "Create Order Error"
      );
    }
  }

  // 5. Xử lý sách
  const orderedBooks = await Promise.all(
    books.map(async ({ bookId, quantity }) => {
      const book = await Book.findById(bookId);
      if (!book) {
        throw new AppError(
          StatusCodes.NOT_FOUND,
          `Không tìm thấy sách: ${bookId}`,
          "Create Order Error"
        );
      }

      const price = book.discountedPrice || book.price;
      return {
        bookId,
        name: book.name,
        quantity,
        price,
        total: (quantity * price).toFixed(2),
        Isbn: book.Isbn,
      };
    })
  );

  // 6. Tính tổng tiền và phí vận chuyển
  const totalItemPrice = orderedBooks.reduce(
    (sum, item) => sum + parseFloat(item.total),
    0
  );
  const shippingFee = 3.0; // Phí vận chuyển cố định
  const calculatedTotalAmount = totalItemPrice + shippingFee;

  // 7. Xác định trạng thái thanh toán
  const paymentStatus = trimmedPaymentMethod === "PayPal" ? "Paid" : "Unpaid";

  // 8. Cập nhật lịch sử mua hàng trong giỏ hàng
  const cart = await Cart.findOne({ userId });
  if (cart) {
    cart.purchaseHistory = [
      ...cart.purchaseHistory,
      ...orderedBooks.map((book) => ({
        bookId: book.bookId,
        name: book.name,
        price: book.price,
        quantity: book.quantity,
        purchasedAt: new Date(),
      })),
    ];
    await cart.save();
  }

  // 9. Tạo mã đơn hàng
  const orderCode = `ORDER-${uuidv4()}`;

  // 10. Lưu đơn hàng vào cơ sở dữ liệu
  const order = await Order.create({
    orderCode,
    userId,
    books: orderedBooks,
    shippingAddress,
    paymentMethods,
    paymentStatus,
    totalAmount: calculatedTotalAmount,
    shippingFee,
    status: "Processing",
    isGuestOrder: null,
  });

  // // 11. Xóa sách đã mua khỏi giỏ hàng
  // if (cart) {
  //   cart.books = cart.books.filter(
  //     (cartItem) => !orderedBooks.find((book) => book.bookId.toString() === cartItem.bookId.toString())
  //   );
  //   await cart.save();
  // }

  // 12. Phản hồi
  sendResponse(
    res,
    StatusCodes.CREATED,
    true,
    order,
    null,
    "Đơn hàng được tạo thành công"
  );
});

orderController.getOrdersByUserId = catchAsync(async (req, res) => {
  const orders = await Order.find({
    userId: req.params.userId,
    isDeleted: false,
  });
  sendResponse(
    res,
    StatusCodes.OK,
    true,
    orders,
    null,
    "Orders retrieved successfully"
  );
});

orderController.getOrderById = catchAsync(async (req, res) => {
  const { userId, orderId } = req.params;

  console.log("UserId nhận được trong getOrderById:", userId);
  console.log("OrderId nhận được trong getOrderById:", orderId);

  // Tìm đơn hàng và populate thông tin sách từ collection Book
  const order = await Order.findOne({
    userId,
    _id: orderId,
    isDeleted: false,
  }).populate({
    path: "books.bookId",
    select: "name img",
  });

  console.log("Chi tiết đơn hàng tìm được:", order);

  if (!order) {
    console.error("Không tìm thấy đơn hàng với OrderId:", orderId);
    throw new AppError(
      StatusCodes.NOT_FOUND,
      "Order not found",
      "Get Order Error"
    );
  }

  // Ánh xạ thông tin để đảm bảo sách bao gồm dữ liệu cần thiết
  const populatedOrder = {
    ...order.toObject(),
    books: order.books.map((book) => ({
      bookId: book.bookId?._id || book.bookId,
      name: book.bookId?.name || book.name,
      img: book.bookId?.img || "/default-book.jpg",
      quantity: book.quantity,
      price: book.price,
      total: book.total,
      Isbn: book.Isbn || book.bookId?.Isbn || "N/A",
    })),
  };

  // console.log("Chi tiết đơn hàng sau khi xử lý:$$$$$", populatedOrder);

  sendResponse(
    res,
    StatusCodes.OK,
    true,
    populatedOrder,
    null,
    "Order retrieved successfully"
  );
});

// Cancel đơn hàng
orderController.updateOrderByUser = catchAsync(async (req, res) => {
  const { userId, orderId } = req.params;
  const { status } = req.body;

  const order = await Order.findOne({ userId, _id: orderId, isDeleted: false });

  if (!order) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      "Order not found",
      "Update Order Error"
    );
  }

  if (order.status !== "Processing") {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Only orders in 'Processing' status can be updated",
      "Update Order Error"
    );
  }

  order.status = status === "Cancelled" ? "Cancelled" : order.status;
  await order.save();

  sendResponse(
    res,
    StatusCodes.OK,
    true,
    order,
    null,
    "Order updated successfully"
  );
});

orderController.getAllOrders = catchAsync(async (req, res) => {
  const { search, searchCriteria } = req.query;
  const query = { isDeleted: false };

  if (search && searchCriteria) {
    if (searchCriteria === "books.Isbn") {
      query["books.Isbn"] = { $regex: search, $options: "i" };
    } else if (searchCriteria === "customerName") {
      query["shippingAddress.fullName"] = { $regex: search, $options: "i" };
    } else {
      query[searchCriteria] = { $regex: search, $options: "i" };
    }
  }
  const orders = await Order.find(query);
  sendResponse(
    res,
    StatusCodes.OK,
    true,
    orders,
    null,
    "Orders retrieved successfully"
  );
});

orderController.updateOrderAD = catchAsync(async (req, res) => {
  const { status } = req.body; // Trạng thái cần cập nhật
  const order = await Order.findOne({
    _id: req.params.orderId,
    isDeleted: false,
  });

  if (!order)
    throw new AppError(
      StatusCodes.NOT_FOUND,
      "Order not found",
      "Update Order Error"
    );

  if (
    status === "Cancelled" &&
    !["Processing", "Shipped"].includes(order.status)
  ) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Only orders in 'Processing' or 'Shipped' status can be cancelled",
      "Update Order Error"
    );
  }

  order.status = status;
  await order.save();

  sendResponse(
    res,
    StatusCodes.OK,
    true,
    order,
    null,
    "Order status updated successfully"
  );
});

orderController.deleteOrder = catchAsync(async (req, res) => {
  const order = await Order.findOneAndUpdate(
    { userId: req.params.userId, _id: req.params.orderId, isDeleted: false },
    { isDeleted: true },
    { new: true }
  );

  if (!order)
    throw new AppError(
      StatusCodes.NOT_FOUND,
      "Order not found",
      "Delete Order Error"
    );

  sendResponse(
    res,
    StatusCodes.OK,
    true,
    null,
    null,
    "Order deleted successfully"
  );
});

orderController.updatePaymentStatus = catchAsync(async (req, res) => {
  const { orderId } = req.params;
  const { paymentStatus } = req.body;

  const order = await Order.findOne({ _id: orderId, isDeleted: false });

  if (!order) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      "Order not found",
      "Update Payment Status Error"
    );
  }

  if (order.status === "Cancelled") {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Cannot update payment status for a cancelled order",
      "Update Payment Status Error"
    );
  }

  order.paymentStatus = paymentStatus;
  await order.save();

  sendResponse(
    res,
    StatusCodes.OK,
    true,
    order,
    null,
    "Payment status updated successfully"
  );
});

orderController.getOrdersByStatus = catchAsync(async (req, res) => {
  const { status } = req.params;
  const orders = await Order.find({ status, isDeleted: false });

  sendResponse(
    res,
    StatusCodes.OK,
    true,
    orders,
    null,
    `Orders with status ${status} retrieved successfully`
  );
});

orderController.trackOrderStatus = catchAsync(async (req, res) => {
  const order = await Order.findOne({
    _id: req.params.orderId,
    userId: req.user.id,
    isDeleted: false,
  });

  if (!order)
    throw new AppError(
      StatusCodes.NOT_FOUND,
      "Order not found",
      "Track Order Status Error"
    );

  sendResponse(
    res,
    StatusCodes.OK,
    true,
    { status: order.status },
    null,
    "Order status retrieved successfully"
  );
});

orderController.updateShippingAddress = catchAsync(async (req, res) => {
  // Log thông tin từ request
  console.log("Request Params - orderId:", req.params.orderId);
  console.log("Request Body - shippingAddress:", req.body.shippingAddress);
  console.log("Logged-in User ID:", req.userId);
  console.log("Logged-in User Role:", req.role);

  const { userId, orderId } = req.params;
  const { shippingAddress } = req.body;
  let order;

  if (req.user.role === "customer") {
    // Khách hàng chỉ được cập nhật địa chỉ của đơn hàng thuộc về họ
    order = await Order.findOne({
      _id: orderId,
      userId: req.user._id, // Kiểm tra userId là của họ
      status: "Processing", // Chỉ cho phép khi đơn hàng đang xử lý
      isDeleted: false,
    });
  } else if (req.user.role === "admin") {
    // Admin có thể cập nhật bất kỳ đơn hàng nào
    order = await Order.findOne({
      _id: orderId,
      status: "Processing", // Đơn hàng đang xử lý
      isDeleted: false,
    });
  }

  if (!order) {
    console.error("Order not found or not eligible for address change", {
      orderId,
      userId: req.user.role === "customer" ? req.userId : "N/A",
    });
    throw new AppError(
      StatusCodes.NOT_FOUND,
      "Order not found or not eligible for address change",
      "Update Shipping Address Error"
    );
  }

  // Kiểm tra các trường bắt buộc
  const requiredFields = [
    "fullName",
    "phone",
    "addressLine",
    "city",
    "state",
    "zipcode",
    "country",
  ];
  for (const field of requiredFields) {
    if (!shippingAddress[field]) {
      console.error(
        "Missing field:",
        field,
        "in shipping address:",
        shippingAddress
      );
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        `Missing field ${field} in shipping address`,
        "Update Shipping Address Error"
      );
    }
  }

  // Cập nhật địa chỉ giao hàng
  order.shippingAddress = shippingAddress;
  await order.save();

  console.log("Updated Order - shippingAddress:", order.shippingAddress);

  sendResponse(
    res,
    StatusCodes.OK,
    true,
    order,
    null,
    "Shipping address updated successfully"
  );
});

orderController.addOrderFeedback = catchAsync(async (req, res) => {
  const { feedback } = req.body;
  const order = await Order.findOneAndUpdate(
    {
      _id: req.params.orderId,
      userId: req.user.id,
      status: "Delivered",
      isDeleted: false,
    },
    { feedback },
    { new: true }
  );

  if (!order)
    throw new AppError(
      StatusCodes.NOT_FOUND,
      "Order not found or not eligible for feedback",
      "Add Order Feedback Error"
    );

  sendResponse(
    res,
    StatusCodes.OK,
    true,
    order,
    null,
    "Feedback added successfully"
  );
});

orderController.createGuestOrder = catchAsync(async (req, res) => {
  const { books, shippingAddress, paymentMethods } = req.body;

  // 1. Kiểm tra danh sách sách
  if (!Array.isArray(books) || books.length === 0) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "No books in the order",
      "Create Guest Order Error"
    );
  }

  // 2. Kiểm tra thông tin giao hàng
  const requiredFields = [
    "fullName",
    "phone",
    "addressLine",
    "city",
    "state",
    "zipcode",
    "country",
  ];
  for (const field of requiredFields) {
    if (!shippingAddress || !shippingAddress[field]) {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        `Field "${field}" is required in shippingAddress`,
        "Create Guest Order Error"
      );
    }
  }

  // 3. Kiểm tra phương thức thanh toán
  const validPaymentMethods = ["After receive", "PayPal"];
  const trimmedPaymentMethod = paymentMethods?.trim();
  if (
    !trimmedPaymentMethod ||
    !validPaymentMethods.includes(trimmedPaymentMethod)
  ) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Phương thức thanh toán không hợp lệ",
      "Create Order Error"
    );
  }

  // 4. Xử lý danh sách sách
  const orderedBooks = await Promise.all(
    books.map(async ({ bookId, quantity }) => {
      const book = await Book.findById(bookId);
      if (!book) {
        throw new AppError(
          StatusCodes.NOT_FOUND,
          `Book not found: ${bookId}`,
          "Create Guest Order Error"
        );
      }

      const price = book.discountedPrice || book.price;
      return {
        bookId,
        name: book.name,
        img: book.img,
        quantity,
        price,
        total: (quantity * price).toFixed(2),
      };
    })
  );

  // 5. Tính tổng tiền và phí vận chuyển
  const totalItemPrice = orderedBooks.reduce(
    (sum, book) => sum + parseFloat(book.total),
    0
  );
  const shippingFee = 3.0; // Phí vận chuyển cố định
  const totalAmount = totalItemPrice + shippingFee;

  const paymentStatus = trimmedPaymentMethod === "PayPal" ? "Paid" : "Unpaid";

  // 6. Tạo mã đơn hàng
  const orderCode = `GUEST-${uuidv4()}`;

  // 7. Lưu đơn hàng vào cơ sở dữ liệu
  const newOrder = await Order.create({
    orderCode,
    books: orderedBooks,
    shippingAddress,
    paymentMethods,
    paymentStatus,
    status: "Processing",
    shippingFee,
    totalAmount,
    isGuestOrder: true,
    userId: null,
  });

  // 8. Phản hồi
  sendResponse(
    res,
    StatusCodes.CREATED,
    true,
    { ...newOrder.toObject(), orderCode },
    null,
    "Guest order created successfully"
  );
});

orderController.getGuestOrderByCode = catchAsync(async (req, res) => {
  const { orderCode } = req.params;
  console.log("Accessing getGuestOrderByCode with orderCode:", orderCode);

  const order = await Order.findOne({ orderCode, isGuestOrder: true }).populate(
    "books.bookId",
    "name img"
  );

  if (!order) {
    console.error("Order not found:", orderCode);
    throw new AppError(
      StatusCodes.NOT_FOUND,
      "Order not found",
      "Get Guest Order Error"
    );
  }

  sendResponse(
    res,
    StatusCodes.OK,
    true,
    order,
    null,
    "Guest order retrieved successfully"
  );
});

// Lấy lịch sử mua hàng
orderController.getPurchaseHistory = catchAsync(async (req, res) => {
  const userId = req.params.userId || req.userId;
  // console.log("UserId nhận được trong getPurchaseHistory:", userId);

  const orders = await Order.find({ userId })
    .populate({
      path: "books.bookId",
      select: "name img",
    })
    .exec();
  // console.log("Lịch sử mua hàng: *******", orders);

  if (!orders || orders.length === 0) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      "No purchase history found for the user",
      "Get Purchase History Error"
    );
  }

  const ordersWithUserId = orders.map((order) => ({
    ...order.toObject(),
    userId,
  }));

  sendResponse(
    res,
    StatusCodes.OK,
    true,
    ordersWithUserId,
    null,
    "Purchase history retrieved successfully"
  );
});

module.exports = orderController;
