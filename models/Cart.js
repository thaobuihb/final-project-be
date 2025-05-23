const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const cartSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  books: [
    {
      bookId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Book",
        required: true,
      },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true },
    },
  ],
  totalPrice: { type: Number, default: 0 },
  purchaseHistory: [
    {
      bookId: { type: mongoose.Schema.Types.ObjectId, ref: "Book", required: true },
      name: { type: String, required: true },
      price: { type: Number, required: true },
      quantity: { type: Number, required: true },
      purchasedAt: { type: Date, default: Date.now },
    },
  ],
});

cartSchema.methods.toJSON = function () {
  const cart = this._doc;
  delete cart.isDeleted; 
  return cart;
};

const Cart = mongoose.model("Cart", cartSchema);
module.exports = Cart;
