const { Client } = require('pg');
const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');
const { initDb } = require('./initDb');

dotenv.config();

let pgClientInstance = null;
let mongoClientInstance = null;

const connectDB = async () => {
    try {
        // Connect to PostgreSQL (Neon)
        if (process.env.PG_CONNECTION_STRING) {
            pgClientInstance = new Client({
                connectionString: process.env.PG_CONNECTION_STRING,
                ssl: { rejectUnauthorized: false }
            });
            await pgClientInstance.connect();
            console.log('Connected to PostgreSQL (Neon)');

            // Initialize tables if they don't exist
            await initDb(pgClientInstance);

        } else {
            console.warn('PG_CONNECTION_STRING not provided. Skipping PostgreSQL connection.');
        }

        // Connect to MongoDB
        if (process.env.MONGO_CONNECTION_STRING) {
            mongoClientInstance = new MongoClient(process.env.MONGO_CONNECTION_STRING);
            await mongoClientInstance.connect();
            console.log('Connected to MongoDB');
        } else {
            console.warn('MONGO_CONNECTION_STRING not provided. Skipping MongoDB connection.');
        }
    } catch (error) {
        console.error('Database connection error:', error);
    }
};

const getPgClient = () => pgClientInstance;
const getMongoClient = () => mongoClientInstance;

module.exports = { connectDB, getPgClient, getMongoClient };
