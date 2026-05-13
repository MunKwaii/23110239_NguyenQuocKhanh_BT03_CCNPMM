require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../src/models/product');

const run = async () => {
    if (!process.env.MONGO_DB_URL) {
        throw new Error('Missing MONGO_DB_URL in environment');
    }

    await mongoose.connect(process.env.MONGO_DB_URL);

    const total = await Product.countDocuments();
    const topWeekly = await Product.find({ isBestSeller: true })
        .sort({ sold: -1 })
        .limit(3)
        .select('name sold');

    console.log(`Total products: ${total}`);
    console.log('Top 3 weekly best sellers:');
    topWeekly.forEach((item, index) => {
        console.log(`${index + 1}. ${item.name} (${item.sold})`);
    });

    await mongoose.disconnect();
};

run().catch((error) => {
    console.error('Check failed:', error.message);
    process.exit(1);
});

