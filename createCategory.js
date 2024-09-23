const mongoose = require("mongoose");
const csvtojson = require("csvtojson");
const fs = require("fs");
const Category = require("./models/Category");
require("dotenv").config();

const categories = [
  "Medical",
  "Art-Photography",
  "Biography",
  "Business-Finance-Law",
  "Childrens-Books",
  "Computing",
  "Crafts-Hobbies",
  "Crime-Thriller",
  "Dictionaries-Languages",
  "Entertainment",
  "Food-Drink",
  "Graphic-Novels-Anime-Manga",
  "Health",
  "Personal-Development",

  "Poetry-Drama",
];

mongoose.connect(process.env.MONGODB_URI, {
});
async function createCategory() {
  try {
    const categoryDocs = categories.map(c => ({ categoryName: c }));

    await Category.insertMany(categoryDocs);
    
    console.log("Categories inserted successfully");
  } catch (error) {
    console.error("Error inserting documents:", error);
  } finally {
    mongoose.disconnect();
  }
}

createCategory();