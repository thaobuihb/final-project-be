const mongoose = require("mongoose");
const csvtojson = require("csvtojson");
const fs = require("fs");
const Book = require("./models/Book");
const Category = require("./models/Category");
require("dotenv").config();

const csvFilePath = "./bookData4.csv";
const jsonFilePath = "./data.json";

mongoose
  .connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log("✅ Connected to MongoDB Cloud");

    const jsonObj = await csvtojson({ delimiter: ";" }).fromFile(csvFilePath);
    fs.writeFileSync(jsonFilePath, JSON.stringify(jsonObj, null, 2), "utf-8");
    console.log("✅ Data has been written to data.json");

    const categories = await Category.find({});
    const categoryMap = categories.reduce((map, category) => {
      map[category.categoryName.toLowerCase()] = category._id;
      return map;
    }, {});

    await Book.deleteMany({});
    console.log("✅ Old books have been deleted");

    const uniqueISBNs = new Set();
    const updatedBooks = jsonObj
      .map((book) => {
        if (
          !book.Isbn ||
          book.Isbn.trim() === "" ||
          uniqueISBNs.has(book.Isbn) ||
          book.Isbn.toLowerCase() === "null"
        ) {
          console.log(
            `⚠️ Skipping book due to missing/duplicate ISBN: ${book.name}`
          );
          return null; 
        }
        uniqueISBNs.add(book.Isbn.trim());

        if (!book.category) {
          console.log(
            `⚠️ Missing category for book: ${book.name || "Unknown Title"}`
          );
          book.category = "unknown";
          book.categoryName = "Unknown Category";
        }

        const bookCategoryLower = book.category.toLowerCase();
        const matchedCategory = categoryMap[bookCategoryLower];

        if (matchedCategory) {
          book.category = matchedCategory;
          const categoryObj = categories.find(
            (cat) => cat._id.toString() === matchedCategory.toString()
          );
          book.categoryName = categoryObj
            ? categoryObj.categoryName
            : book.category;
        }

        const price = parseFloat(book.price) || 0;
        const discountRate = parseFloat(book.discountRate) || 0;
        book.discountedPrice =
          discountRate > 0
            ? parseFloat((price - (price * discountRate) / 100).toFixed(2))
            : price;

        return book;
      })
      .filter((book) => book !== null); 

    
    await Book.insertMany(updatedBooks);

    
    await mongoose.disconnect();
  })
  .catch((error) => {
    console.error("❌ Error during the process:", error);
    mongoose.disconnect();
  });
