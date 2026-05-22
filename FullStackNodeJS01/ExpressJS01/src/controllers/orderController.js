const Order = require('../models/order');
const Cart = require('../models/cart');
const Product = require('../models/product');

// Create a new order
const createOrder = async (req, res) => {
    try {
        const email = req.user.email;
        const { fullName, phoneNumber, address, notes, paymentMethod, paymentStatus } = req.body;

        // 1. Validate shipping details
        if (!fullName || !phoneNumber || !address || !paymentMethod) {
            return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ thông tin giao hàng và phương thức thanh toán.' });
        }

        // 2. Retrieve user's cart
        const cart = await Cart.findOne({ email }).populate('items.product');
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ message: 'Giỏ hàng của bạn đang trống, không thể thanh toán.' });
        }

        // 3. Validate stock for all items
        for (const item of cart.items) {
            if (!item.product) {
                return res.status(400).json({ message: 'Có sản phẩm trong giỏ hàng không tồn tại trên hệ thống.' });
            }
            if (item.product.stock < item.quantity) {
                return res.status(400).json({ 
                    message: `Sản phẩm "${item.product.name}" không đủ hàng trong kho (Còn lại: ${item.product.stock}). Vui lòng cập nhật lại giỏ hàng.` 
                });
            }
        }

        // 4. Calculate prices and build order items
        const orderItems = [];
        let subtotal = 0;
        for (const item of cart.items) {
            const price = item.product.salePrice || item.product.price;
            orderItems.push({
                product: item.product._id,
                quantity: item.quantity,
                price: price
            });
            subtotal += price * item.quantity;
        }

        const shippingFee = subtotal > 5000000 ? 0 : 30000; // Freeship above 5M VND, else 30k
        const totalAmount = subtotal + shippingFee;

        // 5. Determine statuses
        const finalPaymentStatus = paymentStatus || 'PENDING';
        const finalOrderStatus = (paymentMethod === 'COD' || finalPaymentStatus === 'PAID') ? 'PROCESSING' : 'PENDING';

        // 6. Deduct stock and increment sold
        for (const item of cart.items) {
            await Product.findByIdAndUpdate(item.product._id, {
                $inc: { stock: -item.quantity, sold: item.quantity }
            });
        }

        // 7. Create order
        const order = await Order.create({
            email,
            items: orderItems,
            shippingAddress: { fullName, phoneNumber, address, notes },
            paymentMethod,
            paymentStatus: finalPaymentStatus,
            orderStatus: finalOrderStatus,
            shippingFee,
            totalAmount
        });

        // 8. Clear user's cart
        cart.items = [];
        await cart.save();

        const populatedOrder = await Order.findById(order._id).populate('items.product');
        return res.status(201).json(populatedOrder);
    } catch (error) {
        console.error('createOrder error:', error);
        return res.status(500).json({ message: 'Đặt hàng thất bại, vui lòng thử lại sau.' });
    }
};

// Get all orders for logged-in user
const getUserOrders = async (req, res) => {
    try {
        const email = req.user.email;
        const orders = await Order.find({ email })
            .sort({ createdAt: -1 })
            .populate('items.product');
        return res.status(200).json(orders);
    } catch (error) {
        console.error('getUserOrders error:', error);
        return res.status(500).json({ message: 'Lấy danh sách đơn hàng thất bại.' });
    }
};

// Get single order details
const getOrderById = async (req, res) => {
    try {
        const email = req.user.email;
        const order = await Order.findById(req.params.id).populate('items.product');

        if (!order) {
            return res.status(404).json({ message: 'Không tìm thấy đơn hàng.' });
        }

        // Authorization check: User can only see their own orders
        if (order.email !== email) {
            return res.status(403).json({ message: 'Bạn không có quyền xem đơn hàng này.' });
        }

        return res.status(200).json(order);
    } catch (error) {
        console.error('getOrderById error:', error);
        return res.status(500).json({ message: 'Lấy chi tiết đơn hàng thất bại.' });
    }
};

module.exports = {
    createOrder,
    getUserOrders,
    getOrderById
};
