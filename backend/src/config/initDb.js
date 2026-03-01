const initDb = async (pgClient) => {
    try {
        // Enable pgvector
        await pgClient.query('CREATE EXTENSION IF NOT EXISTS vector;');
        console.log('pgvector extension ensured.');

        const createRetailersTableQuery = `
            CREATE TABLE IF NOT EXISTS retailers (
                id SERIAL PRIMARY KEY,
                shop_name VARCHAR(255) NOT NULL,
                owner_name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `;
        await pgClient.query(createRetailersTableQuery);
        console.log('Retailers table initialized or already exists.');

        const createProductsTableQuery = `
            CREATE TABLE IF NOT EXISTS products (
                id SERIAL PRIMARY KEY,
                retailer_id INTEGER REFERENCES retailers(id) ON DELETE CASCADE,
                name VARCHAR(255) NOT NULL,
                sku VARCHAR(100) NOT NULL,
                category VARCHAR(100) DEFAULT 'Uncategorized',
                price DECIMAL(10, 2) NOT NULL,
                stock_count INTEGER NOT NULL DEFAULT 0,
                embedding vector(384),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE (retailer_id, sku)
            );
        `;
        await pgClient.query(createProductsTableQuery);
        console.log('Products table initialized or already exists.');

        const createSalesTableQuery = `
            CREATE TABLE IF NOT EXISTS sales (
                id SERIAL PRIMARY KEY,
                retailer_id INTEGER REFERENCES retailers(id) ON DELETE CASCADE,
                product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
                quantity INTEGER NOT NULL,
                total_price DECIMAL(10, 2) NOT NULL,
                sale_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `;
        await pgClient.query(createSalesTableQuery);
        console.log('Sales table initialized or already exists.');

        const createInsightsTableQuery = `
            CREATE TABLE IF NOT EXISTS insights (
                id SERIAL PRIMARY KEY,
                retailer_id INTEGER REFERENCES retailers(id) ON DELETE CASCADE,
                product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
                type VARCHAR(50) NOT NULL, -- e.g., 'stock_warning', 'trending', 'slow_moving'
                message TEXT NOT NULL,
                status VARCHAR(20) DEFAULT 'active', -- 'active', 'resolved', 'ignored'
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `;
        await pgClient.query(createInsightsTableQuery);
        console.log('Insights table initialized or already exists.');

    } catch (error) {
        console.error('Error initializing database tables:', error);
    }
};

module.exports = { initDb };
