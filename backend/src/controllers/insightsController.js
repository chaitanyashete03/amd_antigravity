const { getPgClient } = require('../config/db');

// GET /api/v1/insights/dashboard
const getDashboardMetrics = async (req, res) => {
    // Note: Assuming `req.user.id` is available via auth middleware. Hardcoding for testing if absent.
    const retailerId = req.user?.id || 1;
    const pgClient = getPgClient();

    try {
        // 1. Total Products
        const totalProductsRes = await pgClient.query(`SELECT COUNT(*) FROM products WHERE retailer_id = $1`, [retailerId]);
        const totalProducts = parseInt(totalProductsRes.rows[0].count);

        // 2. Low Stock Alerts count
        const lowStockRes = await pgClient.query(`SELECT COUNT(*) FROM products WHERE retailer_id = $1 AND stock_count < 10`, [retailerId]);
        const lowStockCount = parseInt(lowStockRes.rows[0].count);

        // 3. Top Seller (all time)
        const topSellerRes = await pgClient.query(`
            SELECT p.name, SUM(s.quantity) as total_sold
            FROM products p
            JOIN sales s ON p.id = s.product_id
            WHERE p.retailer_id = $1
            GROUP BY p.name
            ORDER BY total_sold DESC
            LIMIT 1
        `, [retailerId]);
        const topSeller = topSellerRes.rows.length > 0 ? topSellerRes.rows[0].name : 'N/A';

        // 4. Sales Today
        const salesTodayRes = await pgClient.query(`
            SELECT SUM(total_price) as total_revenue
            FROM sales 
            WHERE retailer_id = $1 AND DATE(sale_date) = CURRENT_DATE
        `, [retailerId]);
        const salesToday = parseFloat(salesTodayRes.rows[0].total_revenue) || 0;

        res.json({
            success: true,
            data: {
                totalProducts,
                lowStockCount,
                topSeller,
                salesToday
            }
        });
    } catch (error) {
        console.error('Error fetching dashboard metrics:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// GET /api/v1/insights/recommendations
const getRecommendations = async (req, res) => {
    const retailerId = req.user?.id || 1;
    const pgClient = getPgClient();

    try {
        const query = `
            SELECT i.id, i.type, i.message, i.status, i.created_at, p.name as product_name
            FROM insights i
            LEFT JOIN products p ON i.product_id = p.id
            WHERE i.retailer_id = $1 AND i.status = 'active'
            ORDER BY i.created_at DESC
        `;
        const { rows } = await pgClient.query(query, [retailerId]);

        res.json({
            success: true,
            data: rows
        });
    } catch (error) {
        console.error('Error fetching recommendations:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

module.exports = {
    getDashboardMetrics,
    getRecommendations
};
