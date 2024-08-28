const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const orderSchema = new Schema({

    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      books: [
        {
          bookId: {
            type: Schema.Types.ObjectId,
            required: true,
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
        },
      ],
      status: {
        type: String,
        enum: ["Processing", "Shipped", "Delivered", "Returned", "Cancelled"],
        default: "Processing",
      },
      totalAmount: {
        type: Number,
        required: true,
      },
      shippingAddress: {
        type: String,
        required: true,
      },
      paymentMethods: {
        type: String,
        enum: ["After recieve", "PayPal"],
        required: true,
      },
      
    isDeleted: {
        type: Boolean,
        default: false,
        select: false,
      },
},{ timestamps: true, }
  );

  const Order = mongoose.model("Order", orderSchema);
module.exports = Order;