const express = require('express');
const { sendMessage, getHistory } = require('../controllers/chatController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// Apply auth middleware to all routes in this file
router.use(authMiddleware);

router.post('/message', sendMessage);
router.get('/history', getHistory);

module.exports = router;
