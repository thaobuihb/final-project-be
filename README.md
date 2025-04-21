- [User Story](#book-store)

    - [Authentication](#auth)
    - [User](#user)
    - [Book](#book)
    - [Category](#catogery)
    - [Review](#review)
    - [Cart](#cart)
    - [Order](#order)

- [API endpoints](#api-endpoints)
    - [Auth API](#auth-api)
    - [User API](#user-apis)
    - [Book API](#book-apis)
    - [Category API](#category-apis)
    - [Review API](#review-apis)
    - [Cart API](#cart-apis)
    - [Order API](#order-apis)

- [Entity Relationship Diagram](#entity-relationship-diagram)
- [Công nghệ & Thư viện backend](#công-nghệ-thư-viện-backend)

# BOOK STORE
Cửa hàng sách trực tuyến của tôi là ứng dụng cung cấp một bộ sưu tập phong phú các cuốn sách thuộc nhiều thể loại khác nhau, cho phép người dùng dễ dàng tìm kiếm, đặt mua sách theo ý muốn.
Tính năng hy vọng sẽ phát triển trong tương lai là cho phép người mua sách thanh toán linh hoạt bằng nhiều hình thức khác nhau.



## Auth

- Là người dùng, tôi có thể đăng nhập bằng email và mật khẩu của mình.
- Với tư cách là người dùng, tôi có thể đăng ký tài khoản mới bằng email và mật khẩu.
- Là người dùng, tôi có thể duy trì trạng thái đăng nhập sau khi làm mới trang.
- Ngườ dùng có thể đặt lại mật khẩu nếu bị quên

## User

- Là quản trị viên, tôi có thể lấy được tất cả người dùng đã đăng ký trên hệ thống.
- Với tư cách là quản trị viên, tôi có thể xóa một người dùng.
- Với tư cách là quản trị viên tôi có thể thêm quản lý, thay đổi vai trò của người dùng thành quản và ngược laị
- Là người dùng, tôi có thể xem hồ sơ của mình.
- Là người dùng, tôi có thể cập nhật hồ sơ của mình.

## Book

- Là quản trị viên, tôi có thể tạo một cuốn sách mới bao gồm việc nhập tiêu đề, tác giả, mô tả và giá cả, danh mục.
- Là quản trị viên, tôi có thể cập nhật một cuốn sách.
- Là quản trị viên, tôi có thể xóa một cuốn sách.
- Là người dùng hoặc quản trị viên, tôi có thể xem danh sách tất cả sách có sẵn trên cửa hàng.
- Là người dùng hoặc quản trị viên, tôi có thể xem chi tiết của một cuốn sách cụ thể.

## Catogery

- Là người dùng, tôi có thể xem tất cả các danh mục sách có sẵn, giúp dễ dàng tìm kiếm sách theo thể loại.
- Là người dùng, tôi có thể xem các sách thuộc một danh mục cụ thể, giúp tôi tìm kiếm sách theo thể loại yêu thích.
- Là quản trị viên, tôi có thể tạo một danh mục sách mới để phân loại sách theo các thể loại mới.
- Là quản trị viên, tôi có thể cập nhật một danh mục.
- Là quản trị viên, tôi có thể xóa một danh mục.

## Cart

- Là người dùng, tôi có thể xem giỏ hàng của mình.
- Là người dùng, tôi có thể cập nhật sách vào giỏ hàng của mình (tăng giảm số lượng).
- Là người dùng, tôi có thể xoá cuốn sách khỏi giỏ hàng

## Order

- Là quản trị viên, tôi có thể xem tất cả các đơn hàng của người dùng
- Là Quản trị viên, tôi có thể cập nhật trạng thái đơn hàng
- Là quản trị viên, tôi có thể xoá đơn hàng
- Là người dùng, tôi có thể tạo đơn hàng.
- Là người dùng, tôi có thể xem tất cả các đơn hàng của mình.
- Là người dùng, tôi có thể xem chi tiết của một đơn hàng cụ thể để biết thêm thông tin về sách và trạng thái đơn hàng.
- Là người dùng, tôi có thể hủy đơn hàng của mình nếu đơn hàng chưa được thanh toán hoặc gửi đi.
- Là người dùng tôi có thể xem lịch sử mua hàng


## Công nghệ sử dụng

- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- BcryptJS (mã hóa mật khẩu)
- Multer (upload ảnh sách nếu có)
- Express-validator (xác thực dữ liệu)
- dotenv (biến môi trường)


##  Cài đặt & Chạy dự án

### Yêu cầu:
- Node.js: >=V22.1.0
- NPM: >=10.8.1
- MongoDB (local hoặc MongoDB Atlas)

### Các bước thực hiện:

```bash
git clone https://github.com/thaobuihb/final-project-be.git
cd final-project-be
npm install
```

### Tạo file `.env`:

```env
PORT=5001
MONGODB_URI="mongodb+srv://bookStore:Dinhngocankhue04092020@cluster0.hp9il.mongodb.net/"
JWT_SECRET_KEY="nscefeufycwefcy3847bcsnxm.czdmimx;/c"
```

### Chạy server:

```bash
npm run dev
```

Truy cập tại: `http://localhost:5001`


## Lộ trình phát triển 
- [ ] Hoàn thiện phần Review, đánh giá sách của người dùng
- [ ] Tích hợp thanh toán thực tế (VNPAY, MoMo, PayPal)
- [ ] Gửi email xác nhận đơn hàng
- [ ] Tạo log chi tiết bằng Winston
- [ ] Tách hệ thống phân quyền linh hoạt hơn (editor, owner)
- [ ] Đọc sách online hoặc nghe audio từ backend (streaming)


# API endpoints

## Auth api

```js
/**
 * @route POST /auth/login
 * @description Log in with username and password
 * @body {email, passsword}
 * @access Public
 */
```
```js
/**
 * @route POST /forgot-password
 * @description Send password reset link
 * @body {email}
 * @access Public
 */
```
```js
/**
 * @route POST /reset-password
 * @description Reset user password
 * @body {token, password}
 * @access Public
 */
```

## User apis

```js
/**
 * @route POST /users
 * @description Register for a new account
 * @body {name, email, passsword}
 * @access Public
 */
```
```js

```


```js
/**
 * @route GET /users
 * @description get all User
 * @body none
 * @access admin
 */
```

```js
/**
 * @route GET /users/me
 * @description get current user info
 * @access login required
 */
```


```js
/**
 * @route GET /users/:id
 * @description get a User by id
 * @body none
 * @access Public
 */
```

```js
/**
 * @route PUT /users/:id
 * @description update a user
 * @body none
 * @access User
 */
```

```javaScript
/**
 * @route DELETE /users/:id
 * @description delete a User
 * @body none
 * @access admin
 */
```

## Book apis

```javaScript
/**
 * @route POST /books/
 * @description Create a new book
 * @body { name, author, price, publicationDate... }
 * @access admin
 */
```

```javaScript
/**
 * @route GET /books
 * @description Get all books
 * @body none
 * @access Public
 */
```

```javaScript
/**
 * @route GET /books/:id
 * @description Get book by id
 * @body none
 * @access Public
 */
```

```javaScript
/**
 * @route PUT /books/:id
 * @description Update a book
 * @body { name, author, price, publicationDate... }
 * @access admin
 */
```

```javaScript
/**
 * @route DELETE /books/:id
 * @description Delete a book
 * @body none
 * @access admin
 */
```

## Category apis

```javaScript
/**
 * @route POST /categories/
 * @description create a new category
 * @body { categoryName, description }
 * @access admin
 */
```

```javaScript
/**
 * @route GET /categories/
 * @description Get all category
 * @body none
 * @access Public
 */
```

```javaScript
/**
 * @route GET /categories/:id
 * @description Get a category by id
 * @body none
 * @access Public
 */
```

```javaScript
/**
 * @route PUT /categories/:id
 * @description Update a category by id
 * @body { categoryName, description }
 * @access Admin
 */
```

```javaScript
/**
 * @route DELETE /categories/:id
 * @description Delete a category by id
 * @body none
 * @access Admin
 */
```

## Review apis

```javaScript
/**
 * @route POST /reviews/:userId
 * @description Create a new review
 * @body { bookId, comment }
 * @access User
 */
```

```javaScript
/**
 * @route GET /reviews
 * @description Get all review of a user
 * @body none
 * @access Public
 */
```

```javaScript
/**
 * @route PUT /reviews/:userId
 * @description Update a review
 * @body { reviewId, comment }
 * @access User
 */
```

```javaScript
/**
 * @route DELETE /reviews/:userId
 * @description Delete a review
 * @body { reviewId }
 * @access User
 */
```

## Cart apis

```javaScript
/**
 * @route POST /carts/:userId
 * @description Add/update book in the cart
 * @body { bookId, quantity }
 * @access User
 */
```

```javaScript
/**
 * @route GET /carts/:userId
 * @description Get user's cart
 * @body none
 * @access User
 */
```

```javaScript
/**
 * @route DELETE /carts/:userId
 * @description Remove a book from the cart
 * @body none
 * @access User
 */

```

## Order apis

```javaScript
/**
 * @route POST /orders/:id
 * @description Create a order
 * @body { books, shippingAddress, paymentMethods }
 * @access User
 */
```

```javaScript
/**
 /**
 * @route GET /orders/:userId
 * @description GET all order of a user
 * @body none
 * @access User
 */
 */
```

```javaScript
/**
 * @route GET /orders/:userId/:orderId
 * @description Get a order of a user
 * @body { status }
 * @access User , amdin
 */
```
```javaScript
/**
 * @route Put /orders/:id
 * @description Cancer a order
 * @body none
 * @access user
 */
```

```javaScript
/**
 * @route GET /orders/
 * @description GET all order by admin
 * @body none
 * @access admin
 */
```
```javaScript
/**
 * @route  Put/orders/:orderId
 * @description Update Order for Admin
 * @body none
 * @access Admin
 */
```

```javaScript
/**
 * @route DELETE /orders/:orderId
 * @description Cancel/delete an order by id
 * @body none
 * @access Admin
 */
```


## Entity Relationship Diagram

![ERD](./screenshot.png)

## Công Nghệ Sử Dụng (Backend)

- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- BcryptJS (mã hóa mật khẩu)
- Joi + express-validator (xác thực dữ liệu)
- Multer (upload ảnh nếu có)
- dotenv (quản lý biến môi trường)
- Winston (ghi log – dự kiến)

---

## 📦 Các thư viện sử dụng (Backend)

### 🚀 Core
- express
- cors
- morgan
- dotenv
- cookie-parser

### 🗃️ Database
- mongoose

### 🔐 Xác thực & Bảo mật
- jsonwebtoken
- bcryptjs
- express-rate-limit
- uuid

### 🧾 Validate & Format
- joi
- express-validator
- http-status-codes
- moment

### 🛠 Tiện ích & Công cụ
- axios
- csvtojson
- debug
- nodemon
