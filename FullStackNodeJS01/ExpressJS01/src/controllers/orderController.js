const {
    createOrderService,
    getUserOrdersService,
    getOrderByIdService,
    cancelOrderService,
    updateOrderStatusService,
    simulateOrderTimeService
} = require('../services/orderService');

// Create a new order
const createOrder = async (req, res) => {
    try {
        const email = req.user.email;
        const result = await createOrderService(email, req.body);
        if (!result.success) {
            return res.status(result.status).json({ message: result.message });
        }
        return res.status(201).json(result.data);
    } catch (error) {
        console.error('createOrder error:', error);
        return res.status(500).json({ message: 'Đặt hàng thất bại, vui lòng thử lại sau.' });
    }
};

// Get all orders for logged-in user
const getUserOrders = async (req, res) => {
    try {
        const email = req.user.email;
        const result = await getUserOrdersService(email);
        if (!result.success) {
            return res.status(result.status).json({ message: result.message });
        }
        return res.status(200).json(result.data);
    } catch (error) {
        console.error('getUserOrders error:', error);
        return res.status(500).json({ message: 'Lấy danh sách đơn hàng thất bại.' });
    }
};

// Get single order details
const getOrderById = async (req, res) => {
    try {
        const email = req.user.email;
        const result = await getOrderByIdService(email, req.params.id);
        if (!result.success) {
            return res.status(result.status).json({ message: result.message });
        }
        return res.status(200).json(result.data);
    } catch (error) {
        console.error('getOrderById error:', error);
        return res.status(500).json({ message: 'Lấy chi tiết đơn hàng thất bại.' });
    }
};

// Cancel order (within 30 minutes of creation)
const cancelOrder = async (req, res) => {
    try {
        const email = req.user.email;
        const result = await cancelOrderService(email, req.params.id);
        if (!result.success) {
            return res.status(result.status).json({ message: result.message });
        }
        return res.status(200).json({
            message: result.message,
            order: result.data
        });
    } catch (error) {
        console.error('cancelOrder error:', error);
        return res.status(500).json({ message: 'Gặp lỗi khi thực hiện hủy đơn hàng.' });
    }
};

// Update order status manually (for Admin simulation)
const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const result = await updateOrderStatusService(req.params.id, status);
        if (!result.success) {
            return res.status(result.status).json({ message: result.message });
        }
        return res.status(200).json(result.data);
    } catch (error) {
        console.error('updateOrderStatus error:', error);
        return res.status(500).json({ message: 'Giả lập cập nhật trạng thái thất bại.' });
    }
};

// Simulate elapsed time (set createdAt to 31 minutes ago)
const simulateOrderTime = async (req, res) => {
    try {
        const result = await simulateOrderTimeService(req.params.id);
        if (!result.success) {
            return res.status(result.status).json({ message: result.message });
        }
        return res.status(200).json(result.data);
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
