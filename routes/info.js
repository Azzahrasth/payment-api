const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { getBanners, getServices } = require('../controllers/infoController');

// public routes
router.get('/banner', getBanners);

// protected routes
router.get('/services', auth, getServices);

module.exports = router;
