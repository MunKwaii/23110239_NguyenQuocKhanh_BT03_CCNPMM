const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'product',
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    price: {
        type: Number,
        required: true
    }
}, { _id: false });

const orderSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    items: [orderItemSchema],
    shippingAddress: {
        fullName: { type: String, required: true },
        phoneNumber: { type: String, required: true },
        address: { type: String, required: true },
        notes: { type: String, default: '' }
    },
    paymentMethod: {
        type: String,
        enum: ['COD', 'MOMO', 'VNPAY'],
        required: true
    },
    paymentStatus: {
        type: String,
        enum: ['PENDING', 'PAID', 'FAILED'],
        default: 'PENDING'
    },
    orderStatus: {
        type: String,
        enum: ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'CANCEL_REQUESTED'],
        default: 'PENDING'
    },
    shippingFee: {
        type: Number,
        required: true,
        default: 0
    },
    totalAmount: {
        type: Number,
        required: true
    },
    couponCode: {
        type: String,
        default: ''
    },
    couponDiscount: {
        type: Number,
        default: 0
    },
    pointsRedeemed: {
        type: Number,
        default: 0
    },
    pointsDiscount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

const Order = mongoose.model('order', orderSchema);

module.exports = Order;
