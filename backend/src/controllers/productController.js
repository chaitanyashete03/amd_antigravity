const { getPgClient } = require('../config/db');
const EmbeddingService = require('../services/embeddingService');

// @desc    Get all products for logged-in retailer
// @route   GET /api/v1/products
// @access  Private
const getProducts = async (req, res, next) => {
    try {
        const pgClient = getPgClient();
        const query = `
            SELECT id, retailer_id, name, sku, category, price, stock_count, created_at, updated_at
            FROM products 
            WHERE retailer_id = $1
            ORDER BY created_at DESC
        `;
        const result = await pgClient.query(query, [req.user.id]);
        res.status(200).json({ success: true, count: result.rows.length, data: result.rows });
    } catch (error) {
        next(error);
    }
};

// @desc    Create a new product with embedding
// @route   POST /api/v1/products
// @access  Private
const createProduct = async (req, res, next) => {
    try {
        const { name, sku, category, price, stock_count } = req.body;

        if (!name || !sku || price === undefined || stock_count === undefined) {
            return res.status(400).json({ success: false, message: 'Please provide name, sku, price, and stock_count' });
        }

        const pgClient = getPgClient();

        // Ensure SKU is unique for this retailer
        const existingCheck = await pgClient.query('SELECT id FROM products WHERE retailer_id = $1 AND sku = $2', [req.user.id, sku]);
        if (existingCheck.rows.length > 0) {
            return res.status(400).json({ success: false, message: 'Product with this SKU already exists' });
        }

        // Generate embedding text combined
        const combinedText = `${name}. Category: ${category || 'Uncategorized'}`;
        const embeddingArray = await EmbeddingService.generateEmbedding(combinedText);
        // pgvector requires format '[val,val,val]'
        const embeddingStr = `[${embeddingArray.join(',')}]`;

        const insertQuery = `
            INSERT INTO products (retailer_id, name, sku, category, price, stock_count, embedding)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING id, retailer_id, name, sku, category, price, stock_count, created_at, updated_at
        `;

        const result = await pgClient.query(insertQuery, [
            req.user.id,
            name,
            sku,
            category || 'Uncategorized',
            price,
            stock_count,
            embeddingStr
        ]);

        res.status(201).json({ success: true, data: result.rows[0] });
    } catch (error) {
        next(error);
    }
};

// @desc    Update an existing product and its embedding
// @route   PUT /api/v1/products/:id
// @access  Private
const updateProduct = async (req, res, next) => {
    try {
        const pgClient = getPgClient();
        const productId = req.params.id;
        const { name, category, price, stock_count } = req.body;

        // Verify ownership and existence
        const existing = await pgClient.query('SELECT * FROM products WHERE id = $1 AND retailer_id = $2', [productId, req.user.id]);
        if (existing.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Product not found or unauthorized' });
        }

        const product = existing.rows[0];
        const newName = name || product.name;
        const newCategory = category || product.category;
        const newPrice = price !== undefined ? price : product.price;
        const newStock = stock_count !== undefined ? stock_count : product.stock_count;

        let embeddingStr = null;

        // Regenerate embedding ONLY if core semantics change
        if (name || category) {
            const combinedText = `${newName}. Category: ${newCategory}`;
            const embeddingArray = await EmbeddingService.generateEmbedding(combinedText);
            embeddingStr = `[${embeddingArray.join(',')}]`;
        }

        let updateQuery = `
            UPDATE products 
            SET name = $1, category = $2, price = $3, stock_count = $4, updated_at = CURRENT_TIMESTAMP
        `;
        const values = [newName, newCategory, newPrice, newStock];

        if (embeddingStr) {
            updateQuery += `, embedding = $5 WHERE id = $6 AND retailer_id = $7 RETURNING id, retailer_id, name, sku, category, price, stock_count, created_at, updated_at`;
            values.push(embeddingStr, productId, req.user.id);
        } else {
            updateQuery += ` WHERE id = $5 AND retailer_id = $6 RETURNING id, retailer_id, name, sku, category, price, stock_count, created_at, updated_at`;
            values.push(productId, req.user.id);
        }

        const result = await pgClient.query(updateQuery, values);

        res.status(200).json({ success: true, data: result.rows[0] });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a product
// @route   DELETE /api/v1/products/:id
// @access  Private
const deleteProduct = async (req, res, next) => {
    try {
        const pgClient = getPgClient();
        const productId = req.params.id;

        const result = await pgClient.query('DELETE FROM products WHERE id = $1 AND retailer_id = $2 RETURNING id', [productId, req.user.id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Product not found or unauthorized' });
        }

        res.status(200).json({ success: true, message: 'Product deleted' });
    } catch (error) {
        next(error);
    }
};

// @desc    Find similar products via vector search
// @route   GET /api/v1/products/search/similar
// @access  Private
const findSimilarProducts = async (req, res, next) => {
    try {
        const { query, limit = 5 } = req.query;

        if (!query) {
            return res.status(400).json({ success: false, message: 'Please provide a search query parameter' });
        }

        const pgClient = getPgClient();

        // 1. Get embedding for user's query
        const queryEmbeddingArray = await EmbeddingService.generateEmbedding(query);
        const queryEmbeddingStr = `[${queryEmbeddingArray.join(',')}]`;

        // 2. Perform vector cosine distance search
        // <=> is the cosine distance operator in pgvector
        const searchQuery = `
            SELECT id, retailer_id, name, sku, category, price, stock_count,
                   1 - (embedding <=> $1) as similarity
            FROM products
            WHERE retailer_id = $2
            ORDER BY embedding <=> $1
            LIMIT $3;
        `;

        const result = await pgClient.query(searchQuery, [queryEmbeddingStr, req.user.id, parseInt(limit)]);

        res.status(200).json({ success: true, count: result.rows.length, data: result.rows });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    findSimilarProducts
};
