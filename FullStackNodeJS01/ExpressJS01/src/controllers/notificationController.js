const Notification = require('../models/notification');
const websocketService = require('../services/websocketService');
const emailService = require('../services/emailService');

/**
 * Fetch all notifications for the authenticated user.
 */
const getNotifications = async (req, res) => {
    try {
        const email = req.user.email;
        // Retrieve notifications intended for the user or public notifications
        const notifications = await Notification.find({
            $or: [
                { email: email },
                { email: null }
            ]
        })
        .sort({ createdAt: -1 })
        .limit(50);

        return res.status(200).json({
            success: true,
            data: notifications
        });
    } catch (error) {
        console.error('getNotifications error:', error);
        return res.status(500).json({ message: 'Lấy danh sách thông báo thất bại.' });
    }
};

/**
 * Mark a single notification as read.
 */
const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const notification = await Notification.findByIdAndUpdate(id, { isRead: true }, { new: true });
        if (!notification) {
            return res.status(404).json({ message: 'Không tìm thấy thông báo.' });
        }
        return res.status(200).json({
            success: true,
            data: notification
        });
    } catch (error) {
        console.error('markAsRead error:', error);
        return res.status(500).json({ message: 'Cập nhật trạng thái thông báo thất bại.' });
    }
};

/**
 * Mark all notifications as read.
 */
const markAllAsRead = async (req, res) => {
    try {
        const email = req.user.email;
        await Notification.updateMany(
            {
                $or: [
                    { email: email },
                    { email: null }
                ],
                isRead: false
            },
            { isRead: true }
        );
        return res.status(200).json({
            success: true,
            message: 'Đã đánh dấu tất cả là đã đọc.'
        });
    } catch (error) {
        console.error('markAllAsRead error:', error);
        return res.status(500).json({ message: 'Đánh dấu tất cả thông báo thất bại.' });
    }
};

/**
 * Endpoint to simulate real-time notification activities (posts, events, comments).
 * Pushes alerts via WebSockets and sends an email to the logged-in user.
 */
const simulateNotification = async (req, res) => {
    try {
        const { type, title, message } = req.body;
        const email = req.user.email;

        const validTypes = ['post', 'event', 'comment', 'system'];
        if (!validTypes.includes(type)) {
            return res.status(400).json({ message: 'Loại hoạt động giả lập không hợp lệ.' });
        }

        const notification = await Notification.create({
            email: null, // Public notification
            title: title || `Hoạt động mới: ${type}`,
            message: message || `Hệ thống vừa diễn ra hoạt động loại ${type}.`,
            type: type
        });

        // Broadcast to WebSocket clients
        websocketService.broadcastNotification(notification);

        // Customize email styling based on simulation type
        let headerColor = '#3b82f6';
        let icon = '🔔';
        if (type === 'post') {
            headerColor = '#8b5cf6';
            icon = '📝';
        } else if (type === 'event') {
            headerColor = '#ec4899';
            icon = '🎉';
        } else if (type === 'comment') {
            headerColor = '#10b981';
            icon = '💬';
        }

        const emailHtml = `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
                <h2 style="color: ${headerColor}; text-align: center; margin-bottom: 20px;">${icon} Thông báo hoạt động mới</h2>
                <p>Xin chào quý khách,</p>
                <p>Hệ thống Antigravity Store vừa ghi nhận một hoạt động mới:</p>
                <div style="background-color: #f8fafc; padding: 18px; border-radius: 8px; border-left: 4px solid ${headerColor}; margin: 20px 0;">
                    <h4 style="margin: 0 0 8px 0; color: #1e293b; font-size: 16px;">${notification.title}</h4>
                    <p style="margin: 0; color: #475569; font-size: 14px; line-height: 1.6;">${notification.message}</p>
                </div>
                <p style="color: #64748b; font-size: 13px;">Hãy truy cập ứng dụng của chúng tôi để cập nhật chi tiết các tin tức và tính năng mới nhất.</p>
                <p style="font-size: 11px; color: #94a3b8; text-align: center; margin-top: 45px; border-top: 1px solid #f1f5f9; padding-top: 10px;">Hệ thống gửi thư tự động, vui lòng không phản hồi lại thư này.</p>
            </div>
        `;

        // Send confirmation email to current user for demo validation
        await emailService.sendEmail({
            to: email,
            subject: `[Antigravity Store] ${icon} ${notification.title}`,
            html: emailHtml
        });

        return res.status(201).json({
            success: true,
            data: notification
        });
    } catch (error) {
        console.error('simulateNotification error:', error);
        return res.status(500).json({ message: 'Giả lập thông báo thất bại.' });
    }
};

module.exports = {
    getNotifications,
    markAsRead,
    markAllAsRead,
    simulateNotification
};
