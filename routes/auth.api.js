const express = require('express');
const authController = require('../controllers/auth.controller');
const router = express.Router();
const { body } = require("express-validator");
const validators = require("../middlewares/validators");


/**
 * @route POST /login
 * @description Log in with username and password
 * @body {email, passsword}
 * @access Public
 */

router.post("/login", 
validators.validate([
    body("email")
    .exists()
      .isEmail()
      .withMessage("Invalid email address")
      .normalizeEmail({gmail_remove_dots: false}),
    body("password", "Invalid Password")
      .exists()
      .notEmpty()
      .withMessage("Password is required")
      .isLength({ min: 6 })
      .withMessage("Wrong password"),
  ]),
authController.loginWithEmail)

module.exports = router