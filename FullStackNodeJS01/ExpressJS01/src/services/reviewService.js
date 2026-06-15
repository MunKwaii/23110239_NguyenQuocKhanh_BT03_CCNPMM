const Review = require('../models/review');
const Order = require('../models/order');
const Product = require('../models/product');
const User = require('../models/user');

const createReviewService = async (email, name, reviewData) => {
    try {
        const { productId, rating, comment, rewardType } = reviewData;

        if (!productId) return { success: false, status: 400, message: 'Thiếu mã sản phẩm.' };
        if (!rating || rating < 1 || rating > 5) return { success: false, status: 400, message: 'Điểm đánh giá phải từ 1 đến 5 sao.' };
        if (!comment || !comment.trim()) return { success: false, status: 400, message: 'Nội dung nhận xét không được để trống.' };
        if (!['points', 'coupon'].includes(rewardType)) return { success: false, status: 400, message: 'Phương thức nhận thưởng không hợp lệ.' };

        // 1. Verify user purchased the product successfully
        const order = await Order.findOne({
            email,
            orderStatus: 'DELIVERED',
            'items.product': productId
        });

        if (!order) {
            return {
                success: false,
                status: 400,
                message: 'Bạn chỉ có thể đánh giá những sản phẩm đã được giao hàng thành công.'
            };
        }

        // 2. Check if already reviewed
        const existingReview = await Review.findOne({ email, product: productId });
        if (existingReview) {
            return {
                success: false,
                status: 400,
                message: 'Bạn đã viết đánh giá cho sản phẩm này trước đó.'
            };
        }

        // 3. Process reward
        let rewardValue = '';
        if (rewardType === 'points') {
            await User.findOneAndUpdate({ email }, { $inc: { loyaltyPoints: 100 } });
            rewardValue = '100'; // loyalty points
        } else if (rewardType === 'coupon') {
            const randomCode = 'REV-' + Math.random().toString(36).substring(2, 8).toUpperCase();
            const newCoupon = {
                code: randomCode,
                discountType: 'percentage',
                discountValue: 10,
                minOrderValue: 0,
                description: 'Voucher giảm 10% nhận từ việc đánh giá sản phẩm'
            };
            await User.findOneAndUpdate({ email }, { $push: { coupons: newCoupon } });
            rewardValue = randomCode;
        }

        // 4. Create review
        const review = await Review.create({
            product: productId,
            email,
            name,
            rating,
            comment,
            rewardType,
            rewardValue
        });

        // --- Real-time WebSockets & Email Notifications for New Review ---
        (async () => {
            try {
                const Notification = require('../models/notification');
                const websocketService = require('./websocketService');
                const emailService = require('./emailService');
                const Product = require('../models/product');

                const prod = await Product.findById(productId);
                const prodName = prod ? prod.name : 'sản phẩm';

                const notifTitle = `Đánh giá mới từ ${name}`;
                const notifMessage = `Khách hàng ${name} đã đánh giá ${rating}⭐ cho sản phẩm "${prodName}". Nhận xét: "${comment}"`;

                // Save to database (general notification, visible to Admin / users)
                const notification = await Notification.create({
                    email,
                    title: notifTitle,
                    message: notifMessage,
                    type: 'review'
                });

                // Broadcast
                websocketService.broadcastNotification(notification);

                // Send notification email
                const emailHtml = `
                    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
                        <h2 style="color: #f59e0b; text-align: center; margin-bottom: 20px;">✨ Đánh giá/Nhận xét mới!</h2>
                        <p>Chào Ban quản trị,</p>
                        <p>Hệ thống vừa nhận được một đánh giá mới từ khách hàng <strong>${name}</strong> (${email}).</p>
                        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
                        <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
                            <tr>
                                <td style="padding: 6px 0; color: #64748b; font-weight: 600; width: 150px;">Sản phẩm:</td>
                                <td style="padding: 6px 0; color: #334155;"><strong>${prodName}</strong></td>
                            </tr>
                            <tr>
                                <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Số sao đánh giá:</td>
                                <td style="padding: 6px 0; color: #f59e0b; font-weight: bold; font-size: 16px;">${'★'.repeat(rating)}${'☆'.repeat(5 - rating)} (${rating}/5 sao)</td>
                            </tr>
                            <tr>
                                <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Nội dung bình luận:</td>
                                <td style="padding: 6px 0; color: #334155; font-style: italic;">"${comment}"</td>
                            </tr>
                            <tr>
                                <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Phần thưởng nhận:</td>
                                <td style="padding: 6px 0; color: #10b981;">${rewardType === 'points' ? '100 Điểm tích lũy' : `Voucher giảm 10% (${rewardValue})`}</td>
                            </tr>
                        </table>
                        <p style="font-size: 11px; color: #94a3b8; text-align: center; margin-top: 40px; border-top: 1px solid #f1f5f9; padding-top: 10px;">Hệ thống gửi thư tự động, vui lòng không phản hồi lại thư này.</p>
                    </div>
                `;

                // Send to email for verification
                await emailService.sendEmail({
                    to: email,
                    subject: `[Antigravity Store] Đánh giá mới cho sản phẩm: ${prodName}`,
                    html: emailHtml
                });
            } catch (err) {
                console.error('Error sending review notification:', err);
            }
        })();

        // 5. Recalculate average rating of the product
        const allReviews = await Review.find({ product: productId });
        const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
        const avgRating = parseFloat((totalRating / allReviews.length).toFixed(1));
        await Product.findByIdAndUpdate(productId, { rating: avgRating });

        return {
            success: true,
            data: {
                review,
                rewardType,
                rewardValue
            }
        };
    } catch (error) {
        console.error('createReviewService error:', error);
        return { success: false, status: 500, message: 'Lỗi máy chủ khi tạo đánh giá.' };
    }
};

const getProductReviewsService = async (productId) => {
    try {
        const reviews = await Review.find({ product: productId }).sort({ createdAt: -1 });
        return { success: true, data: reviews };
    } catch (error) {
        console.error('getProductReviewsService error:', error);
        return { success: false, status: 500, message: 'Lỗi lấy danh sách đánh giá.' };
    }
};

const checkReviewEligibilityService = async (email, productId) => {
    try {
        // 1. Has any delivered order with this product?
        const order = await Order.findOne({
            email,
            orderStatus: 'DELIVERED',
            'items.product': productId
        });

        if (!order) {
            return {
                success: true,
                data: {
                    eligible: false,
                    reason: 'BẠN CHƯA MUA sản phẩm này hoặc đơn hàng chưa được giao thành công.'
                }
            };
        }

        // 2. Has already reviewed?
        const existingReview = await Review.findOne({ email, product: productId });
        if (existingReview) {
            return {
                success: true,
                data: {
                    eligible: false,
                    reason: 'Bạn ĐÃ ĐÁNH GIÁ sản phẩm này rồi.'
                }
            };
        }

        return {
            success: true,
            data: {
                eligible: true
            }
        };
    } catch (error) {
        console.error('checkReviewEligibilityService error:', error);
        return { success: false, status: 500, message: 'Lỗi kiểm tra tính hợp lệ của đánh giá.' };
    }
};

module.exports = {
    createReviewService,
    getProductReviewsService,
    checkReviewEligibilityService
};
