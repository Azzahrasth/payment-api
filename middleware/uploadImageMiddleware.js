const multer = require('multer');
const path = require('path');

// Konfigurasi multer 
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname); // ambil ekstensi asli
    cb(null, `${Date.now()}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null, true);
  } else {
    cb(new Error('Format Image tidak sesuai'));
  }
};

const uploadImages = multer({ storage, fileFilter });

module.exports = uploadImages;
