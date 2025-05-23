const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const orderSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    guestEmail: {
      type: String,
    },
    books: [
      {
        bookId: {
          type: Schema.Types.ObjectId,
          required: true,
          ref: "Book",
        },
        name: {
          type: String,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
        total: {
          type: Number,
          required: true,
        },
        Isbn: {
          type: String,
          required: true,
        },
      },
    ],
    status: {
      type: String,
      enum: [
        "Đang xử lý",
        "Đã giao hàng",
        "Đã nhận hàng",
        "Trả hàng",
        "Đã hủy",
      ],
      default: "Đang xử lý",
    },
    paymentStatus: {
      type: String,
      enum: ["Chưa thanh toán", "Đã thanh toán", "Đã hoàn tiền"],
      default: "Chưa thanh toán",
    },

    totalAmount: {
      type: Number,
      required: true,
    },
    shippingFee: {
      type: Number,
      default: 0,
    },
    shippingAddress: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      addressLine: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      ward: { type: String, required: true },
      zipcode: { type: String, default: "" },
      country: { type: String, default: "Vietnam" },
    },

    paymentMethods: {
      type: String,
      enum: ["After receive", "PayPal"],
      required: true,
    },
    transactionId: {
      type: String,
      default: "",
    },
    orderNotes: {
      type: String,
      default: "",
    },
    isDeleted: {
      type: Boolean,
      default: false,
      select: false,
    },
    orderCode: {
      type: String,
      unique: true,
      required: true,
    },
    isGuestOrder: {
      type: Boolean,
      default: false,
    },
    statusHistory: [
      {
        status: { type: String, required: true },
        updatedAt: { type: Date, default: Date.now },
      },
    ],
    discount: {
      code: { type: String, default: "" },
      amount: { type: Number, default: 0 },
    },
  },
  { timestamps: true, versionKey: false, strict: true }
);

orderSchema.methods.toJSON = function () {
  const order = this._doc;
  delete order.isDeleted;
  delete order.userId;
  return order;
};

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;
