const { getMongoClient } = require('../config/db');
const { ObjectId } = require('mongodb');
const xlsx = require('xlsx');
const fs = require('fs');

const getSalesCollection = () => {
    const client = getMongoClient();
    if (!client) throw new Error('MongoDB not connected');
    return client.db().collection('sales');
};

const getProductsCollection = () => {
    const client = getMongoClient();
    if (!client) throw new Error('MongoDB not connected');
    return client.db().collection('products');
};

// @desc    Get all sales for logged-in retailer
// @route   GET /api/v1/sales
// @access  Private
const getSales = async (req, res, next) => {
    try {
        const collection = getSalesCollection();
        const sales = await collection.find({ retailerId: req.user.id }).toArray();
        res.status(200).json({ success: true, count: sales.length, data: sales });
    } catch (error) {
        next(error);
    }
};

// @desc    Record a single sale
// @route   POST /api/v1/sales
// @access  Private
const createSale = async (req, res, next) => {
    try {
        const { productId, quantity, totalPrice } = req.body;

        if (!productId || quantity === undefined || totalPrice === undefined) {
            return res.status(400).json({ success: false, message: 'Please provide productId, quantity, and totalPrice' });
        }

        const productsCol = getProductsCollection();
        const salesCol = getSalesCollection();

        // 1. Verify product exists and belongs to retailer
        const product = await productsCol.findOne({
            _id: new ObjectId(productId),
            retailerId: req.user.id
        });

        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        // 2. Check stock
        if (product.stockCount < quantity) {
            return res.status(400).json({ success: false, message: 'Insufficient stock' });
        }

        // 3. Deduct stock
        await productsCol.updateOne(
            { _id: new ObjectId(productId) },
            { $inc: { stockCount: -quantity } }
        );

        // 4. Record sale
        const newSale = {
            retailerId: req.user.id,
            productId: new ObjectId(productId),
            productName: product.name,
            quantity: Number(quantity),
            totalPrice: Number(totalPrice),
            saleDate: new Date(),
            createdAt: new Date()
        };

        const result = await salesCol.insertOne(newSale);
        newSale._id = result.insertedId;

        res.status(201).json({ success: true, data: newSale });
    } catch (error) {
        next(error);
    }
};


// @desc    Bulk upload sales via CSV/Excel
// @route   POST /api/v1/sales/upload
// @access  Private
const bulkUploadSales = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Please upload a CSV or Excel file' });
        }

        // Read the file buffer using xlsx
        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });

        // Assume first sheet
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // Convert to JSON
        // Expected columns: SKU, Quantity, TotalPrice
        const data = xlsx.utils.sheet_to_json(worksheet);

        if (data.length === 0) {
            return res.status(400).json({ success: false, message: 'Uploaded file is empty or ill-formatted' });
        }

        const productsCol = getProductsCollection();
        const salesCol = getSalesCollection();

        let successCount = 0;
        let errors = [];
        let salesToInsert = [];

        // Process each row
        // We will process them sequentially to handle stock deduction safely for now.
        for (let i = 0; i < data.length; i++) {
            const row = data[i];
            const sku = row.SKU || row.sku;
            const quantity = Number(row.Quantity || row.quantity);
            const totalPrice = Number(row.TotalPrice || row.totalPrice || row['Total Price']);

            if (!sku || isNaN(quantity) || isNaN(totalPrice)) {
                errors.push(`Row ${i + 2}: Missing or invalid columns. Expected SKU, Quantity, TotalPrice.`);
                continue;
            }

            const product = await productsCol.findOne({ retailerId: req.user.id, sku: String(sku) });

            if (!product) {
                errors.push(`Row ${i + 2}: SKU ${sku} not found`);
                continue;
            }

            if (product.stockCount < quantity) {
                errors.push(`Row ${i + 2}: SKU ${sku} has insufficient stock (req: ${quantity}, avail: ${product.stockCount})`);
                continue;
            }

            // Deduct stock
            await productsCol.updateOne(
                { _id: product._id },
                { $inc: { stockCount: -quantity } }
            );

            salesToInsert.push({
                retailerId: req.user.id,
                productId: product._id,
                productName: product.name,
                quantity,
                totalPrice,
                saleDate: new Date(),
                createdAt: new Date()
            });
            successCount++;
        }

        if (salesToInsert.length > 0) {
            await salesCol.insertMany(salesToInsert);
        }

        res.status(200).json({
            success: true,
            message: `Processed ${data.length} rows. ${successCount} successful, ${errors.length} failed.`,
            errors: errors.length > 0 ? errors : undefined
        });

    } catch (error) {
        next(error);
    }
};

module.exports = {
    getSales,
    createSale,
    bulkUploadSales
};
