const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.status(200).send("Welcome to BookStore!")
});

//authAPI
const authAPI = require("./auth.api");
router.use("/auth", authAPI)

//userAPI
const userAPI = require("./user.api");
router.use("/users", userAPI)

//bookAPI
const bookAPI = require("./book.api");
router.use("/books", bookAPI)

//cartAPI
const cartAPI = require("./cart.api");
router.use("/carts", cartAPI)

//categoryAPI
const categoryAPI = require("./category.api");
router.use("/categories", categoryAPI)

//orderAPI
const orderAPI = require("./order.api");
router.use("/orders", orderAPI)

//reviewAPI
const reviewAPI = require("./review.api");
router.use("/reviews", reviewAPI)

//wishlistAPI
const wishlistAPI = require("./wishlist.api")
router.use("/wishlist", wishlistAPI)

//adminAPI
const adminAPI = require("./admin.api")
router.use("/admin", adminAPI)

module.exports = router
