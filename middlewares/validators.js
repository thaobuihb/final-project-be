const {sendResponse} = require("../helpers/utils");
const { validationResult, check, body, param, query } = require("express-validator");
const mongoose = require("mongoose");
const { StatusCodes } = require("http-status-codes");


const validators = {};

validators.validate = (validationArray) => async (req, res, next) => {
    await Promise.all(validationArray.map((validation) => validation.run(req)));
    const errors = validationResult(req);
    if (errors.isEmpty()) return next();
  
    const message = errors
      .array()
      .map((error) => error.msg)
      .join(" & ");
    return sendResponse(res, StatusCodes.UNPROCESSABLE_ENTITY, false, null, { message }, "Validation Error");
  };

  validators.checkObjectId = (paramId) => {
    if (!mongoose.Types.ObjectId.isValid(paramId)) {
      throw new Error("Invalid ObjectId")
    }
    return true;
  }

  // Validator for creating a book
validators.createBookValidator = [
  body('name').notEmpty().withMessage('Name is required'),
  body('author').notEmpty().withMessage('Author is required'),
  body('price').notEmpty().withMessage('Price is required')
              .isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('publicationDate').notEmpty().withMessage('Publication Date is required')
              .isISO8601().withMessage('Invalid publication date'),
  body('img').notEmpty().withMessage('Image URL is required')
             .isURL().withMessage('Invalid image URL'),
  body('description').notEmpty().withMessage('Description is required')
];

  module.exports = validators;

