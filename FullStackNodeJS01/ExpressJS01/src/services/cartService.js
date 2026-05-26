const Cart = require('../models/cart');
const Product = require('../models/product');

const getCartService = async (email) => {
    let cart = await Cart.findOne({ email }).populate('items.product');
    if (!cart) {
        cart = await Cart.create({ email, items: [] });
    } else {
        const originalLength = cart.items.length;
        cart.items = cart.items.filter(item => item.product !== null);
        if (cart.items.length !== originalLength) {
            await cart.save();
        }
    }
    return { success: true, data: cart };
};

const addToCartService = async (email, productId, quantity) => {
    if (!productId || !quantity || quantity < 1) {
        return { success: false, status: 400, message: 'Thông tin sản phẩm hoặc số lượng không hợp lệ' };
    }

    const product = await Product.findById(productId);
    if (!product) {
        return { success: false, status: 404, message: 'Sản phẩm không tồn tại' };
    }

    let cart = await Cart.findOne({ email });
    if (!cart) {
        cart = new Cart({ email, items: [] });
    }

    const existingItemIndex = cart.items.findIndex(item => item.product.toString() === productId);
    if (existingItemIndex > -1) {
        const newQty = cart.items[existingItemIndex].quantity + quantity;
        if (newQty > product.stock) {
            return { success: false, status: 400, message: `Số lượng vượt quá tồn kho (Còn lại: ${product.stock})` };
        }
        cart.items[existingItemIndex].quantity = newQty;
    } else {
        if (quantity > product.stock) {
            return { success: false, status: 400, message: `Số lượng vượt quá tồn kho (Còn lại: ${product.stock})` };
        }
        cart.items.push({ product: productId, quantity });
    }

    await cart.save();
    cart = await cart.populate('items.product');
    return { success: true, data: cart };
};

const updateCartItemService = async (email, productId, quantity) => {
    if (!productId || quantity === undefined || quantity < 1) {
        return { success: false, status: 400, message: 'Thông tin sản phẩm hoặc số lượng không hợp lệ' };
    }

    const product = await Product.findById(productId);
    if (!product) {
        return { success: false, status: 404, message: 'Sản phẩm không tồn tại' };
    }

    let cart = await Cart.findOne({ email });
    if (!cart) {
        return { success: false, status: 404, message: 'Không tìm thấy giỏ hàng' };
    }

    const existingItemIndex = cart.items.findIndex(item => item.product.toString() === productId);
    if (existingItemIndex === -1) {
        return { success: false, status: 404, message: 'Sản phẩm không có trong giỏ hàng' };
    }

    if (quantity > product.stock) {
        return { success: false, status: 400, message: `Số lượng vượt quá tồn kho (Còn lại: ${product.stock})` };
    }

    cart.items[existingItemIndex].quantity = quantity;
    await cart.save();
    cart = await cart.populate('items.product');
    return { success: true, data: cart };
};

const removeCartItemService = async (email, productId) => {
    if (!productId) {
        return { success: false, status: 400, message: 'Mã sản phẩm không hợp lệ' };
    }

    let cart = await Cart.findOne({ email });
    if (!cart) {
        return { success: false, status: 404, message: 'Không tìm thấy giỏ hàng' };
    }

    cart.items = cart.items.filter(item => item.product.toString() !== productId);
    await cart.save();
    cart = await cart.populate('items.product');
    return { success: true, data: cart };
};

const clearCartService = async (email) => {
    let cart = await Cart.findOne({ email });
    if (cart) {
        cart.items = [];
        await cart.save();
    }
    return { success: true, data: cart };
};

module.exports = {
    getCartService,
    addToCartService,
    updateCartItemService,
    removeCartItemService,
    clearCartService
};
