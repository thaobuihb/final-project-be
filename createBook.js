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
    const categoryMap = categories.reduce((map, category) => {
      map[category.categoryName.toLowerCase()] = category._id;
      return map;
    }, {});

    // Xóa dữ liệu cũ
    await Book.deleteMany({});
    console.log("Old books have been deleted");

    const updatedBooks = jsonObj.map((book) => {
      const bookCategoryLower = book.category.toLowerCase();
      const matchedCategory = categoryMap[bookCategoryLower];

      if (matchedCategory) {
        book.category = matchedCategory;
        
        const categoryObj = categories.find(cat => cat._id.toString() === matchedCategory.toString());
        if (categoryObj) {
          book.categoryName = categoryObj.categoryName; 
        }
      } else {
        console.log(
          `Category "${book.category}" not found for book "${book.title}"`
        );
      }

      const price = parseFloat(book.price); 
      const discountRate = parseFloat(book.discountRate) || 0; 

      if (discountRate > 0) {
        book.discountedPrice = price - (price * discountRate) / 100;
      } else {
        book.discountedPrice = price; 
      }

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
