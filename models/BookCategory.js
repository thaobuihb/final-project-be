const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const bookCategorySchema = new Schema({},{ timestamps: true, }
  );

  const BookCategory = mongoose.model("BookCategory", bookCategorySchema);
module.exports = BookCategory;