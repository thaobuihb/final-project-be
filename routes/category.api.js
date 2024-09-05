const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/category.controller");
const authentication = require("../middlewares/authentication");

/**
 * @route POST /category/
 * @description Create a new category
 * @body { bookId, categoryIds }
 * @access Admin
 */
router.post(
  "/",
  authentication.loginRequired,
  authentication.authorize(["admin"]),
  categoryController.createCategory
);

/**
 * @route GET /category/
 * @description Get all category
 * @body none
 * @access Public
 */
router.get("/", categoryController.getAllCategories);

/**
 * @route GET /category/
 * @description Get category by ID
 * @body none
 * @access Public
 */
router.get("/:id", categoryController.getAllCategories);

/**
 * @route PUT /bookCategory/
 * @description Update category
 * @body none
 * @access Admin
 */
router.put(
  "/:id",
  authentication.loginRequired,
  authentication.authorize(["admin"]),
  categoryController.updateCategory
);

/**
 * @route DELETE /category/:id
 * @description DELETE a bookCategory
 * @body none
 * @access Admin
 */
router.delete(
  "/:id",
  authentication.loginRequired,
  authentication.authorize(["admin"]),
  categoryController.deleteCategory
);

module.exports = router;
