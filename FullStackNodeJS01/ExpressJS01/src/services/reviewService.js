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
