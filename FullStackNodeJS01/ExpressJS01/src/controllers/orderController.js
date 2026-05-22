const Order = require('../models/order');
const Cart = require('../models/cart');
const Product = require('../models/product');

// Helper to auto-confirm orders older than 30 minutes
const autoConfirmOrders = async (email) => {
    try {
        const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
        await Order.updateMany(
            {
                email,
                orderStatus: 'PENDING',
                createdAt: { $lte: thirtyMinutesAgo }
            },
            {
                $set: { orderStatus: 'CONFIRMED' }
            }
        );
    } catch (error) {
        console.error('autoConfirmOrders helper error:', error);
    }
};

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

        // 5. Determine statuses (all new orders start as PENDING / "Đơn hàng mới")
        const finalPaymentStatus = paymentStatus || 'PENDING';
        const finalOrderStatus = 'PENDING';

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
        // Trigger auto confirm check first
        await autoConfirmOrders(email);

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
        // Trigger auto confirm check first
        await autoConfirmOrders(email);

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

// Cancel order (within 30 minutes of creation)
const cancelOrder = async (req, res) => {
    try {
        const email = req.user.email;
        const orderId = req.params.id;

        // Auto confirm check first
        await autoConfirmOrders(email);

        const order = await Order.findById(orderId).populate('items.product');
        if (!order) {
            return res.status(404).json({ message: 'Không tìm thấy đơn hàng.' });
        }

        if (order.email !== email) {
            return res.status(403).json({ message: 'Bạn không có quyền hủy đơn hàng này.' });
        }

        // Verify timeframe (within 30 mins)
        const elapsedMs = Date.now() - new Date(order.createdAt).getTime();
        const thirtyMinutesMs = 30 * 60 * 1000;
        if (elapsedMs >= thirtyMinutesMs) {
            return res.status(400).json({ message: 'Đã quá 30 phút kể từ khi đặt đơn, bạn không thể hủy đơn hàng này.' });
        }

        if (order.orderStatus === 'PENDING' || order.orderStatus === 'CONFIRMED') {
            // Immediate cancel: update status, restore stock, and reduce sold
            order.orderStatus = 'CANCELLED';
            order.paymentStatus = 'FAILED';
            
            for (const item of order.items) {
                if (item.product) {
                    await Product.findByIdAndUpdate(item.product._id, {
                        $inc: { stock: item.quantity, sold: -item.quantity }
                    });
                }
            }
            await order.save();
            return res.status(200).json({ 
                message: 'Hủy đơn hàng thành công. Đã hoàn lại số lượng tồn kho sản phẩm.',
                order 
            });
        } else if (order.orderStatus === 'PROCESSING') {
            // Request cancel: status becomes CANCEL_REQUESTED
            order.orderStatus = 'CANCEL_REQUESTED';
            await order.save();
            return res.status(200).json({ 
                message: 'Đơn hàng đang chuẩn bị. Đã gửi yêu cầu hủy đơn tới shop.',
                order 
            });
        } else {
            return res.status(400).json({ 
                message: `Không thể hủy đơn hàng đang ở trạng thái "${order.orderStatus}".` 
            });
        }
    } catch (error) {
        console.error('cancelOrder error:', error);
        return res.status(500).json({ message: 'Gặp lỗi khi thực hiện hủy đơn hàng.' });
    }
};

// Update order status manually (for Admin simulation)
const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'CANCEL_REQUESTED'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Trạng thái đơn hàng không hợp lệ.' });
        }

        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: 'Không tìm thấy đơn hàng.' });
        }

        // If cancelling, restore stock (unless it was already cancelled)
        if (status === 'CANCELLED' && order.orderStatus !== 'CANCELLED') {
            for (const item of order.items) {
                await Product.findByIdAndUpdate(item.product, {
                    $inc: { stock: item.quantity, sold: -item.quantity }
                });
            }
        }

        // If moving out of CANCELLED, we may need to re-deduct stock, but for simplicity
        // simulation is mostly one-way. Let's just update the status.
        order.orderStatus = status;
        await order.save();

        const populated = await Order.findById(order._id).populate('items.product');
        return res.status(200).json(populated);
    } catch (error) {
        console.error('updateOrderStatus error:', error);
        return res.status(500).json({ message: 'Giả lập cập nhật trạng thái thất bại.' });
    }
};

// Simulate elapsed time (set createdAt to 31 minutes ago)
const simulateOrderTime = async (req, res) => {
    try {
        const orderId = req.params.id;
        const mongoose = require('mongoose');
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: 'Không tìm thấy đơn hàng.' });
        }

        const targetDate = new Date(Date.now() - 31 * 60 * 1000);
        // Bypass Mongoose timestamps immutable restriction using raw mongodb updateOne
        await Order.collection.updateOne(
            { _id: new mongoose.Types.ObjectId(orderId) },
            { $set: { createdAt: targetDate } }
        );

        const updated = await Order.findById(orderId).populate('items.product');
        return res.status(200).json(updated);
    } catch (error) {
        console.error('simulateOrderTime error:', error);
        return res.status(500).json({ message: 'Giả lập trôi qua 30 phút thất bại.' });
    }
};

module.exports = {
    createOrder,
    getUserOrders,
    getOrderById,
    cancelOrder,
    updateOrderStatus,
    simulateOrderTime
};
