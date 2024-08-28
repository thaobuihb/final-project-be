const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const categorySchema = new Schema({
    categoryName: {
        type: String,
        required: true,
      },
      description: {
        type: String,
        required: true,
      },
    isDeleted: {
        type: Boolean,
        default: false,
        select: false,
      },
},{ timestamps: true, }
  );

  const Category = mongoose.model("Category", categorySchema);
module.exports = Category;