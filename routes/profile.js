const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { getProfile, updateProfile, uploadImage } = require('../controllers/profileController');
const upload = require('../middleware/uploadImageMiddleware');

// Protected routes
router.get('/profile', auth, getProfile);
router.put('/profile/update', auth, updateProfile);
router.put('/profile/image', auth, upload.single('file'), uploadImage);

module.exports = router;
