const mongoose = require("mongoose");
const csvtojson = require("csvtojson");
const fs = require("fs");
const Book = require("./models/Book");
const Category = require("./models/Category");
require("dotenv").config();

const csvFilePath = "./bookData2.csv";
const jsonFilePath = "./data.json";

mongoose
  .connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log("Connected to MongoDB Cloud");

    const jsonObj = await csvtojson().fromFile(csvFilePath);
    fs.writeFileSync(jsonFilePath, JSON.stringify(jsonObj, null, 2), "utf-8");
    console.log("Data has been written to data.json");

    const categories = await Category.find({});

    const updatedBooks = jsonObj.map((book) => {
      const bookCategoryLower = book.category.toLowerCase();

      const matchedCategory = categories.find(
        (category) => category.categoryName.toLowerCase() === bookCategoryLower
      );

      if (matchedCategory) {
        book.category = matchedCategory._id;
      } else {
        console.log(
          `Category "${book.category}" not found for book "${book.title}"`
        );
      }

      // Tính toán discountedPrice dựa trên discountRate và price
      const price = parseFloat(book.price); // Chuyển đổi price thành số
      const discountRate = parseFloat(book.discountRate) || 0; // Chuyển đổi discountRate thành số

      // Nếu discountRate tồn tại và lớn hơn 0, tính discountedPrice
      if (discountRate > 0) {
        book.discountedPrice = price - (price * discountRate) / 100;
      } else {
        book.discountedPrice = price; // Nếu không có giảm giá, discountedPrice là giá gốc
      }

      // console.log('Book to be inserted:', book);
      return book;
    });

    await Book.insertMany(updatedBooks);
    console.log("Books have been inserted into the database");

    mongoose.disconnect();
  })
  .catch((error) => {
    console.error("Error during the process:", error);
    mongoose.disconnect();
  });
