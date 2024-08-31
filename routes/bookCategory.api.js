const express = require("express");
const router = express.Router();
const bookCategoryController = require("../controllers/bookCategory.controller");


/**
 * @route POST /bookCategory/
 * @description Create a new bookCategory
 * @body { bookId, categoryIds }
 * @access Admin
 */
router.post("/", 
// authentication.loginRequired,
// authentication.authorize(["admin"]),
bookCategoryController.createBookCategory);

/**
 * @route GET /bookCategory/
 * @description Get all bookCategory
 * @body none
 * @access Admin
 */
router.get("/", 
// authentication.loginRequired,
// authentication.authorize(["admin"]),
bookCategoryController.getAllBookCategories);


/**
 * @route Put /bookCategory/:id
 * @description Update bookCategory
 * @body {bookId}
 * @access Admin
 */
router.put("/:bookId", 
// authentication.loginRequired,
// authentication.authorize(["admin"]),
bookCategoryController.updateBookCategory);

/**
 * @route DELETE /bookCategory/:id
 * @description DELETE a bookCategory
 * @body none
 * @access Admin
 */
router.delete("/", 
// authentication.loginRequired,
// authentication.authorize(["admin"]),
bookCategoryController.deleteBookCategory);

module.exports = router;
