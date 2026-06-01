const {
    getProductsService,
    getProductByIdService,
    getTopProductsService,
    getSimilarProductsService,
    getFilterMetaService
} = require('../services/productService');

const getProducts = async (req, res) => {
    try {
        const result = await getProductsService(req.query);
        return res.status(200).json(result);
    } catch (error) {
        console.error('getProducts error:', error);
        return res.status(500).json({ message: 'Failed to fetch products' });
    }
};

const getProductById = async (req, res) => {
    try {
        const email = req.user?.email;
        const product = await getProductByIdService(req.params.id, email);
        if (!product) return res.status(404).json({ message: 'Product not found' });
        return res.status(200).json(product);
    } catch (error) {
        return res.status(500).json({ message: 'Failed to fetch product' });
    }
};

const getTopProducts = async (req, res) => {
    try {
        const result = await getTopProductsService();
        return res.status(200).json(result);
    } catch (error) {
        console.error('getTopProducts error:', error);
        return res.status(500).json({ message: 'Failed to fetch top products' });
    }
};

const getSimilarProducts = async (req, res) => {
    try {
        const similar = await getSimilarProductsService(req.params.id, req.query.limit);
        if (!similar) return res.status(404).json({ message: 'Product not found' });
        return res.status(200).json(similar);
    } catch (error) {
        return res.status(500).json({ message: 'Failed to fetch similar products' });
    }
};

const getFilterMeta = async (req, res) => {
    try {
        const result = await getFilterMetaService();
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({ message: 'Failed to fetch filter meta' });
    }
};

module.exports = { getProducts, getProductById, getSimilarProducts, getFilterMeta, getTopProducts };
