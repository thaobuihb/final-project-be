# BOOK STORE
Cửa hàng sách trực tuyến của tôi là ứng dụng cung cấp một bộ sưu tập phong phú các cuốn sách thuộc nhiều thể loại khác nhau, cho phép người dùng dễ dàng tìm kiếm, đặt mua và thanh toán sách theo ý muốn.

## Xác thực

- Là người dùng, tôi có thể đăng nhập bằng email và mật khẩu của mình.
- Với tư cách là người dùng, tôi có thể đăng ký tài khoản mới bằng email và mật khẩu.
- Là người dùng, tôi có thể duy trì trạng thái đăng nhập sau khi làm mới trang.

## Người dùng

- Là quản trị viên, tôi có thể lấy được tất cả người dùng đã đăng ký trên hệ thống.
- Với tư cách là quản trị viên, tôi có thể xóa một người dùng.
- Là người dùng, tôi có thể xem hồ sơ của mình.
- Là người dùng, tôi có thể cập nhật hồ sơ của mình.

## Book

- Là quản trị viên, tôi có thể tạo một cuốn sách mới bao gồm việc nhập tiêu đề, tác giả, nhà xuất bản, mô tả và giá cả.
- Là quản trị viên, tôi có thể cập nhật một cuốn sách.
- Là quản trị viên, tôi có thể xóa một cuốn sách.
- Là người dùng hoặc quản trị viên, tôi có thể xem danh sách tất cả sách có sẵn trên cửa hàng.
- Là người dùng hoặc quản trị viên, tôi có thể xem chi tiết của một cuốn sách cụ thể.

## Card

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

## Review

- Là người dùng, tôi có thể tạo nhận xét về một cuốn sách.
- Là người dùng, tôi có thể xem các bình luận về cuốn sách mà không cần đăng nhập.
- Là người dùng, tôi có thể chỉnh sửa các nhận xét của mình để cập nhật ý kiến hoặc thông tin mới.
- Là người dùng, tôi có thể xóa nhận xét của mình.

## Catogery

- Là người dùng, tôi có thể xem tất cả các danh mục sách có sẵn, giúp dễ dàng tìm kiếm sách theo thể loại.
- Là người dùng, tôi có thể xem các sách thuộc một danh mục cụ thể, giúp tôi tìm kiếm sách theo thể loại yêu thích.
- Là quản trị viên, tôi có thể tạo một danh mục sách mới để phân loại sách theo các thể loại mới.
- Là quản trị viên, tôi có thể cập nhật một danh mục.
- Là quản trị viên, tôi có thể xóa một danh mục.


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

## User apis

```javaScript
/**
 * @route POST /users
 * @description Register for a new account
 * @body {name, email, passsword}
 * @access Public
 */
```

```javaScript
/**
 * @route GET /users
 * @description get all User
 * @body none
 * @access admin
 */
```

```javaScript
/**
 * @route GET /users/me
 * @description get current user info
 * @access login required
 */
```


```javaScript
/**
 * @route GET /users/:id
 * @description get a User by id
 * @body none
 * @access Public
 */
```

```javaScript
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

## Cart api

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


## Entity Relationship Diagram

![Alt text](./screenshot.png)
