const express = require("express");
const userController = require("../controllers/user.controller");
const router = express.Router();
const { body } = require("express-validator");
const validators = require("../middlewares/validators");

/**
 * @route POST /users
 * @description Register for a new account
 * @body {name, email, passsword}
 * @access Public
 */

router.post(
  "/",
  validators.validate([
    body("name").notEmpty().withMessage("Name is required"),
    body("email")
    .exists()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Invalid email address"),
    body("password")
      .notEmpty()
      .withMessage("Password is required")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
  ]),
  userController.register
);

/**
 * @route GET /users
 * @description get all User
 * @body none
 * @access admin
 */

/**
 * @route GET /users/:id
 * @description get a User by id
 * @body none
 * @access Public
 */

/**
 * @route PUT /users/:id
 * @description update a user
 * @body none
 * @access User
 */

/**
 * @route DELETE /users/:id
 * @description delete a User
 * @body none
 * @access admin
 */

module.exports = router;
