const express = require("express");
const authentication = require("../middlewares/authentication");
const wishlistController = require("../controllers/wishlist.controller")


const router = express.Router();

router.post("/create", wishlistController.createWishlist);
router.post("/add", wishlistController.addToWishlist);
router.get("/", wishlistController.getWishlist);
router.delete("/remove", wishlistController.removeFromWishlist);

module.exports = router;