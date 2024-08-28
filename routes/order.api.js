const express = require('express');
const router = express.Router();


/**
 * @route POST /orders/:id
 * @description Create a order
 * @body { books, shippingAddress }
 * @access User
 */



/**
 * @route GET /orders/
 * @description GET all order
 * @body none
 * @access admin
 */



/**
 * @route GET /orders/:userid
 * @description GET all order of a user
 * @body none
 * @access User , amdin
 */



/**
 * @route PUT /orders/:userid/:orderid
 * @description Update a order
 * @body { status }
 * @access User , amdin
 */


/**
 * @route DELETE /orders/:id
 * @description Cancel/delete an order by id
 * @body none
 * @access Admin
 */



module.exports = router