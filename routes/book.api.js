const express = require("express");
const router = express.Router();
const bookController = require("../controllers/book.controller");
const authentication = require("../middlewares/authentication");
const validators = require("../middlewares/validators");

/**
 * @swagger
 * tags:
 *   name: Books
 *   description: Quản lý sách
 */

/**
 * @swagger
 * /books:
 *   post:
 *     summary: Thêm sách mới
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               author:
 *                 type: string
 *               price:
 *                 type: number
 *               publicationDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Tạo thành công
 */
router.post(
  "/",
  authentication.loginRequired,
  authentication.authorize(["admin"]),
  validators.validate(validators.createBookValidator),
  bookController.createBook
);

/**
 * @swagger
 * /books:
 *   get:
 *     summary: Lấy danh sách tất cả sách
 *     tags: [Books]
 *     responses:
 *       200:
 *         description: Thành công
 */
router.get("/", bookController.getAllBooks);

/**
 * @swagger
 * /books/best-seller:
 *   get:
 *     summary: Lấy sách bán chạy
 *     tags: [Books]
 *     responses:
 *       200:
 *         description: Thành công
 */
router.get("/best-seller", bookController.getBestSellerBooks);

/**
 * @swagger
 * /books/new-released:
 *   get:
 *     summary: Lấy sách mới phát hành
 *     tags: [Books]
 *     responses:
 *       200:
 *         description: Thành công
 */
router.get("/new-released", bookController.getNewlyReleasedBooks);

/**
 * @swagger
 * /books/discounted:
 *   get:
 *     summary: Lấy sách đang giảm giá
 *     tags: [Books]
 *     responses:
 *       200:
 *         description: Thành công
 */
router.get("/discounted", bookController.getDiscountedBooks);

/**
 * @swagger
 * /books/categories:
 *   get:
 *     summary: Lấy danh sách danh mục sách
 *     tags: [Books]
 *     responses:
 *       200:
 *         description: Thành công
 */
router.get("/categories", bookController.getCategoryOfBooks);

/**
 * @swagger
 * /books/{id}:
 *   get:
 *     summary: Lấy chi tiết sách theo ID
 *     tags: [Books]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Thành công
 */
router.get(
  "/:id",
  validators.validateObjectId("id"),
  bookController.getBookById
);

/**
 * @swagger
 * /books/category/{categoryId}:
 *   get:
 *     summary: Lấy sách theo danh mục
 *     tags: [Books]
 *     parameters:
 *       - name: categoryId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Thành công
 */
router.get("/category/:categoryId", bookController.getBooksByCategoryId);

/**
 * @swagger
 * /books/{id}:
 *   put:
 *     summary: Cập nhật thông tin sách
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               author:
 *                 type: string
 *               price:
 *                 type: number
 *               publicationDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 */
router.put(
  "/:id",
  authentication.loginRequired,
  authentication.authorize(["admin"]),
  validators.validateObjectId("id"),
  bookController.updateBook
);

/**
 * @swagger
 * /books/{id}:
 *   delete:
 *     summary: Xóa sách
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Xóa thành công
 */
router.delete(
  "/:id",
  authentication.loginRequired,
  authentication.authorize(["admin"]),
  validators.validateObjectId("id"),
  bookController.deleteBook
);

/**
 * @swagger
 * /books/wishlist:
 *   post:
 *     summary: Lấy danh sách sách theo danh sách ID (wishlist)
 *     tags: [Books]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bookIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Thành công
 */
router.post("/wishlist", bookController.getBooksByIds);

/**
 * @swagger
 * /books/carts:
 *   post:
 *     summary: Lấy danh sách sách theo danh sách ID (giỏ hàng)
 *     tags: [Books]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bookIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Thành công
 */
router.post("/carts", bookController.getBooksByCartIds);

/**
 * @swagger
 * /books/{bookId}/with-category:
 *   get:
 *     summary: Lấy chi tiết sách kèm theo các sách cùng danh mục
 *     tags: [Books]
 *     parameters:
 *       - name: bookId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Thành công
 */
router.get(
  "/:bookId/with-category",
  validators.validateObjectId("bookId"),
  bookController.getBookWithCategory
);

module.exports = router;
