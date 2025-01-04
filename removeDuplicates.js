const mongoose = require("mongoose");

// Kết nối đến MongoDB Atlas
const MONGODB_URI = "mongodb+srv://bookStore:Dinhngocankhue04092020@cluster0.hp9il.mongodb.net/book-store";
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const Book = mongoose.model("Book", new mongoose.Schema({}, { strict: false }));

const removeDuplicates = async () => {
  try {
    console.log("Đang kết nối đến cơ sở dữ liệu...");

    // Lấy các bản ghi trùng lặp
    const duplicates = await Book.aggregate([
      { $group: { _id: "$_id", count: { $sum: 1 }, docs: { $push: "$$ROOT" } } },
      { $match: { count: { $gt: 1 } } },
    ]);

    console.log(`Tìm thấy ${duplicates.length} bản ghi trùng lặp.`);

    for (const doc of duplicates) {
      const duplicatesToDelete = doc.docs.slice(1); // Giữ lại 1 bản ghi
      for (const duplicate of duplicatesToDelete) {
        await Book.deleteOne({ _id: duplicate._id });
        console.log(`Đã xóa sách với _id: ${duplicate._id}`);
      }
    }

    console.log("Xóa trùng lặp hoàn tất!");
  } catch (error) {
    console.error("Có lỗi xảy ra:", error);
  } finally {
    mongoose.disconnect();
  }
};

removeDuplicates();
