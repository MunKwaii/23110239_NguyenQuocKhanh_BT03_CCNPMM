const {
    getCartService,
    addToCartService,
    updateCartItemService,
    removeCartItemService,
    clearCartService
} = require('../services/cartService');

const getCart = async (req, res) => {
    try {
        const email = req.user.email;
        const result = await getCartService(email);
        if (!result.success) {
            return res.status(result.status).json({ message: result.message });
        }
        return res.status(200).json(result.data);
    } catch (error) {
        console.error('getCart error:', error);
        return res.status(500).json({ message: 'Lấy thông tin giỏ hàng thất bại' });
    }
};

const addToCart = async (req, res) => {
    try {
        const email = req.user.email;
        const { productId, quantity } = req.body;
        const result = await addToCartService(email, productId, quantity);
        if (!result.success) {
            return res.status(result.status).json({ message: result.message });
        }
        return res.status(200).json(result.data);
    } catch (error) {
        console.error('addToCart error:', error);
        return res.status(500).json({ message: 'Thêm vào giỏ hàng thất bại' });
    }
};

const updateCartItem = async (req, res) => {
    try {
        const email = req.user.email;
        const { productId, quantity } = req.body;
        const result = await updateCartItemService(email, productId, quantity);
        if (!result.success) {
            return res.status(result.status).json({ message: result.message });
        }
        return res.status(200).json(result.data);
    } catch (error) {
        console.error('updateCartItem error:', error);
        return res.status(500).json({ message: 'Cập nhật số lượng thất bại' });
    }
};

const removeCartItem = async (req, res) => {
    try {
        const email = req.user.email;
        const { productId } = req.params;
        const result = await removeCartItemService(email, productId);
        if (!result.success) {
            return res.status(result.status).json({ message: result.message });
        }
        return res.status(200).json(result.data);
    } catch (error) {
        console.error('removeCartItem error:', error);
        return res.status(500).json({ message: 'Xóa sản phẩm khỏi giỏ hàng thất bại' });
    }
};

const clearCart = async (req, res) => {
    try {
        const email = req.user.email;
        const result = await clearCartService(email);
        if (!result.success) {
            return res.status(result.status).json({ message: result.message });
        }
        return res.status(200).json({ message: 'Đã xóa toàn bộ giỏ hàng', cart: result.data });
    } catch (error) {
        console.error('clearCart error:', error);
        return res.status(500).json({ message: 'Xóa giỏ hàng thất bại' });
    }
};

module.exports = {
    getCart,
    addToCart,
    updateCartItem,
    removeCartItem,
    clearCart
};
