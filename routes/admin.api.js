const express = require("express");
const adminController = require("../controllers/adminController");
const authentication = require("../middlewares/authentication");

const router = express.Router();

// Route cho admin dashboard
router.get(
  "/dashboard",
  authentication.loginRequired,
  authentication.authorize(["admin"]),
  adminController.getDashboardData
);

// Route lấy danh sách sách
router.get(
  "/books",
  authentication.loginRequired,
  authentication.authorize(["admin"]),
  adminController.getBooks
);

// Route xoá sách tạm thời (soft delete)
router.delete(
  "/books/:bookId",
  authentication.loginRequired,
  authentication.authorize(["admin"]),
  adminController.softDeleteBook
);

// Route lấy danh sách sách đã xóa
router.get(
  "/deleted-books",
  authentication.loginRequired,
  authentication.authorize(["admin"]),
  adminController.getDeletedBooks
);

// Route phục hồi sách đã xóa
router.post(
  "/deleted-books/restore/:id",
  authentication.loginRequired,
  authentication.authorize(["admin"]),
  adminController.restoreBook
);

// Route xoá vĩnh viễn sách
router.delete(
  "/deleted-books/:id",
  authentication.loginRequired,
  authentication.authorize(["admin"]),
  adminController.permanentlyDeleteBook
);

module.exports = router;
