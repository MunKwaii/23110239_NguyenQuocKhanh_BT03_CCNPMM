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

    // --- Coupon & Points Calculation ---
    const User = require('../models/user');
    const Coupon = require('../models/coupon');
    const user = await User.findOne({ email });

    let couponDiscount = 0;
    let finalCouponCode = '';
    if (orderData.couponCode && orderData.couponCode.trim()) {
        const code = orderData.couponCode.trim().toUpperCase();
        let matchedCoupon = user.coupons.find(c => c.code.toUpperCase() === code && !c.isUsed);
        let isPersonal = false;

        if (matchedCoupon) {
            isPersonal = true;
        } else {
            const globalCoupon = await Coupon.findOne({ code, isActive: true });
            if (globalCoupon) {
                if (!globalCoupon.expiryDate || new Date(globalCoupon.expiryDate) >= new Date()) {
                    matchedCoupon = globalCoupon;
                }
            }
        }

        if (matchedCoupon) {
            if (subtotal >= matchedCoupon.minOrderValue) {
                if (matchedCoupon.discountType === 'percentage') {
                    couponDiscount = Math.round(subtotal * (matchedCoupon.discountValue / 100));
                } else if (matchedCoupon.discountType === 'fixed_amount') {
                    couponDiscount = matchedCoupon.discountValue;
                }

                if (couponDiscount > subtotal) {
                    couponDiscount = subtotal;
                }
                
                finalCouponCode = matchedCoupon.code;

                // If personal, mark it as used
                if (isPersonal) {
                    await User.updateOne(
                        { email, 'coupons.code': matchedCoupon.code },
                        { $set: { 'coupons.$.isUsed': true } }
                    );
                }
            } else {
                return { success: false, status: 400, message: `Mã giảm giá yêu cầu đơn hàng từ ${matchedCoupon.minOrderValue}đ.` };
            }
        } else {
            return { success: false, status: 400, message: 'Mã giảm giá không hợp lệ hoặc đã được sử dụng.' };
        }
    }

    let pointsRedeemed = 0;
    let pointsDiscount = 0;
    if (orderData.pointsToRedeem && parseInt(orderData.pointsToRedeem, 10) > 0) {
        const points = parseInt(orderData.pointsToRedeem, 10);
        if (user.loyaltyPoints < points) {
            return { success: false, status: 400, message: `Bạn không đủ điểm tích lũy (Hiện có: ${user.loyaltyPoints}).` };
        }

        pointsRedeemed = points;
        pointsDiscount = points * 100; // 1 point = 100đ

        const maxPointsDiscount = subtotal + shippingFee - couponDiscount;
        if (pointsDiscount > maxPointsDiscount) {
            pointsDiscount = maxPointsDiscount;
            pointsRedeemed = Math.ceil(maxPointsDiscount / 100);
        }

        // Deduct points
        await User.updateOne({ email }, { $inc: { loyaltyPoints: -pointsRedeemed } });
    }

    const totalAmount = Math.max(0, subtotal + shippingFee - couponDiscount - pointsDiscount);

    // Check for price mismatch and log it
    if (orderData.expectedSubtotal !== undefined && orderData.expectedTotalAmount !== undefined) {
        const expSub = Number(orderData.expectedSubtotal);
        const expTotal = Number(orderData.expectedTotalAmount);
        
        if (expSub !== subtotal || expTotal !== totalAmount) {
            const fs = require('fs');
            const path = require('path');
            try {
                const logDir = path.join(__dirname, '../../logs');
                if (!fs.existsSync(logDir)) {
                    fs.mkdirSync(logDir, { recursive: true });
                }
                const logFilePath = path.join(logDir, 'price_mismatch.log');
                const timestamp = new Date().toLocaleString('vi-VN');
                const logMessage = `[${timestamp}] CẢNH BÁO LỆCH GIÁ: User: ${email}\n` +
                    `  - Client hiển thị Subtotal: ${expSub.toLocaleString('vi-VN')}đ | Backend tính Subtotal: ${subtotal.toLocaleString('vi-VN')}đ\n` +
                    `  - Client hiển thị Total: ${expTotal.toLocaleString('vi-VN')}đ | Backend tính Total: ${totalAmount.toLocaleString('vi-VN')}đ\n` +
                    `  - Trạng thái: HỆ THỐNG ĐÃ ĐẶT HÀNG THEO GIÁ DB MỚI NHẤT (${totalAmount.toLocaleString('vi-VN')}đ)\n\n`;
                
                console.warn(`⚠️ [CẢNH BÁO LỆCH GIÁ] Phát hiện sai lệch giá khi đặt hàng cho user ${email}!`);
                console.warn(`  - Hiển thị trên màn hình khách: ${expSub}đ (Subtotal), ${expTotal}đ (Total)`);
                console.warn(`  - Thực tế tính toán từ Database: ${subtotal}đ (Subtotal), ${totalAmount}đ (Total)`);
                
                fs.appendFileSync(logFilePath, logMessage, 'utf8');
            } catch (err) {
                console.error('Lỗi khi ghi log price mismatch:', err);
            }
        }
    }

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
        totalAmount,
        couponCode: finalCouponCode,
        couponDiscount,
        pointsRedeemed,
        pointsDiscount
    });

    // Clear user's cart
    cart.items = [];
    await cart.save();

    const populatedOrder = await Order.findById(order._id).populate('items.product');

    // --- Real-time WebSockets & Email Notifications for New Order ---
    (async () => {
        try {
            const Notification = require('../models/notification');
            const websocketService = require('./websocketService');
            const emailService = require('./emailService');

            const shortId = order._id.toString().substring(18);
            const notifTitle = `Đơn hàng mới #${shortId}`;
            const notifMessage = `Đơn hàng mới #${shortId} đã được đặt thành công bởi ${fullName}. Tổng tiền: ${totalAmount.toLocaleString('vi-VN')}đ.`;

            // Save to database
            const notification = await Notification.create({
                email,
                title: notifTitle,
                message: notifMessage,
                type: 'order'
            });

            // Broadcast real-time notifications
            websocketService.broadcastNotification(notification);

            // Send notification email
            const emailHtml = `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                    <h2 style="color: #10b981; text-align: center; margin-bottom: 20px;">🎉 Xác nhận đặt đơn hàng thành công!</h2>
                    <p>Xin chào <strong>${fullName}</strong>,</p>
                    <p>Cảm ơn bạn đã lựa chọn mua sắm tại cửa hàng của chúng tôi. Đơn hàng <strong>#${order._id}</strong> của bạn đã được hệ thống tiếp nhận và xử lý.</p>
                    <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
                    <h3 style="color: #1e293b; border-bottom: 2px solid #3b82f6; padding-bottom: 6px; display: inline-block;">Thông tin giao hàng:</h3>
                    <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
                        <tr>
                            <td style="padding: 6px 0; color: #64748b; font-weight: 600; width: 150px;">Người nhận:</td>
                            <td style="padding: 6px 0; color: #334155;">${fullName}</td>
                        </tr>
                        <tr>
                            <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Số điện thoại:</td>
                            <td style="padding: 6px 0; color: #334155;">${phoneNumber}</td>
                        </tr>
                        <tr>
                            <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Địa chỉ nhận:</td>
                            <td style="padding: 6px 0; color: #334155;">${address}</td>
                        </tr>
                        <tr>
                            <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Hình thức thanh toán:</td>
                            <td style="padding: 6px 0; color: #334155;">${paymentMethod} (${finalPaymentStatus})</td>
                        </tr>
                        <tr style="border-top: 1px solid #f1f5f9;">
                            <td style="padding: 12px 0 6px 0; color: #1e293b; font-weight: bold; font-size: 16px;">Tổng thanh toán:</td>
                            <td style="padding: 12px 0 6px 0; color: #ef4444; font-weight: bold; font-size: 18px;">${totalAmount.toLocaleString('vi-VN')} VNĐ</td>
                        </tr>
                    </table>
                    <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
                    <p style="color: #475569; font-size: 14px;">Chúng tôi sẽ gửi thêm cập nhật khi đơn hàng của bạn chuyển sang trạng thái vận chuyển.</p>
                    <p style="font-size: 11px; color: #94a3b8; text-align: center; margin-top: 40px; border-top: 1px solid #f1f5f9; padding-top: 10px;">Hệ thống gửi thư tự động, vui lòng không phản hồi lại thư này.</p>
                </div>
            `;

            await emailService.sendEmail({
                to: email,
                subject: `[Antigravity Store] Xác nhận đơn hàng mới #${shortId} thành công`,
                html: emailHtml
            });
        } catch (err) {
            console.error('Error sending order notification:', err);
        }
    })();

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

    const oldStatus = order.orderStatus;

    if (status === 'CANCELLED' && oldStatus !== 'CANCELLED') {
        for (const item of order.items) {
            await Product.findByIdAndUpdate(item.product, {
                $inc: { stock: item.quantity, sold: -item.quantity }
            });
        }
    }

    order.orderStatus = status;

    // Automatically set payment status to PAID when DELIVERED
    if (status === 'DELIVERED') {
        order.paymentStatus = 'PAID';
    }

    await order.save();

    // If order is updated to DELIVERED and wasn't delivered before, fund wallet and send notification
    if (status === 'DELIVERED' && oldStatus !== 'DELIVERED') {
        (async () => {
            try {
                const User = require('../models/user');
                const Transaction = require('../models/transaction');
                const Notification = require('../models/notification');
                const websocketService = require('./websocketService');
                const emailService = require('./emailService');

                // Fund wallet
                const userObj = await User.findOne({ email: order.email });
                if (userObj) {
                    userObj.walletBalance = (userObj.walletBalance || 0) + order.totalAmount;
                    await userObj.save();

                    // Create transaction log
                    const shortId = order._id.toString().substring(18);
                    await Transaction.create({
                        email: order.email,
                        amount: order.totalAmount,
                        type: 'credit',
                        orderId: order._id,
                        description: `Hoàn tiền/Thanh toán đơn hàng giao thành công #${shortId}`
                    });

                    // Save notification
                    const notifTitle = `Đơn hàng đã giao thành công #${shortId}`;
                    const notifMessage = `Đơn hàng #${shortId} đã giao thành công. Số tiền ${order.totalAmount.toLocaleString('vi-VN')}đ đã được chuyển vào ví của bạn.`;
                    
                    const notification = await Notification.create({
                        email: order.email,
                        title: notifTitle,
                        message: notifMessage,
                        type: 'order'
                    });

                    // Broadcast
                    websocketService.broadcastNotification(notification);

                    // Send confirmation email
                    const emailHtml = `
                        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
                            <h2 style="color: #3b82f6; text-align: center; margin-bottom: 20px;">📦 Đơn hàng đã giao thành công!</h2>
                            <p>Xin chào quý khách,</p>
                            <p>Chúng tôi vui mừng thông báo đơn hàng <strong>#${order._id}</strong> đã được giao thành công tới bạn.</p>
                            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
                            <div style="background-color: #eff6ff; padding: 15px; border-radius: 8px; border: 1px solid #bfdbfe; margin-bottom: 20px;">
                                <h4 style="margin: 0 0 8px 0; color: #1e3a8a;">💰 Cập nhật ví tài khoản:</h4>
                                <p style="margin: 0; color: #1e40af; font-size: 15px;">
                                    Đã cộng <strong>+${order.totalAmount.toLocaleString('vi-VN')} VNĐ</strong> vào ví cá nhân của bạn.<br />
                                    Số dư ví của bạn hiện đã sẵn sàng để mua sắm các đơn hàng sau.
                                </p>
                            </div>
                            <p style="color: #475569; font-size: 14px;">Bạn có thể kiểm tra lịch sử giao dịch và ví tài khoản tại trang <strong>Báo cáo & Thống kê</strong>.</p>
                            <p style="font-size: 11px; color: #94a3b8; text-align: center; margin-top: 40px; border-top: 1px solid #f1f5f9; padding-top: 10px;">Hệ thống gửi thư tự động, vui lòng không phản hồi lại thư này.</p>
                        </div>
                    `;

                    await emailService.sendEmail({
                        to: order.email,
                        subject: `[Antigravity Store] Đơn hàng #${shortId} giao thành công - Cộng tiền vào ví`,
                        html: emailHtml
                    });
                }
            } catch (err) {
                console.error('Error funding wallet on delivery:', err);
            }
        })();
    } else if (status !== oldStatus) {
        // Notification for general status change
        (async () => {
            try {
                const Notification = require('../models/notification');
                const websocketService = require('./websocketService');

                const shortId = order._id.toString().substring(18);
                const statusNames = {
                    'CONFIRMED': 'Đã xác nhận',
                    'PROCESSING': 'Đang chuẩn bị hàng',
                    'SHIPPED': 'Đang vận chuyển',
                    'CANCELLED': 'Đã hủy',
                    'CANCEL_REQUESTED': 'Yêu cầu hủy đơn'
                };
                const statusLabel = statusNames[status] || status;

                const notification = await Notification.create({
                    email: order.email,
                    title: `Cập nhật đơn hàng #${shortId}`,
                    message: `Đơn hàng #${shortId} của bạn đã chuyển sang trạng thái: "${statusLabel}".`,
                    type: 'order'
                });

                websocketService.broadcastNotification(notification);
            } catch (err) {
                console.error('Error sending order status update notification:', err);
            }
        })();
    }

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
