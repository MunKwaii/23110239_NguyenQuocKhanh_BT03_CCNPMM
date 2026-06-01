const Coupon = require('../models/coupon');
const User = require('../models/user');

const validateCouponService = async (email, code, orderSubtotal) => {
    try {
        if (!code || !code.trim()) {
            return { success: false, message: 'Mã giảm giá không được trống.' };
        }
        const cleanCode = code.trim().toUpperCase();

        // 1. Check user's personal coupon list
        const user = await User.findOne({ email });
        let matchedCoupon = user?.coupons?.find(c => c.code.toUpperCase() === cleanCode && !c.isUsed);

        let isPersonal = false;
        if (matchedCoupon) {
            isPersonal = true;
        } else {
            // 2. Check global coupons
            const globalCoupon = await Coupon.findOne({ code: cleanCode, isActive: true });
            if (globalCoupon) {
                // Check expiry date
                if (globalCoupon.expiryDate && new Date(globalCoupon.expiryDate) < new Date()) {
                    return { success: false, message: 'Mã giảm giá này đã hết hạn sử dụng.' };
                }
                matchedCoupon = globalCoupon;
            }
        }

        if (!matchedCoupon) {
            return { success: false, message: 'Mã giảm giá không hợp lệ hoặc đã được sử dụng.' };
        }

        // 3. Check min order value
        if (orderSubtotal < matchedCoupon.minOrderValue) {
            return {
                success: false,
                message: `Mã giảm giá yêu cầu đơn hàng tối thiểu ${new Intl.NumberFormat('vi-VN').format(matchedCoupon.minOrderValue)}đ.`
            };
        }

        // 4. Calculate discount
        let discountAmount = 0;
        if (matchedCoupon.discountType === 'percentage') {
            discountAmount = Math.round(orderSubtotal * (matchedCoupon.discountValue / 100));
        } else if (matchedCoupon.discountType === 'fixed_amount') {
            discountAmount = matchedCoupon.discountValue;
        }

        // Ensure discount doesn't exceed order subtotal
        if (discountAmount > orderSubtotal) {
            discountAmount = orderSubtotal;
        }

        return {
            success: true,
            data: {
                code: matchedCoupon.code,
                discountType: matchedCoupon.discountType,
                discountValue: matchedCoupon.discountValue,
                description: matchedCoupon.description,
                isPersonal,
                discountAmount
            }
        };
    } catch (error) {
        console.error('validateCouponService error:', error);
        return { success: false, message: 'Gặp lỗi trong quá trình áp dụng mã giảm giá.' };
    }
};

const getMyCouponsService = async (email) => {
    try {
        const user = await User.findOne({ email });
        if (!user) return { success: false, message: 'User not found' };
        return { success: true, data: user.coupons || [] };
    } catch (error) {
        return { success: false, message: 'Lấy danh sách mã giảm giá thất bại.' };
    }
};

const seedGlobalCoupons = async () => {
    try {
        const count = await Coupon.countDocuments();
        if (count === 0) {
            const initialCoupons = [
                {
                    code: 'WELCOME10',
                    discountType: 'percentage',
                    discountValue: 10,
                    minOrderValue: 200000,
                    description: 'Giảm 10% cho đơn hàng đầu tiên từ 200k',
                    isActive: true
                },
                {
                    code: 'GIAM50K',
                    discountType: 'fixed_amount',
                    discountValue: 50000,
                    minOrderValue: 500000,
                    description: 'Giảm 50.000đ cho đơn hàng từ 500k',
                    isActive: true
                },
                {
                    code: 'TECHZONE20',
                    discountType: 'percentage',
                    discountValue: 20,
                    minOrderValue: 2000000,
                    description: 'Giảm 20% cho đơn hàng từ 2 triệu',
                    isActive: true
                }
            ];
            await Coupon.insertMany(initialCoupons);
            console.log('✅ Seeded initial global coupons successfully!');
        }
    } catch (error) {
        console.error('Error seeding coupons:', error);
    }
};

module.exports = {
    validateCouponService,
    getMyCouponsService,
    seedGlobalCoupons
};
