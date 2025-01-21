const { sendResponse } = require("../helpers/utils");
const {
  validationResult,
  check,
  body,
  param,
  query,
} = require("express-validator");
const mongoose = require("mongoose");
const { StatusCodes } = require("http-status-codes");
const moment = require("moment");
const validators = {};

validators.validate = (validationArray) => async (req, res, next) => {
  await Promise.all(validationArray.map((validation) => validation.run(req)));
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();

  const message = errors
    .array()
    .map((error) => error.msg)
    .join(" & ");
  return sendResponse(
    res,
    StatusCodes.UNPROCESSABLE_ENTITY,
    false,
    null,
    { message },
    "Validation Error"
  );
};

validators.validateObjectId = (...fields) => {
  return (req, res, next) => {
    for (const field of fields) {
      const id = req.params[field];
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return sendResponse(
          res,
          StatusCodes.BAD_REQUEST,
          false,
          null,
          { message: `Invalid ${field}` },
          "Validation Error"
        );
      }
    }
    next();
  };
};

// Validator for creating a book
validators.createBookValidator = [
  body('name')
    .notEmpty().withMessage('Name is required'),
  
  body('author')
    .notEmpty().withMessage('Author is required'),
  
  body('price')
    .notEmpty().withMessage('Price is required')
    .isFloat({ min: 0 }).withMessage('Price must be a positive number')
    .toFloat(),

  body('publicationDate')
    .notEmpty().withMessage('Publication Date is required')
    .isISO8601().withMessage('Invalid publication date format. Use YYYY-MM-DD')
    .toDate(),
  
  body('img')
   .optional({ checkFalsy: true })
    .isURL().withMessage('Invalid image URL'),
  
  body('description')
    .notEmpty().withMessage('Description is required'),
  
  body('discountRate')
    .optional()
    .isFloat({ min: 0, max: 100 }).withMessage('Discount rate must be between 0 and 100')
    .toFloat(),
  
  body('categoryId')
    .notEmpty().withMessage('Category ID is required')
    .isMongoId().withMessage('Invalid Category ID'),
];



module.exports = validators;
