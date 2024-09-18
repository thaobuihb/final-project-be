const express = require("express");
const userController = require("../controllers/user.controller");
const router = express.Router();
const { body, param } = require("express-validator");
const validators = require("../middlewares/validators");
const authentication = require("../middlewares/authentication");

//user rigister
/**
 * @route POST /users
 * @description Register for a new account
 * @body {name, email, passsword}
 * @access Public
 */

router.post(
  "/",
  userController.register
);

/**
 * @route GET /users?page=1&limit=10
 * @description get all User with pagination
 * @access Admin
 */
router.get("/", authentication.loginRequired, authentication.authorize(["admin"]), userController.getUsers);

// get current user
/**
 * @route GET /users/me
 * @description get current user info
 * @access login required
 */
router.get("/me", authentication.loginRequired, userController.getCurrentUser);

/**
 * @route GET /users/:id
 * @description get a User by id
 * @body none
 * @access Public
 */
router.get(
  "/:id",
  authentication.loginRequired,
  validators.validateObjectId("id"),
  userController.getUserById);

/**
 * @route PUT /users/:id
 * @description update a user
 * @body none
 * @access User
 */
router.put(
  "/:id",
  authentication.loginRequired,
  validators.validateObjectId("id"),
  userController.updateUser
);
/**
 * @route DELETE /users/:id
 * @description delete a User
 * @body none
 * @access admin
 */
router.delete(
  "/:id",
  authentication.loginRequired,
  authentication.authorize(["admin"]),
  validators.validateObjectId("id"),
  userController.deleteUser
);
module.exports = router;
