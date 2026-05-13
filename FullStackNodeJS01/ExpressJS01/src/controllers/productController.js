const Product = require('../models/product');

const getProducts = async (req, res) => {
    try {
        const filter = (req.query.filter || '').toLowerCase();
        const limit = Math.min(parseInt(req.query.limit || '12', 10), 50);
        const query = {};
        let sort = { sold: -1 };

        if (filter === 'new') {
            query.isNewProduct = true;
            sort = { createdAt: -1 };
        }

        if (filter === 'best') {
            query.isBestSeller = true;
            sort = { sold: -1 };
        }

        if (filter === 'promo') {
            query.isPromotion = true;
            sort = { salePrice: 1 };
        }

        const products = await Product.find(query).sort(sort).limit(limit);
        return res.status(200).json(products);
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to fetch products'
        });
    }
};

const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        return res.status(200).json(product);
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to fetch product'
        });
    }
};

const getSimilarProducts = async (req, res) => {
    try {
        const limit = Math.min(parseInt(req.query.limit || '6', 10), 20);
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        let query = { _id: { $ne: product._id }, category: product.category };
        let similar = await Product.find(query).sort({ sold: -1 }).limit(limit);

        if (similar.length === 0 && product.tags?.length) {
            query = { _id: { $ne: product._id }, tags: { $in: product.tags } };
            similar = await Product.find(query).sort({ sold: -1 }).limit(limit);
        }

        return res.status(200).json(similar);
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to fetch similar products'
        });
    }
};

module.exports = {
    getProducts,
    getProductById,
    getSimilarProducts
};

