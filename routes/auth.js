const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');

// public routes
router.post('/registration', register);
router.post('/login', login);

module.exports = router;
