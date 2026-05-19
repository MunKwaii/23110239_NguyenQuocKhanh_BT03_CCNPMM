const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    brand: { type: String, required: true },
    price: { type: Number, required: true },
    salePrice: { type: Number },
    image: { type: String, required: true },
    images: { type: [String], default: [] },
    category: { type: String, default: 'headphones' },
    tags: { type: [String], default: [] },
    warrantyMonths: { type: Number, default: 24 },
    stock: { type: Number, default: 0 },
    rating: { type: Number, default: 4.5 },
    sold: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    isNewProduct: { type: Boolean, default: false },
    isBestSeller: { type: Boolean, default: false },
    isPromotion: { type: Boolean, default: false },
    description: { type: String, default: '' }
}, {
    timestamps: true
});

const Product = mongoose.model('product', productSchema);

module.exports = Product;
