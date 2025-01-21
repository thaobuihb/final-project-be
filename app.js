const express = require('express');
require("dotenv").config();
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require("cors")
const {sendResponse} = require("./helpers/utils")
const { StatusCodes } = require("http-status-codes");

const indexRouter = require('./routes/index');

const app = express();


app.use(cors());
app.use(express.json());  
app.use(express.urlencoded({ extended: true }));  
app.use(logger('dev'));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

const mongoose = require("mongoose");
const mongoURI = process.env.MONGODB_URI
mongoose.connect(mongoURI)
  .then(() => console.log("DB connected")) 
  .catch((error) => console.log(error));

app.use('/api', indexRouter);

// Catch 404 Error Handler
app.use((req, res, next) => {
  console.log("Request Body:", req.body);
  const err = new Error("Not Found");
  err.statusCode = StatusCodes.NOT_FOUND;
  next(err);
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.log("Error:", err);
    if (err.isOperational) {
      return sendResponse(
        res,
        err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
        false,
        null,
        { message: err.message },
        err.errorType
      );
    } else {
      return sendResponse(
        res,
        err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
        false,
        null,
        { message: err.message },
        "Internal Server Error"
      );
    }
});

module.exports = app;
