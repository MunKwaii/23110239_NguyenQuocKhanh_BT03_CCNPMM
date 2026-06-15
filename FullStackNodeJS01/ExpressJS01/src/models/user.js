const mongoose = require('mongoose');

// Khai báo cấu trúc các trường dữ liệu của User
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true // Không được trùng lặp
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        default: "USER"
    },
    loyaltyPoints: {
        type: Number,
        default: 0
    },
    coupons: [{
        code: { type: String, required: true },
        discountType: { type: String, enum: ['percentage', 'fixed_amount'], default: 'percentage' },
        discountValue: { type: Number, required: true },
        minOrderValue: { type: Number, default: 0 },
        description: { type: String, default: '' },
        isUsed: { type: Boolean, default: false },
        acquiredAt: { type: Date, default: Date.now }
    }],
    favorites: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'product'
    }],
    viewedProducts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'product'
    }],
    walletBalance: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true // Tự động sinh ra 2 trường createdAt và updatedAt
});

// Tạo model từ schema
const User = mongoose.model('user', userSchema);

module.exports = User;