const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const {
  getBalance,
  topUp,
  makeTransaction,
  getHistory
} = require('../controllers/transactionController');

// protected routes
router.get('/balance', auth, getBalance);
router.post('/topup', auth, topUp);
router.post('/transaction', auth, makeTransaction);
router.get('/transaction/history', auth, getHistory);

module.exports = router;
