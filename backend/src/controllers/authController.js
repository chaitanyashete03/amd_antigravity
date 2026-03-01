const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { getPgClient } = require('../config/db');

// @desc    Register a new retailer
// @route   POST /api/v1/auth/register
// @access  Public
const register = async (req, res, next) => {
    try {
        const { shop_name, owner_name, email, password } = req.body;

        // Validation
        if (!shop_name || !owner_name || !email || !password) {
            return res.status(400).json({ success: false, message: 'Please provide all required fields' });
        }

        const pgClient = getPgClient();
        if (!pgClient) {
            return res.status(500).json({ success: false, message: 'Database connection not available' });
        }

        // Check if user exists
        const userCheckStr = 'SELECT id FROM retailers WHERE email = $1';
        const userCheckRet = await pgClient.query(userCheckStr, [email]);
        if (userCheckRet.rows.length > 0) {
            return res.status(400).json({ success: false, message: 'User with this email already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        // Insert new retailer
        const insertQuery = `
            INSERT INTO retailers (shop_name, owner_name, email, password_hash)
            VALUES ($1, $2, $3, $4)
            RETURNING id, shop_name, owner_name, email
        `;
        const newUserQuery = await pgClient.query(insertQuery, [shop_name, owner_name, email, password_hash]);
        const newUser = newUserQuery.rows[0];

        // Create JWT
        const token = jwt.sign({ id: newUser.id, email: newUser.email }, process.env.JWT_SECRET || 'fallback_secret_development_only', {
            expiresIn: '30d'
        });

        res.status(201).json({
            success: true,
            token,
            user: newUser
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Login a retailer
// @route   POST /api/v1/auth/login
// @access  Public
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Please provide an email and password' });
        }

        const pgClient = getPgClient();
        if (!pgClient) {
            return res.status(500).json({ success: false, message: 'Database connection not available' });
        }

        // Check for user
        const userQueryStr = 'SELECT * FROM retailers WHERE email = $1';
        const userQueryRet = await pgClient.query(userQueryStr, [email]);

        if (userQueryRet.rows.length === 0) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const user = userQueryRet.rows[0];

        // Check if password matches
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // Create JWT
        const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET || 'fallback_secret_development_only', {
            expiresIn: '30d'
        });

        // Omit password hash in response
        delete user.password_hash;

        res.status(200).json({
            success: true,
            token,
            user
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get current logged in user
// @route   GET /api/v1/auth/me
// @access  Private
const getMe = async (req, res, next) => {
    try {
        const pgClient = getPgClient();
        if (!pgClient) {
            return res.status(500).json({ success: false, message: 'Database connection not available' });
        }

        const userQueryStr = 'SELECT id, shop_name, owner_name, email, created_at FROM retailers WHERE id = $1';
        const userQueryRet = await pgClient.query(userQueryStr, [req.user.id]);

        if (userQueryRet.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.status(200).json({
            success: true,
            user: userQueryRet.rows[0]
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    register,
    login,
    getMe
};
