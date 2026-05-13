const Product = require('../models/product');

const getProducts = async (req, res) => {
    try {
        const { filter, limit: rawLimit, search, category, brand, minPrice, maxPrice, sortBy } = req.query;
        const limit = Math.min(parseInt(rawLimit || '12', 10), 50);
        const query = {};
        let sort = { sold: -1 };

        // --- Preset filters ---
        if (filter === 'new') { query.isNewProduct = true; sort = { createdAt: -1 }; }
        if (filter === 'best') { query.isBestSeller = true; sort = { sold: -1 }; }
        if (filter === 'promo') { query.isPromotion = true; sort = { salePrice: 1 }; }

        // --- Search ---
        if (search && search.trim()) {
            const regex = new RegExp(search.trim(), 'i');
            query.$or = [{ name: regex }, { brand: regex }, { description: regex }, { tags: regex }];
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
            query.$or = query.$or || undefined;
            const priceField = { $exists: true };
            query.price = {};
            if (minPrice) query.price.$gte = parseInt(minPrice, 10);
            if (maxPrice) query.price.$lte = parseInt(maxPrice, 10);
        }

        // --- Sort ---
        if (sortBy === 'price_asc') sort = { price: 1 };
        else if (sortBy === 'price_desc') sort = { price: -1 };
        else if (sortBy === 'newest') sort = { createdAt: -1 };
        else if (sortBy === 'best_seller') sort = { sold: -1 };
        else if (sortBy === 'rating') sort = { rating: -1 };

        const products = await Product.find(query).sort(sort).limit(limit);
        const total = await Product.countDocuments(query);

        return res.status(200).json({ products, total });
    } catch (error) {
        return res.status(500).json({ message: 'Failed to fetch products' });
    }
};

const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });
        return res.status(200).json(product);
    } catch (error) {
        return res.status(500).json({ message: 'Failed to fetch product' });
    }
};

const getSimilarProducts = async (req, res) => {
    try {
        const limit = Math.min(parseInt(req.query.limit || '6', 10), 20);
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        let query = { _id: { $ne: product._id }, category: product.category };
        let similar = await Product.find(query).sort({ sold: -1 }).limit(limit);

        if (similar.length === 0 && product.tags?.length) {
            query = { _id: { $ne: product._id }, tags: { $in: product.tags } };
            similar = await Product.find(query).sort({ sold: -1 }).limit(limit);
        }
        return res.status(200).json(similar);
    } catch (error) {
        return res.status(500).json({ message: 'Failed to fetch similar products' });
    }
};

const getFilterMeta = async (req, res) => {
    try {
        const brands = await Product.distinct('brand');
        const categories = await Product.distinct('category');
        return res.status(200).json({ brands, categories });
    } catch (error) {
        return res.status(500).json({ message: 'Failed to fetch filter meta' });
    }
};

module.exports = { getProducts, getProductById, getSimilarProducts, getFilterMeta };
