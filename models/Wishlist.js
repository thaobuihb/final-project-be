const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const wishlistSchema = new Schema({
    guestId: {
        type: String, 
        required: true,
      },
  books: [
    {
      bookId: {
        type: Schema.Types.ObjectId,
        ref: "Book",
        required: true,
      },
      name: String,
      img: String,
      price: Number,
      discountedPrice: Number,
    },
  ],
},
{ timestamps: true, versionKey: false }
);

const Wishlist = mongoose.model("Wishlist", wishlistSchema);
module.exports = Wishlist;