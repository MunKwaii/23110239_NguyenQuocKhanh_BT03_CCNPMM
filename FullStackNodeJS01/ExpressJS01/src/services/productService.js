const Product = require('../models/product');

const getProductsService = async (queryParams) => {
    const { filter, limit: rawLimit, page: rawPage, search, category, brand, minPrice, maxPrice, sortBy } = queryParams;
    const page = Math.max(parseInt(rawPage || '1', 10), 1);
    const limit = Math.min(parseInt(rawLimit || '12', 10), 50);
    const skip = (page - 1) * limit;
    const query = {};
    let sort = { sold: -1 };

    // --- Preset filters ---
    if (filter === 'new') { query.isNewProduct = true; sort = { createdAt: -1 }; }
    if (filter === 'best') { query.isBestSeller = true; sort = { sold: -1 }; }
    if (filter === 'promo') { query.isPromotion = true; sort = { salePrice: 1 }; }

    // --- Search ---
    if (search && search.trim()) {
        const regex = new RegExp(search.trim(), 'i');
        query.$or = [
            { name: regex },
            { brand: regex },
            { description: regex },
            { tags: regex }
        ];
    }

    // --- Filter by category ---
    if (category && category !== 'all') {
        query.category = category;
    }

    // --- Filter by brand ---
    if (brand && brand !== 'all') {
        query.brand = new RegExp(`^${brand}$`, 'i');
    }

    // --- Price range ---
    if (minPrice || maxPrice) {
        const min = minPrice ? parseInt(minPrice, 10) : null;
        const max = maxPrice ? parseInt(maxPrice, 10) : null;

        const priceCondition = {};
        if (min !== null) priceCondition.$gte = min;
        if (max !== null) priceCondition.$lte = max;

        const priceOrConditions = [
            { salePrice: priceCondition },
            { salePrice: { $exists: false }, price: priceCondition },
            { salePrice: null, price: priceCondition }
        ];

        if (query.$or) {
            query.$and = [
                { $or: query.$or },
                { $or: priceOrConditions }
            ];
            delete query.$or;
        } else {
            query.$or = priceOrConditions;
        }
    }

    // --- Sort ---
    if (sortBy === 'price_asc') sort = { price: 1 };
    else if (sortBy === 'price_desc') sort = { price: -1 };
    else if (sortBy === 'newest') sort = { createdAt: -1 };
    else if (sortBy === 'best_seller') sort = { sold: -1 };
    else if (sortBy === 'rating') sort = { rating: -1 };

    const products = await Product.find(query).sort(sort).skip(skip).limit(limit);
    const total = await Product.countDocuments(query);

    return { products, total, page, limit };
};

const getProductByIdService = async (id) => {
    const product = await Product.findByIdAndUpdate(
        id,
        { $inc: { views: 1 } },
        { new: true }
    );
    return product;
};

const getTopProductsService = async () => {
    const bestSellers = await Product.find().sort({ sold: -1 }).limit(10);
    const mostViewed = await Product.find().sort({ views: -1 }).limit(10);
    return { bestSellers, mostViewed };
};

const getSimilarProductsService = async (id, limitQuery) => {
    const limit = Math.min(parseInt(limitQuery || '6', 10), 20);
    const product = await Product.findById(id);
    if (!product) return null;

    let query = { _id: { $ne: product._id }, category: product.category };
    let similar = await Product.find(query).sort({ sold: -1 }).limit(limit);

    if (similar.length === 0 && product.tags?.length) {
        query = { _id: { $ne: product._id }, tags: { $in: product.tags } };
        similar = await Product.find(query).sort({ sold: -1 }).limit(limit);
    }
    return similar;
};

const getFilterMetaService = async () => {
    const brands = await Product.distinct('brand');
    const categories = await Product.distinct('category');
    return { brands, categories };
};

module.exports = {
    getProductsService,
    getProductByIdService,
    getTopProductsService,
    getSimilarProductsService,
    getFilterMetaService
};
