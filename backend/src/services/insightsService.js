const { getPgClient } = require('../config/db');

const generateLowStockInsights = async () => {
    const pgClient = getPgClient();
    if (!pgClient) return;

    try {
        // Find products with stock < threshold (hardcoded to 10 for MVP)
        const lowStockQuery = `
            SELECT id, retailer_id, name, stock_count
            FROM products
            WHERE stock_count < 10
        `;
        const { rows: lowStockProducts } = await pgClient.query(lowStockQuery);

        for (const product of lowStockProducts) {
            // Check if active insight already exists
            const existingQuery = `
                SELECT id FROM insights 
                WHERE retailer_id = $1 AND product_id = $2 
                AND type = 'stock_warning' AND status = 'active'
            `;
            const { rowCount } = await pgClient.query(existingQuery, [product.retailer_id, product.id]);

            if (rowCount === 0) {
                const insertInsightQuery = `
                    INSERT INTO insights (retailer_id, product_id, type, message)
                    VALUES ($1, $2, 'stock_warning', $3)
                `;
                const message = `Low stock alert: ${product.name} only has ${product.stock_count} units left.`;
                await pgClient.query(insertInsightQuery, [product.retailer_id, product.id, message]);
            }
        }
        console.log(`Generated low stock insights. Found ${lowStockProducts.length} items.`);
    } catch (error) {
        console.error('Error generating low stock insights:', error);
    }
};

const generateTrendingInsights = async () => {
    const pgClient = getPgClient();
    if (!pgClient) return;

    try {
        // Find products with high sales in the last 7 days
        const trendingQuery = `
            SELECT product_id, retailer_id, SUM(quantity) as total_sold
            FROM sales
            WHERE sale_date > CURRENT_DATE - INTERVAL '7 days'
            GROUP BY product_id, retailer_id
            HAVING SUM(quantity) > 50
        `;
        const { rows: trendingProducts } = await pgClient.query(trendingQuery);

        for (const item of trendingProducts) {
            const existingQuery = `
                SELECT id FROM insights 
                WHERE retailer_id = $1 AND product_id = $2 
                AND type = 'trending' AND status = 'active'
            `;
            const { rowCount } = await pgClient.query(existingQuery, [item.retailer_id, item.product_id]);

            if (rowCount === 0) {
                // Get product name
                const { rows: pRows } = await pgClient.query("SELECT name FROM products WHERE id = $1", [item.product_id]);
                const pName = pRows[0]?.name || 'Unknown Product';

                const insertInsightQuery = `
                    INSERT INTO insights (retailer_id, product_id, type, message)
                    VALUES ($1, $2, 'trending', $3)
                `;
                const message = `Trending item: ${pName} sold ${item.total_sold} units in the last 7 days.`;
                await pgClient.query(insertInsightQuery, [item.retailer_id, item.product_id, message]);
            }
        }
    } catch (error) {
        console.error('Error generating trending insights:', error);
    }
};

const generateSlowMovingInsights = async () => {
    const pgClient = getPgClient();
    if (!pgClient) return;

    try {
        // Products with stock > 0 but NO sales in the last 30 days
        const slowQuery = `
            SELECT p.id, p.retailer_id, p.name 
            FROM products p
            LEFT JOIN sales s ON p.id = s.product_id AND s.sale_date > CURRENT_DATE - INTERVAL '30 days'
            WHERE p.stock_count > 0 AND s.id IS NULL
        `;
        const { rows: slowProducts } = await pgClient.query(slowQuery);

        for (const product of slowProducts) {
            const existingQuery = `
                SELECT id FROM insights 
                WHERE retailer_id = $1 AND product_id = $2 
                AND type = 'slow_moving' AND status = 'active'
            `;
            const { rowCount } = await pgClient.query(existingQuery, [product.retailer_id, product.id]);

            if (rowCount === 0) {
                const insertInsightQuery = `
                    INSERT INTO insights (retailer_id, product_id, type, message)
                    VALUES ($1, $2, 'slow_moving', $3)
                `;
                const message = `Slow moving stock: ${product.name} has had no sales in the last 30 days. Consider a promotion.`;
                await pgClient.query(insertInsightQuery, [product.retailer_id, product.id, message]);
            }
        }
    } catch (error) {
        console.error('Error generating slow moving insights:', error);
    }
};

const generatePriceOptimizationInsights = async () => {
    // This is a mocked implementation that simply applies a generic rule
    const pgClient = getPgClient();
    if (!pgClient) return;

    try {
        // Recommend price increase if it's a top seller but stock is low
        const query = `
            SELECT p.id, p.retailer_id, p.name, p.price
            FROM products p
            JOIN sales s ON p.id = s.product_id
            WHERE p.stock_count BETWEEN 1 AND 15
            AND s.sale_date > CURRENT_DATE - INTERVAL '7 days'
            GROUP BY p.id, p.retailer_id, p.name, p.price
            HAVING SUM(s.quantity) > 20
        `;
        const { rows: optimalProducts } = await pgClient.query(query);

        for (const product of optimalProducts) {
            const existingQuery = `
                SELECT id FROM insights 
                WHERE retailer_id = $1 AND product_id = $2 
                AND type = 'price_optimization' AND status = 'active'
            `;
            const { rowCount } = await pgClient.query(existingQuery, [product.retailer_id, product.id]);

            if (rowCount === 0) {
                const insertInsightQuery = `
                    INSERT INTO insights (retailer_id, product_id, type, message)
                    VALUES ($1, $2, 'price_optimization', $3)
                `;
                const suggestedPrice = (parseFloat(product.price) * 1.05).toFixed(2); // 5% increase
                const message = `Price Optimization: ${product.name} is selling fast but stock is low. Consider increasing price from ${product.price} to ~${suggestedPrice}.`;
                await pgClient.query(insertInsightQuery, [product.retailer_id, product.id, message]);
            }
        }
    } catch (error) {
        console.error('Error generating price optimization insights:', error);
    }
};

// Orchestrator Job
const runAllInsights = async () => {
    console.log('Running scheduled insights generation...');
    await generateLowStockInsights();
    await generateTrendingInsights();
    await generateSlowMovingInsights();
    await generatePriceOptimizationInsights();
    console.log('Insights generation complete.');
};

module.exports = {
    runAllInsights
};
