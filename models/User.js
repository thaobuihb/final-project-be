const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

const userSchema = new Schema(
  {
    name: { type: String },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      maxlength: 100,
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        "Email không hợp lệ",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      select: false,
    },    
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    oldPasswords: [{ type: String, select: false }],
    gender: { type: String, default: "" },
    birthday: { type: String, default: "" },
    city: { type: String, default: "" },
    state: { type: String, default: "" },
    district: { type: String, default: "" },
    ward: { type: String, default: "" },
    street: { type: String, default: "" },
    houseNumber: { type: String, default: "" },
    phone: { type: String, default: "" },
    zipcode: { type: String, default: "" },
    role: {
      type: String,
      enum: ["admin", "manager", "customer"],
      default: "customer",
    },
    isDeleted: { type: Boolean, default: false, select: false },
  },
  { timestamps: true, versionKey: false }
);

userSchema.methods.toJSON = function () {
  const user = this._doc;
  delete user.password;
  delete user.isDeleted;
  return user;
};

userSchema.methods.generateToken = async function () {
  const accessToken = await jwt.sign(
    { _id: this._id, role: this.role },
    JWT_SECRET_KEY,
    { expiresIn: "1d" }
  );
  return accessToken;
};
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});


const User = mongoose.model("User", userSchema);
module.exports = User;
