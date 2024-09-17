const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const cartSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    books: {
      type: [Schema.Types.Mixed],
      default: [],
    },
    isDeleted: {
      type: Boolean,
      default: false,
      select: false,
    },
  },
  { timestamps: true, versionKey: false }
);

cartSchema.methods.toJSON = function () {
  const cart = this._doc;
  delete cart.userId;
  delete cart.isDeleted;
  return cart;
};

const Cart = mongoose.model("Cart", cartSchema);
module.exports = Cart;
