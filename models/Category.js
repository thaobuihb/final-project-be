const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const categorySchema = new Schema(
  {
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
  },
  { timestamps: true,
    versionKey: false },
);

categorySchema.methods.toJSON = function () {
  const category = this._doc;
  delete category.isDeleted;
  return category;
};

const Category = mongoose.model("Category", categorySchema);
module.exports = Category;
