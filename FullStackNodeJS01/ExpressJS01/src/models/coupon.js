const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true
    },
    discountType: {
        type: String,
        enum: ['percentage', 'fixed_amount'],
        required: true
    },
    discountValue: {
        type: Number,
        required: true
    },
    minOrderValue: {
        type: Number,
        default: 0
    },
    description: {
        type: String,
        default: ''
    },
    expiryDate: {
        type: Date
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('coupon', couponSchema);
