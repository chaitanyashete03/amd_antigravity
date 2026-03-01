const { getMongoClient, getPgClient } = require('../config/db');
const EmbeddingService = require('../services/embeddingService');
const LLMService = require('../services/llmService');

const getChatsCollection = () => {
    const client = getMongoClient();
    if (!client) throw new Error('MongoDB not connected');
    return client.db().collection('chats');
};

const getSalesCollection = () => {
    const client = getMongoClient();
    if (!client) throw new Error('MongoDB not connected');
    return client.db().collection('sales');
};

// @desc    Send a message to the AI assistant
// @route   POST /api/v1/chat/message
// @access  Private
const sendMessage = async (req, res, next) => {
    try {
        const { message, language = 'en' } = req.body;

        if (!message) {
            return res.status(400).json({ success: false, message: 'Message is required' });
        }

        const pgClient = getPgClient();
        const salesCol = getSalesCollection();

        // 1. Generate an embedding for the user's message
        const queryEmbeddingArray = await EmbeddingService.generateEmbedding(message);
        const queryEmbeddingStr = `[${queryEmbeddingArray.join(',')}]`;

        // 2. Retrieve top 5 most similar products using pgvector
        const searchQuery = `
            SELECT name, category, price, stock_count
            FROM products
            WHERE retailer_id = $1
            ORDER BY embedding <=> $2
            LIMIT 5;
        `;
        const productsResult = await pgClient.query(searchQuery, [req.user.id, queryEmbeddingStr]);
        const similarProducts = productsResult.rows;

        // 3. Retrieve recent 5 sales from MongoDB for additional context
        const recentSales = await salesCol
            .find({ retailerId: req.user.id })
            .sort({ saleDate: -1 })
            .limit(5)
            .toArray();

        // 4. Construct System Prompt Context
        let contextParts = [];

        if (similarProducts.length > 0) {
            const prodStrs = similarProducts.map(p => `- ${p.name} (${p.category}): $${p.price}, Stock: ${p.stock_count}`).join('\n');
            contextParts.push(`Relevant Inventory:\n${prodStrs}`);
        } else {
            contextParts.push("Relevant Inventory: No matching products found.");
        }

        if (recentSales.length > 0) {
            const saleStrs = recentSales.map(s => `- Sold ${s.quantity} of ${s.productName} for $${s.totalPrice} on ${new Date(s.saleDate).toLocaleDateString()}`).join('\n');
            contextParts.push(`Recent Sales History:\n${saleStrs}`);
        } else {
            contextParts.push("Recent Sales History: No recent sales.");
        }

        const systemPrompt = `
You are VyapaarAI, an intelligent and polite retail assistant. Try to keep responses concise.
Use the following context about the retailer's business to answer their query accurately.
If they ask about inventory or sales, refer ONLY to the provided context.

Context:
${contextParts.join('\n\n')}
`;

        // 5. Query LLM
        const aiResponse = await LLMService.generateResponse(systemPrompt, message, language);

        // 6. Save Conversation History to MongoDB
        const chatsCol = getChatsCollection();
        const chatLog = {
            retailerId: req.user.id,
            message,
            response: aiResponse,
            language,
            contextUsed: {
                productsCount: similarProducts.length,
                salesCount: recentSales.length
            },
            timestamp: new Date()
        };

        await chatsCol.insertOne(chatLog);

        res.status(200).json({ success: true, data: chatLog });

    } catch (error) {
        next(error);
    }
};

// @desc    Get conversation history
// @route   GET /api/v1/chat/history
// @access  Private
const getHistory = async (req, res, next) => {
    try {
        const chatsCol = getChatsCollection();

        // Fetch last 50 messages
        const history = await chatsCol
            .find({ retailerId: req.user.id })
            .sort({ timestamp: -1 })
            .limit(50)
            .toArray();

        // Reverse to return chronological order
        res.status(200).json({ success: true, count: history.length, data: history.reverse() });

    } catch (error) {
        next(error);
    }
};

module.exports = {
    sendMessage,
    getHistory
};
