const {
    createReviewService,
    getProductReviewsService,
    checkReviewEligibilityService
} = require('../services/reviewService');

const createReview = async (req, res) => {
    try {
        const email = req.user.email;
        const name = req.user.name;
        const result = await createReviewService(email, name, req.body);
        if (!result.success) {
            return res.status(result.status || 400).json({ message: result.message });
        }
        return res.status(201).json(result.data);
    } catch (error) {
        console.error('createReview error:', error);
        return res.status(500).json({ message: 'Gặp lỗi khi tạo đánh giá sản phẩm.' });
    }
};

const getProductReviews = async (req, res) => {
    try {
        const { productId } = req.params;
        const result = await getProductReviewsService(productId);
        if (!result.success) {
            return res.status(result.status || 400).json({ message: result.message });
        }
        return res.status(200).json(result.data);
    } catch (error) {
        console.error('getProductReviews error:', error);
        return res.status(500).json({ message: 'Gặp lỗi khi lấy danh sách đánh giá sản phẩm.' });
    }
};

const checkReviewEligibility = async (req, res) => {
    try {
        const { productId } = req.params;
        const email = req.user.email;
        const result = await checkReviewEligibilityService(email, productId);
        if (!result.success) {
            return res.status(result.status || 400).json({ message: result.message });
        }
        return res.status(200).json(result.data);
    } catch (error) {
        console.error('checkReviewEligibility error:', error);
        return res.status(500).json({ message: 'Gặp lỗi khi kiểm tra tính hợp lệ đánh giá.' });
    }
};

module.exports = {
    createReview,
    getProductReviews,
    checkReviewEligibility
};
