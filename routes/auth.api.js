const express = require('express');
const router = express.Router();

/**
 * @route POST /auth/login
 * @description Log in with username and password
 * @body {email, passsword}
 * @access Public
 */

module.exports = router