const express = require("express");
const authentication = require("../middlewares/authentication");
const wishlistController = require("../controllers/wishlist.controller");

const router = express.Router();

router.use(authentication.guestIdMiddleware);

// 1. Add a book to the wishlist (for guest or logged-in users)
router.post("/add", authentication.guestIdMiddleware, wishlistController.addToWishlist);

// 2. Remove a book from the wishlist (for guest or logged-in users)
router.delete("/remove", wishlistController.removeFromWishlist);

// 3. Get the wishlist for a guest (using guestId) or logged-in user
router.get("/", authentication.guestIdMiddleware, wishlistController.getWishlist);

// 4. Sync wishlist after user logs in (sync between localStorage and server)
router.post("/sync", authentication.loginRequired, wishlistController.syncWishlist);

module.exports = router;
