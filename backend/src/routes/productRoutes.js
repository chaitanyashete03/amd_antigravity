const express = require('express');
const {
    getProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    findSimilarProducts
} = require('../controllers/productController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// Apply auth middleware to all routes in this file
router.use(authMiddleware);

router.get('/search/similar', findSimilarProducts);

router.route('/')
    .get(getProducts)
    .post(createProduct);

router.route('/:id')
    .put(updateProduct)
    .delete(deleteProduct);

module.exports = router;
