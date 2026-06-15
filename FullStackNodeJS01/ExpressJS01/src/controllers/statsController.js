const Order = require('../models/order');
const User = require('../models/user');
const Product = require('../models/product');
const Transaction = require('../models/transaction');

/**
 * Get statistical summaries for the admin dashboard/user stats.
 */
const getStatsSummary = async (req, res) => {
    try {
        const email = req.user.email;

        // 1. Current user's wallet balance
        const userObj = await User.findOne({ email });
        const walletBalance = userObj ? (userObj.walletBalance || 0) : 0;

        // 2. Fetch all orders to compute aggregate statistics
        const allOrders = await Order.find({});
        
        let totalRevenue = 0;
        let pendingCashFlow = 0; // Sum of PENDING, CONFIRMED, PROCESSING, SHIPPED
        let completedCashFlow = 0; // Sum of DELIVERED
        
        const statusCounts = {
            PENDING: 0,
            CONFIRMED: 0,
            PROCESSING: 0,
            SHIPPED: 0,
            DELIVERED: 0,
            CANCELLED: 0,
            CANCEL_REQUESTED: 0
        };

        const statusAmounts = {
            PENDING: 0,
            CONFIRMED: 0,
            PROCESSING: 0,
            SHIPPED: 0,
            DELIVERED: 0,
            CANCELLED: 0,
            CANCEL_REQUESTED: 0
        };

        allOrders.forEach(order => {
            const status = order.orderStatus;
            if (statusCounts[status] !== undefined) {
                statusCounts[status]++;
                statusAmounts[status] += order.totalAmount;
            }

            if (status === 'DELIVERED') {
                completedCashFlow += order.totalAmount;
                totalRevenue += order.totalAmount; // Revenue corresponds to delivered sales
            } else if (['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED'].includes(status)) {
                pendingCashFlow += order.totalAmount;
            }
        });

        // 3. New Customers registration timeline (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        sevenDaysAgo.setHours(0, 0, 0, 0);

        const newUsers = await User.find({ createdAt: { $gte: sevenDaysAgo } });
        
        // Build daily user signups
        const dailyNewUsers = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateString = date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
            
            const count = newUsers.filter(u => {
                const uDate = new Date(u.createdAt);
                return uDate.getDate() === date.getDate() && 
                       uDate.getMonth() === date.getMonth() && 
                       uDate.getFullYear() === date.getFullYear();
            }).length;

            dailyNewUsers.push({
                date: dateString,
                count: count
            });
        }

        // 4. Daily Sales timeline (last 7 days)
        const dailyRevenue = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateString = date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });

            const dayOrders = allOrders.filter(o => {
                const oDate = new Date(o.createdAt);
                return o.orderStatus === 'DELIVERED' &&
                       oDate.getDate() === date.getDate() && 
                       oDate.getMonth() === date.getMonth() && 
                       oDate.getFullYear() === date.getFullYear();
            });

            const amount = dayOrders.reduce((sum, o) => sum + o.totalAmount, 0);

            dailyRevenue.push({
                date: dateString,
                revenue: amount
            });
        }

        // 5. Top 10 Best Selling Products
        const topProducts = await Product.find({})
            .sort({ sold: -1 })
            .limit(10)
            .select('name image price salePrice sold stock rating');

        // 6. Detailed list of all orders categorized by status
        const ordersByStatus = {};
        const validStatuses = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'CANCEL_REQUESTED'];
        
        for (const status of validStatuses) {
            ordersByStatus[status] = allOrders.filter(o => o.orderStatus === status);
        }

        return res.status(200).json({
            success: true,
            data: {
                walletBalance,
                totalRevenue,
                pendingCashFlow,
                completedCashFlow,
                statusCounts,
                statusAmounts,
                dailyNewUsers,
                dailyRevenue,
                topProducts,
                ordersByStatus
            }
        });
    } catch (error) {
        console.error('getStatsSummary error:', error);
        return res.status(500).json({ message: 'Lấy dữ liệu thống kê thất bại.' });
    }
};

/**
 * Fetch wallet transactions history for logged-in user.
 */
const getWalletHistory = async (req, res) => {
    try {
        const email = req.user.email;
        const transactions = await Transaction.find({ email })
            .sort({ createdAt: -1 })
            .populate('orderId');
        
        return res.status(200).json({
            success: true,
            data: transactions
        });
    } catch (error) {
        console.error('getWalletHistory error:', error);
        return res.status(500).json({ message: 'Lấy lịch sử giao dịch ví thất bại.' });
    }
};

module.exports = {
    getStatsSummary,
    getWalletHistory
};
