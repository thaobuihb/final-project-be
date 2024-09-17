const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const reviewSchema = new Schema(
    {
        bookId: {
            type: Schema.Types.ObjectId,
            ref: "Book",
            required: true,
          },
          userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
          },
          name: {
            type: String,
            required: true,
          },
          comment: {
            type: String,
            required: true,
          },
        isDeleted: {
            type: Boolean,
            default: false,
            select: false,
          },
    },
    {
      timestamps: true,
      versionKey: false
    }
  );

  const Review = mongoose.model("Review", reviewSchema);
module.exports = Review;