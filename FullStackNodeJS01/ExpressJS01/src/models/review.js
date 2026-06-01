const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'product',
        required: true
    },
    email: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        required: true
    },
    rewardType: {
        type: String,
        enum: ['points', 'coupon'],
        required: true
    },
    rewardValue: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('review', reviewSchema);
