const Cart = require('../models/cart');
const Product = require('../models/product');

// Get user's cart
const getCart = async (req, res) => {
    try {
        const email = req.user.email;
        let cart = await Cart.findOne({ email }).populate('items.product');
        if (!cart) {
            cart = await Cart.create({ email, items: [] });
        } else {
            // Filter out items where product was deleted from DB
            const originalLength = cart.items.length;
            cart.items = cart.items.filter(item => item.product !== null);
            if (cart.items.length !== originalLength) {
                await cart.save();
            }
        }
        return res.status(200).json(cart);
    } catch (error) {
        console.error('getCart error:', error);
        return res.status(500).json({ message: 'Lấy thông tin giỏ hàng thất bại' });
    }
};

// Add product to cart
const addToCart = async (req, res) => {
    try {
        const email = req.user.email;
        const { productId, quantity } = req.body;

        if (!productId || !quantity || quantity < 1) {
            return res.status(400).json({ message: 'Thông tin sản phẩm hoặc số lượng không hợp lệ' });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Sản phẩm không tồn tại' });
        }

        let cart = await Cart.findOne({ email });
        if (!cart) {
            cart = new Cart({ email, items: [] });
        }

        const existingItemIndex = cart.items.findIndex(item => item.product.toString() === productId);
        if (existingItemIndex > -1) {
            const newQty = cart.items[existingItemIndex].quantity + quantity;
            if (newQty > product.stock) {
                return res.status(400).json({ message: `Số lượng vượt quá tồn kho (Còn lại: ${product.stock})` });
            }
            cart.items[existingItemIndex].quantity = newQty;
        } else {
            if (quantity > product.stock) {
                return res.status(400).json({ message: `Số lượng vượt quá tồn kho (Còn lại: ${product.stock})` });
            }
            cart.items.push({ product: productId, quantity });
        }

        await cart.save();
        cart = await cart.populate('items.product');
        return res.status(200).json(cart);
    } catch (error) {
        console.error('addToCart error:', error);
        return res.status(500).json({ message: 'Thêm vào giỏ hàng thất bại' });
    }
};

// Update cart item quantity
const updateCartItem = async (req, res) => {
    try {
        const email = req.user.email;
        const { productId, quantity } = req.body;

        if (!productId || quantity === undefined || quantity < 1) {
            return res.status(400).json({ message: 'Thông tin sản phẩm hoặc số lượng không hợp lệ' });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Sản phẩm không tồn tại' });
        }

        let cart = await Cart.findOne({ email });
        if (!cart) {
            return res.status(404).json({ message: 'Không tìm thấy giỏ hàng' });
        }

        const existingItemIndex = cart.items.findIndex(item => item.product.toString() === productId);
        if (existingItemIndex === -1) {
            return res.status(404).json({ message: 'Sản phẩm không có trong giỏ hàng' });
        }

        if (quantity > product.stock) {
            return res.status(400).json({ message: `Số lượng vượt quá tồn kho (Còn lại: ${product.stock})` });
        }

        cart.items[existingItemIndex].quantity = quantity;
        await cart.save();
        cart = await cart.populate('items.product');
        return res.status(200).json(cart);
    } catch (error) {
        console.error('updateCartItem error:', error);
        return res.status(500).json({ message: 'Cập nhật số lượng thất bại' });
    }
};

// Remove product from cart
const removeCartItem = async (req, res) => {
    try {
        const email = req.user.email;
        const { productId } = req.params;

        if (!productId) {
            return res.status(400).json({ message: 'Mã sản phẩm không hợp lệ' });
        }

        let cart = await Cart.findOne({ email });
        if (!cart) {
            return res.status(404).json({ message: 'Không tìm thấy giỏ hàng' });
        }

        cart.items = cart.items.filter(item => item.product.toString() !== productId);
        await cart.save();
        cart = await cart.populate('items.product');
        return res.status(200).json(cart);
    } catch (error) {
        console.error('removeCartItem error:', error);
        return res.status(500).json({ message: 'Xóa sản phẩm khỏi giỏ hàng thất bại' });
    }
};

// Clear cart
const clearCart = async (req, res) => {
    try {
        const email = req.user.email;
        let cart = await Cart.findOne({ email });
        if (cart) {
            cart.items = [];
            await cart.save();
        }
        return res.status(200).json({ message: 'Đã xóa toàn bộ giỏ hàng', cart });
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
