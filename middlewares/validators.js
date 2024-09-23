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
    .isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  
  body('publicationDate')
    .notEmpty().withMessage('Publication Date is required')
    .custom((value) => {
      // Kiểm tra định dạng MM/DD/YYYY bằng regex
      const dateFormatRegex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/\d{4}$/;
      if (!dateFormatRegex.test(value)) {
        throw new Error('Invalid publication date format. Use MM/DD/YYYY');
      }

      // Kiểm tra nếu ngày tồn tại hợp lệ (ví dụ không phải ngày 30/02)
      if (!moment(value, 'MM/DD/YYYY', true).isValid()) {
        throw new Error('Invalid date. Please provide a valid MM/DD/YYYY date.');
      }
      return true;
    }),
  
  body('img')
    .notEmpty().withMessage('Image URL is required')
    .isURL().withMessage('Invalid image URL'),
  
  body('description')
    .notEmpty().withMessage('Description is required'),
  
  body('discountRate')
    .optional()
    .isFloat({ min: 0, max: 100 }).withMessage('Discount rate must be between 0 and 100'),
  
  body('categoryId')
    .notEmpty().withMessage('Category ID is required')
    .isMongoId().withMessage('Invalid Category ID'),
];


module.exports = validators;
