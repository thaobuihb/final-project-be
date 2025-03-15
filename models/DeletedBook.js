const mongoose = require("mongoose");

const deletedBookSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    author: { type: String, required: true },
    price: { type: Number, required: true },
    publicationDate: { type: Date, required: true },
    img: { type: String },
    description: { type: String },
    discountRate: { type: Number, default: 0 },
    discountedPrice: { type: Number, default: null },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    Isbn: { type: String, required: true },
    categoryName: { type: String, required: true }, 
    deletedAt: { type: Date, required: true }, 
  },
  { timestamps: true }
);

const DeletedBook = mongoose.model("DeletedBook", deletedBookSchema);
module.exports = DeletedBook;
