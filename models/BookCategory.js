const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const bookCategorySchema = new Schema({
    categoryId: {
        type: Schema.Types.ObjectId,
        ref: "Category",
        required: true,
      },
      bookId: {
        type: Schema.Types.ObjectId,
        ref: "Book",
        required: true,
      },
    
    isDeleted: {
        type: Boolean,
        default: false,
        select: false,
      },
},{ timestamps: true, }
  );

  const BookCategory = mongoose.model("BookCategory", bookCategorySchema);
module.exports = BookCategory;