const Review = require("../models/Review");
const { sendResponse, catchAsync, AppError } = require("../helpers/utils");
const { StatusCodes } = require("http-status-codes");


const reviewController = {};

// Create a new review
reviewController.createReview = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { bookId, comment, name } = req.body;

  const review = new Review({
    bookId,
    userId: id,
    name,
    comment,
  });

  const savedReview = await review.save();

  sendResponse(
    res,
    StatusCodes.OK,
    true,
    savedReview,
    null,
    "Review created successfully"
  );
});

// Route for getting all review
reviewController.getReview = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const review = await Review.find({ userId: id, isDeleted: false });

  if (!review) {
    throw new AppError(StatusCodes.NOT_FOUND, "Can not get Review", "Review Error");
  }

  // Send the response with the review
  sendResponse(res, StatusCodes.OK, true, review, null, "get Review successfully");
});

// Update a review
reviewController.updateReview = catchAsync(async (req, res, next) => {
  const { reviewId, comment } = req.body;
  const { id } = req.params;

  const review = await Review.findOneAndUpdate(
    { _id: reviewId, userId: id, isDeleted: false },
    { comment },
    { new: true }
  );

  if (!review) {
    throw new AppError(StatusCodes.NOT_FOUND, "Review not found", "Review Error");
  }

  sendResponse(res, StatusCodes.OK, true, review, null, "Review updated successfully");
});

// Delete a review
reviewController.deleteReview = catchAsync(async (req, res, next) => {
  const { id, reviewId } = req.params;

  const review = await Review.findOneAndUpdate(
    { _id: reviewId, userId: id, isDeleted: false },
    { isDeleted: true },
    { new: true }
  );

  if (!review) {
    throw new AppError(StatusCodes.NOT_FOUND, "Review not found", "Review Error");
  }

  sendResponse(res, StatusCodes.OK, true, null, null, "Review deleted successfully");
});
module.exports = reviewController;