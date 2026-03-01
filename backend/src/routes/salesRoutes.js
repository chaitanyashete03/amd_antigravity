const express = require('express');
const multer = require('multer');
const { getSales, createSale, bulkUploadSales } = require('../controllers/salesController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// Configure multer to use RAM (buffer) instead of saving to disk
// so we can parse it directly
const upload = multer({ storage: multer.memoryStorage() });

router.use(authMiddleware);

router.route('/')
    .get(getSales)
    .post(createSale);

// Endpoint expects form-data with key 'file'
router.post('/upload', upload.single('file'), bulkUploadSales);

module.exports = router;
