const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    email: {
        type: String,
        default: null // null indicates it's a general system-wide or admin notification
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['order', 'post', 'event', 'review', 'comment', 'system'],
        required: true
    },
    isRead: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('notification', notificationSchema);
