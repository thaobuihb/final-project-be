const { sendResponse, catchAsync, AppError } = require("../helpers/utils");
const Order = require("../models/Order");
const Book = require("../models/Book");
const User = require("../models/User");
const Cart = require("../models/Cart");
const orderController = {};
const { StatusCodes } = require("http-status-codes");

orderController.createOrder = catchAsync(async (req, res, next) => {
  const { userId } = req.params;

  const { books, shippingAddress, paymentMethods } = req.body;

  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      "User not found",
      "Create Order Error"
    );
  }

  const orderedBooks = [];
  for (const { bookId, quantity } of books) {
    const book = await Book.findById(bookId);
    if (!book) {
      throw new AppError(
        StatusCodes.NOT_FOUND,
        `Book not found: ${bookId}`,
        "Create Order Error"
      );
    }

    const name = book.name;
    const price = book.price;
    const total = (quantity * price).toFixed(2);

    orderedBooks.push({ bookId, name, quantity, price, total });
  }

  const totalAmount = orderedBooks
    .reduce((total, { total: bookTotal }) => {
      const bookTotalNumber = parseFloat(bookTotal);
      return total + (isNaN(bookTotalNumber) ? 0 : bookTotalNumber);
    }, 0)
    .toFixed(2);

  const order = await Order.create({
    userId,
    books: orderedBooks,
    status: "Processing",
    paymentMethods,
    totalAmount,
    shippingAddress,
  });

  const bookIds = orderedBooks.map(({ bookId }) => bookId);
  await Cart.updateOne(
    { userId },
    { $pull: { books: { bookId: { $in: bookIds } } } }
  );

  sendResponse(
    res,
    StatusCodes.CREATED,
    true,
    order,
    null,
    "Order created successfully"
  );
});

orderController.getOrdersByUserId = catchAsync(async (req, res, next) => {
  const userId = req.params.userId;

  const orders = await Order.find({ userId, isDeleted: false });

  for (const order of orders) {
    for (const book of order.books) {
      const foundBook = await Book.findById(book.bookId);
      if (foundBook) book.name = foundBook.name;
    }
  }
  sendResponse(res, 200, true, orders, null, "Orders retrieved successfully");
});

orderController.getOrderById = catchAsync(async (req, res, next) => {
  const { userId, orderId } = req.params;

  const order = await Order.findOne({ userId, _id: orderId, isDeleted: false });

  if (!order) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      "Order not found",
      "Get Order Error"
    );
  }

  sendResponse(
    res,
    StatusCodes.OK,
    true,
    order,
    null,
    "Order retrieved successfully"
  );
});

orderController.updateOrderByUser = catchAsync(async (req, res, next) => {
  const { userId, orderId } = req.params;
  const { status } = req.body;

  const order = await Order.findOne({ userId, _id: orderId, isDeleted: false });

  if (!order) {
    throw new AppError(StatusCodes.NOT_FOUND, "Order not found", "Order Error");
  }

  if (
    order.status === "Shipped" ||
    order.status === "Delivered" ||
    order.status === "Returned" ||
    order.status === "Cancelled"
  ) {
    return sendResponse(
      res,
      StatusCodes.FORBIDDEN,
      false,
      null,
      null,
      "Order cannot be updated "
    );
  }

  if (status !== "Cancelled") {
    return sendResponse(
      res,
      StatusCodes.BAD_REQUEST,
      false,
      null,
      null,
      "Invalid status update"
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
    `Order ${status} successfully`
  );
});

orderController.getAllOrders = catchAsync(async (req, res, next) => {
  const orders = await Order.find({ isDeleted: false });
  return sendResponse(
    res,
    StatusCodes.OK,
    true,
    orders,
    "Orders retrieved successfully"
  );
});

orderController.updateOrderAD = catchAsync(async (req, res, next) => {
  const { orderId } = req.params;
  const { status } = req.body;

  const order = await Order.findOne({ _id: orderId, isDeleted: false });

  if (!order) {
    throw new AppError(StatusCodes.NOT_FOUND, "Order not found", "Order Error");
  }

  if (order.status === "Cancelled") {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      "Order is already cancelled",
      "Order Error"
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
    `Order ${status} successfully`
  );
});

orderController.deleteOrder = catchAsync(async (req, res, next) => {
  const { userId, orderId } = req.params;

  const order = await Order.findOne({ userId, _id: orderId, isDeleted: false });

  if (!order) {
    throw new AppError(StatusCodes.NOT_FOUND, "Order not found", "Order Error");
  }

  order.isDeleted = true;

  await order.save();

  sendResponse(
    res,
    StatusCodes.OK,
    true,
    null,
    null,
    "Order deleted successfully"
  );
});

module.exports = orderController;
