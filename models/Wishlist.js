const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const wishlistSchema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  books: [
    {
      bookId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book',
        required: true,
      },
      name: String,
      price: Number,
      discountedPrice: Number,
      img: String,
    }
  ]
});


const Wishlist = mongoose.model('Wishlist', wishlistSchema);
module.exports = Wishlist;
