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
      alias: "Img link",
      default: "",
    },
    description: {
      type: String,
      default: "",
    },
    discountRate: { type: Number, default: 0, min: 0 },
    discountedPrice: { type: Number, default: null },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: false,
    },
    categoryName: { 
      type: String,
      required: true,
    },
    Isbn: {
      type: String,
      required: true,
      unique: true, 
      validate: {
        validator: function(v) {
          return /^97[89][0-9]{10}$/.test(v);
        },
        message: props => `${props.value} không phải là mã ISBN hợp lệ!`
      }
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
