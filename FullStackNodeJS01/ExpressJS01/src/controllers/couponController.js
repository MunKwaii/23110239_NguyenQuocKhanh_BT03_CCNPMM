const { validateCouponService, getMyCouponsService } = require('../services/couponService');

const validateCoupon = async (req, res) => {
    try {
        const { code, orderSubtotal } = req.body;
        const email = req.user.email;
        const result = await validateCouponService(email, code, orderSubtotal);
        if (!result.success) {
            return res.status(400).json({ message: result.message });
        }
        return res.status(200).json(result.data);
    } catch (error) {
        console.error('validateCoupon error:', error);
        return res.status(500).json({ message: 'Gặp lỗi khi xác thực mã giảm giá.' });
    }
};

const getMyCoupons = async (req, res) => {
    try {
        const email = req.user.email;
        const result = await getMyCouponsService(email);
        if (!result.success) {
            return res.status(400).json({ message: result.message });
        }
        return res.status(200).json(result.data);
    } catch (error) {
        console.error('getMyCoupons error:', error);
        return res.status(500).json({ message: 'Không lấy được danh sách mã giảm giá.' });
    }
};

module.exports = {
    validateCoupon,
    getMyCoupons
};
