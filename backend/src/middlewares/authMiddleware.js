const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'Authorization token missing or invalid' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_development_only');
        req.user = decoded; // Contains id and email
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: 'Token is invalid or expired' });
    }
};

module.exports = authMiddleware;
