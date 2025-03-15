const { sendResponse, catchAsync, AppError } = require("../helpers/utils");
const Order = require("../models/Order");
const Book = require("../models/Book");
const User = require("../models/User");
const Cart = require("../models/Cart");
const { StatusCodes } = require("http-status-codes");
const { v4: uuidv4 } = require("uuid");

const orderController = {};

// Tạo đơn hàng khách đăng nhập
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
  const shippingFee = 3.0; 
  const calculatedTotalAmount = totalItemPrice + shippingFee;

  
  const paymentStatus = trimmedPaymentMethod === "PayPal" ? "Đã thanh toán" : "Chưa thanh toán";

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

  const orderCode = `ORDER-${uuidv4()}`;

  const order = await Order.create({
    orderCode,
    userId,
    books: orderedBooks,
    shippingAddress,
    paymentMethods,
    paymentStatus,
    totalAmount: calculatedTotalAmount,
    shippingFee,
    status: "Đang xử lý",
    isGuestOrder: null,
  });

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

  if (!["Đang xử lý", "Đã giao hàng"].includes(order.status)) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Only orders in 'Đang xử lý' or 'Đã giao hàng' status can be cancelled",
      "Update Order Error"
    );
  }

  order.status = "Đã hủy";

  if (order.paymentStatus === "Đã thanh toán") {
    order.paymentStatus = "Đã hoàn tiền";
  }

  await order.save();

  sendResponse(
    res,
    StatusCodes.OK,
    true,
    order,
    null,
    "Order cancelled successfully"
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
  const { status } = req.body;
  const orderId = req.params.orderId;

  const order = await Order.findOne({
    _id: orderId,
    isDeleted: false,
  });

  if (!order) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      "Không tìm thấy đơn hàng",
      "Lỗi cập nhật đơn hàng"
    );
  }

  const currentStatus = order.status.trim();
  const newStatus = status.trim();

  console.log(`🚀 Cập nhật trạng thái đơn hàng từ: '${currentStatus}' → '${newStatus}'`);

  if (currentStatus === newStatus) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      `Trạng thái đã là '${newStatus}', không cần cập nhật`,
      "Lỗi cập nhật đơn hàng"
    );
  }

  const validTransitions = {
    "Đang xử lý": ["Đã giao hàng", "Đã nhận hàng", "Đã hủy"],
    "Đã giao hàng": ["Đã nhận hàng", "Trả hàng", "Đã hủy"],
    "Đã nhận hàng": ["Trả hàng", "Đã hủy"],
    "Trả hàng": [],
    "Đã hủy": []
  };

  if (!validTransitions[currentStatus]) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      `Trạng thái hiện tại '${currentStatus}' không hợp lệ`,
      "Lỗi cập nhật đơn hàng"
    );
  }

  if (!validTransitions[currentStatus].includes(newStatus)) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      `Không thể cập nhật trạng thái từ '${currentStatus}' sang '${newStatus}'`,
      "Lỗi cập nhật đơn hàng"
    );
  }

  if (status === "Đã hủy" && order.paymentStatus === "Đã thanh toán") {
    console.log(`🔄 Đơn hàng bị hủy - tự động hoàn tiền từ '${order.paymentStatus}' → 'Đã hoàn tiền'`);
    order.paymentStatus = "Đã hoàn tiền";
  }

  order.status = newStatus;
  if (newStatus === "Trả hàng" && order.paymentStatus === "Đã thanh toán") {
    console.log("🔄 Đơn hàng đã được trả hàng, tự động chuyển trạng thái thanh toán thành 'Đã hoàn tiền'");
    order.paymentStatus = "Đã hoàn tiền";
  }
  await order.save();

  console.log("✅ Cập nhật trạng thái thành công!");

  sendResponse(
    res,
    StatusCodes.OK,
    true,
    order,
    null,
    "Cập nhật trạng thái đơn hàng thành công"
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
      "Không tìm thấy đơn hàng",
      "Lỗi cập nhật trạng thái thanh toán"
    );
  }

  const currentPaymentStatus = order.paymentStatus.trim();
  const newPaymentStatus = paymentStatus.trim();


  const validTransitions = {
    "Chưa thanh toán": ["Đã thanh toán"], 
    "Đã thanh toán": ["Đã hoàn tiền"], 
    "Đã hoàn tiền": [] 
  };

  const shouldAutoRefund = ["Trả hàng", "Đã hủy"].includes(order.status) && currentPaymentStatus === "Đã thanh toán";

  if (shouldAutoRefund) {
    order.paymentStatus = "Đã hoàn tiền";
  } else {
    if (!validTransitions[currentPaymentStatus].includes(newPaymentStatus)) {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        `Không thể cập nhật trạng thái thanh toán từ '${currentPaymentStatus}' sang '${newPaymentStatus}'`,
        "Lỗi cập nhật trạng thái thanh toán"
      );
    }
    order.paymentStatus = newPaymentStatus;
  }

  await order.save();
  console.log("✅ Cập nhật trạng thái thanh toán thành công!");

  sendResponse(
    res,
    StatusCodes.OK,
    true,
    order,
    null,
    "Cập nhật trạng thái thanh toán thành công"
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
  const { userId, orderId } = req.params;
  const { shippingAddress } = req.body;
  let order;

  if (req.user.role === "customer") {
    order = await Order.findOne({
      _id: orderId,
      userId: req.user._id, 
      status: "Đang xử lý", 
      isDeleted: false,
    });
  } else if (req.user.role === "admin") {
    order = await Order.findOne({
      _id: orderId,
      status: "Đang xử lý", 
      isDeleted: false,
    });
  }

  if (!order) {
    console.error("❌ Order not found or not eligible for address change", {
      orderId,
      userId: req.user.role === "customer" ? req.userId : "N/A",
    });
    throw new AppError(
      StatusCodes.NOT_FOUND,
      "Không tìm thấy đơn hàng hoặc không thể thay đổi địa chỉ",
      "Lỗi cập nhật địa chỉ giao hàng"
    );
  }

  const requiredFields = [
    "fullName",
    "phone",
    "addressLine",
    "city",
    "state",
    "country",
  ];
  for (const field of requiredFields) {
    if (!shippingAddress[field]?.trim()) {
      console.error(
        "❌ Thiếu trường:",
        field,
        "trong địa chỉ giao hàng:",
        shippingAddress
      );
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        `Thiếu trường ${field} trong địa chỉ giao hàng`,
        "Lỗi cập nhật địa chỉ giao hàng"
      );
    }
  }

  if (!shippingAddress.zipcode) {
    shippingAddress.zipcode = "";
  }

  order.shippingAddress = shippingAddress;
  await order.save();

  // console.log("✅ Đã cập nhật địa chỉ giao hàng:", order.shippingAddress);

  sendResponse(
    res,
    StatusCodes.OK,
    true,
    order,
    null,
    "Cập nhật địa chỉ giao hàng thành công"
  );
});


orderController.addOrderFeedback = catchAsync(async (req, res) => {
  const { feedback } = req.body;
  const order = await Order.findOneAndUpdate(
    {
      _id: req.params.orderId,
      userId: req.user.id,
      status: "Đã nhận hàng",
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

//tạo đơn hàng khách không đăng nhập
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
    // "zipcode",
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
        Isbn: book.Isbn,
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

  const paymentStatus = trimmedPaymentMethod === "PayPal" ? "Đã thanh toán" : "Chưa thanh toán";

  // 6. Tạo mã đơn hàng
  const orderCode = `GUEST-${uuidv4()}`;

  // 7. Lưu đơn hàng vào cơ sở dữ liệu
  const newOrder = await Order.create({
    orderCode,
    books: orderedBooks,
    shippingAddress,
    paymentMethods,
    paymentStatus,
    status: "Đang xử lý",
    shippingFee,
    totalAmount,
    isGuestOrder: true,
    userId: null,
  });
  console.log("📦 Đơn hàng khách vãng lai:", newOrder);


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

orderController.getOrderByCode = catchAsync(async (req, res) => {
  const { orderCode } = req.params; 

  if (!orderCode) {
    return res.status(400).json({
      success: false,
      message: "Order code is required",
    });
  }

  console.log("🔍 Đang tìm đơn hàng với mã:", orderCode);

  try {
    const order = await Order.findOne({ orderCode }).populate(
      "books.bookId",
      "name img price"
    );

    if (!order) {
      console.error("❌ Không tìm thấy đơn hàng:", orderCode);
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: order,
      message: "Order retrieved successfully",
    });
  } catch (error) {
    console.error("🔥 Lỗi khi tìm đơn hàng:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});


//lấy đơn hàng cho khách không đăng nhập
orderController.getGuestOrderByCode = async (req, res) => {
  try {
      const { orderCode } = req.params;

      const order = await Order.findOne({ orderCode, isGuestOrder: true })
      .populate({
          path: "books.bookId",
          model: "Book", 
          select: "name img price", 
      });

      if (!order) {
          return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
      }

      return res.status(200).json(order);
  } catch (error) {
      console.error("Error fetching guest order:", error);
      return res.status(500).json({ message: "Lỗi server" });
  }
};

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


orderController.cancelGuestOrder = catchAsync(async (req, res) => {
  const { orderCode } = req.params;

  // 1. Kiểm tra đơn hàng có tồn tại không
  const order = await Order.findOne({ orderCode, isGuestOrder: true });

  if (!order) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      "Không tìm thấy đơn hàng dành cho khách chưa đăng nhập",
      "Cancel Guest Order Error"
    );
  }

  // 2. Kiểm tra trạng thái đơn hàng, chỉ cho phép hủy khi đang xử lý
  if (order.status !== "Đang xử lý") {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Chỉ có thể hủy đơn hàng khi đang trong trạng thái 'Đang xử lý'",
      "Cancel Guest Order Error"
    );
  }

  // 3. Cập nhật trạng thái đơn hàng thành "Đã hủy"
  order.status = "Đã hủy";
  order.updatedAt = new Date();
  await order.save();

  // 4. Trả về kết quả
  sendResponse(
    res,
    StatusCodes.OK,
    true,
    order,
    null,
    "Đơn hàng đã được hủy thành công"
  );
});


module.exports = orderController;
