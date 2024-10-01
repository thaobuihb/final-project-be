const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const bookSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    author: {
      type: String,
      // required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
    },
    publicationDate: {
      type: String,
      required: true,
    },
    img: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      default: "",
    },
    discountRate: { type: Number, default: 0 },
    discountedPrice: { type: Number, default: null },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    categoryName: { 
      type: String,
      required: true,
    },

    isDeleted: {
      type: Boolean,
      default: false,
      select: false,
    },
  },
  { timestamps: true, versionKey: false },
);

bookSchema.methods.toJSON = function () {
  const book = this._doc;
  delete book.isDeleted;
  return book;
};

const Book = mongoose.model("Book", bookSchema);
module.exports = Book;
