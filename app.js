const express = require('express');
require("dotenv").config();
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require("cors")
const {sendResponse} = require("./helpers/utils")
const routes = require('./routes/index');
const { StatusCodes } = require("http-status-codes");


const indexRouter = require('./routes/index');

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());

const mongoose = require("mongoose");
const { error } = require('console');
const mongoURI = process.env.MONGODB_URI
mongoose.connect(mongoURI).then(() => console.log("DB connected")) .catch((error) => console.log(error))

app.use('/api', indexRouter);
//Errors Handlers
//Catch 404
app.use((req, res, next) => {
    const err = new Error("Not Found");
  err.statusCode = StatusCodes.NOT_FOUND;
  next(err);
})

app.use((err, req, res, next) => {
    console.log("Error", err);
    if (err.isOperational) {
      return sendResponse(
        res,
        err.statusCode ? err.statusCode : StatusCodes.INTERNAL_SERVER_ERROR,
        false,
        null,
        { message: err.message },
        err.errorType
      );
    } else {
      return sendResponse(
        res,
        err.statusCode ? err.statusCode : StatusCodes.INTERNAL_SERVER_ERROR,
        false,
        null,
        { message: err.message },
        "Internal Server Error"
      );
    }
  });

module.exports = app;
