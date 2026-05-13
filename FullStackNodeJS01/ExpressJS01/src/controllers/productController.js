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

module.exports = {
    getProducts
};

