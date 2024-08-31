const express = require('express');
const router = express.Router();
const reviewController = require("../controllers/review.controller")


/**
 * @route GET /reviews/:id
 * @description Get all review of a user
 * @body none
 * @access Public
 */
router.get("/:id", reviewController.getReview);



/**
 * @route POST /reviews/:id
 * @description Create a new review
 * @body { bookId, comment }
 * @access User
 */
router.post("/:id", reviewController.createReview);




/**
 * @route PUT /reviews/:id
 * @description Update a review
 * @body { reviewId, comment }
 * @access User
 */
router.put("/:id", reviewController.updateReview);



/**
 * @route DELETE /reviews/:id
 * @description Delete a review
 * @body { reviewId }
 * @access User
 */
router.delete("/:id/:reviewId", reviewController.deleteReview);


module.exports = router