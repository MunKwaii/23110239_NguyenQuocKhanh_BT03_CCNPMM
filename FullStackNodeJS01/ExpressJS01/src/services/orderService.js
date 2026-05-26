const Order = require('../models/order');
const Cart = require('../models/cart');
const Product = require('../models/product');
const mongoose = require('mongoose');

// Helper to auto-confirm orders older than 30 minutes
const autoConfirmOrdersService = async (email) => {
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

const createOrderService = async (email, orderData) => {
    const { fullName, phoneNumber, address, notes, paymentMethod, paymentStatus } = orderData;

    if (!fullName || !phoneNumber || !address || !paymentMethod) {
        return { success: false, status: 400, message: 'Vui lòng cung cấp đầy đủ thông tin giao hàng và phương thức thanh toán.' };
    }

    const cart = await Cart.findOne({ email }).populate('items.product');
    if (!cart || cart.items.length === 0) {
        return { success: false, status: 400, message: 'Giỏ hàng của bạn đang trống, không thể thanh toán.' };
    }

    // Validate stock for all items
    for (const item of cart.items) {
        if (!item.product) {
            return { success: false, status: 400, message: 'Có sản phẩm trong giỏ hàng không tồn tại trên hệ thống.' };
        }
        if (item.product.stock < item.quantity) {
            return {
                success: false,
                status: 400,
                message: `Sản phẩm "${item.product.name}" không đủ hàng trong kho (Còn lại: ${item.product.stock}). Vui lòng cập nhật lại giỏ hàng.`
            };
        }
    }

    // Calculate prices and build order items
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

    const shippingFee = subtotal > 5000000 ? 0 : 30000;
    const totalAmount = subtotal + shippingFee;

    const finalPaymentStatus = paymentStatus || 'PENDING';
    const finalOrderStatus = 'PENDING';

    // Deduct stock and increment sold
    for (const item of cart.items) {
        await Product.findByIdAndUpdate(item.product._id, {
            $inc: { stock: -item.quantity, sold: item.quantity }
        });
    }

    // Create order
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

    // Clear user's cart
    cart.items = [];
    await cart.save();

    const populatedOrder = await Order.findById(order._id).populate('items.product');
    return { success: true, data: populatedOrder };
};

const getUserOrdersService = async (email) => {
    await autoConfirmOrdersService(email);
    const orders = await Order.find({ email })
        .sort({ createdAt: -1 })
        .populate('items.product');
    return { success: true, data: orders };
};

const getOrderByIdService = async (email, id) => {
    await autoConfirmOrdersService(email);
    const order = await Order.findById(id).populate('items.product');

    if (!order) {
        return { success: false, status: 404, message: 'Không tìm thấy đơn hàng.' };
    }

    if (order.email !== email) {
        return { success: false, status: 403, message: 'Bạn không có quyền xem đơn hàng này.' };
    }

    return { success: true, data: order };
};

const cancelOrderService = async (email, id) => {
    await autoConfirmOrdersService(email);
    const order = await Order.findById(id).populate('items.product');
    if (!order) {
        return { success: false, status: 404, message: 'Không tìm thấy đơn hàng.' };
    }

    if (order.email !== email) {
        return { success: false, status: 403, message: 'Bạn không có quyền hủy đơn hàng này.' };
    }

    if (order.orderStatus === 'PENDING' || order.orderStatus === 'CONFIRMED') {
        const elapsedMs = Date.now() - new Date(order.createdAt).getTime();
        const thirtyMinutesMs = 30 * 60 * 1000;
        if (elapsedMs >= thirtyMinutesMs) {
            return { success: false, status: 400, message: 'Đã quá 30 phút kể từ khi đặt đơn, bạn không thể hủy trực tiếp đơn hàng này.' };
        }

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
        return {
            success: true,
            message: 'Hủy đơn hàng thành công. Đã hoàn lại số lượng tồn kho sản phẩm.',
            data: order
        };
    } else if (order.orderStatus === 'PROCESSING') {
        order.orderStatus = 'CANCEL_REQUESTED';
        await order.save();
        return {
            success: true,
            message: 'Đơn hàng đang chuẩn bị. Đã gửi yêu cầu hủy đơn tới shop.',
            data: order
        };
    } else {
        return {
            success: false,
            status: 400,
            message: `Không thể hủy đơn hàng đang ở trạng thái "${order.orderStatus}".`
        };
    }
};

const updateOrderStatusService = async (id, status) => {
    const validStatuses = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'CANCEL_REQUESTED'];
    if (!validStatuses.includes(status)) {
        return { success: false, status: 400, message: 'Trạng thái đơn hàng không hợp lệ.' };
    }

    const order = await Order.findById(id);
    if (!order) {
        return { success: false, status: 404, message: 'Không tìm thấy đơn hàng.' };
    }

    if (status === 'CANCELLED' && order.orderStatus !== 'CANCELLED') {
        for (const item of order.items) {
            await Product.findByIdAndUpdate(item.product, {
                $inc: { stock: item.quantity, sold: -item.quantity }
            });
        }
    }

    order.orderStatus = status;
    await order.save();

    const populated = await Order.findById(order._id).populate('items.product');
    return { success: true, data: populated };
};

const simulateOrderTimeService = async (id) => {
    const order = await Order.findById(id);
    if (!order) {
        return { success: false, status: 404, message: 'Không tìm thấy đơn hàng.' };
    }

    const targetDate = new Date(Date.now() - 31 * 60 * 1000);
    await Order.collection.updateOne(
        { _id: new mongoose.Types.ObjectId(id) },
        { $set: { createdAt: targetDate } }
    );

    const updated = await Order.findById(id).populate('items.product');
    return { success: true, data: updated };
};

module.exports = {
    createOrderService,
    getUserOrdersService,
    getOrderByIdService,
    cancelOrderService,
    updateOrderStatusService,
    simulateOrderTimeService
};
