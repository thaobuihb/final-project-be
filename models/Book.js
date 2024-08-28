const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const bookSchema = new Schema({

    name: {
        type: String,
        required: true,
      },
      author: {
        type: String,
        required: true,
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
      stock: { 
          type: Number, required: true, min: 0 
      }, // QL tồn kho
      discountedPrice: { type: Number }, // giá giảm

    isDeleted: {
        type: Boolean,
        default: false,
        select: false,
      },
},{ timestamps: true, }
  );

  const Book = mongoose.model("Book", bookSchema);
module.exports = Book;