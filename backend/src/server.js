const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectDB } = require('./config/db');
const errorHandler = require('./middlewares/errorHandler');

dotenv.config();

// Routes
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const salesRoutes = require('./routes/salesRoutes');
const insightsRoutes = require('./routes/insightsRoutes');
const chatRoutes = require('./routes/chatRoutes');
const cron = require('node-cron');
const { runAllInsights } = require('./services/insightsService');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/sales', salesRoutes);
app.use('/api/v1/insights', insightsRoutes);
app.use('/api/v1/chat', chatRoutes);

// Health Check Endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'VyapaarAI Backend is healthy' });
});

// Global Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);
    await connectDB();

    // Schedule Insights Job to run every day at midnight
    cron.schedule('0 0 * * *', async () => {
        console.log('Cron triggered: Running daily Insights generation...');
        await runAllInsights();
    });
});
