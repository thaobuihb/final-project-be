const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/review.controller");
const authentication = require("../middlewares/authentication");
const validators = require("../middlewares/validators");

/**
 * @route POST /reviews/:id
 * @description Create a new review
 * @body { bookId, comment }
 * @access User
 */
router.post(
  "/:userId",
  authentication.loginRequired,
  validators.validateObjectId("userId"),
  reviewController.createReview
);

/**
 * @route GET /reviews/
 * @description Get all review of a user
 * @body none
 * @access Public
 */
router.get("/", reviewController.getReview);

/**
 * @route PUT /reviews/:id
 * @description Update a review
 * @body { reviewId, comment }
 * @access User
 */
router.put(
  "/:userId",
  authentication.loginRequired,
  validators.validateObjectId("userId"),
  reviewController.updateReview
);

/**
 * @route DELETE /reviews/:id
 * @description Delete a review
 * @body { reviewId }
 * @access User
 */
router.delete(
  "/:userId/:reviewId",
  authentication.loginRequired,
  validators.validateObjectId("userId", "reviewId"),
  reviewController.deleteReview
);

module.exports = router;
