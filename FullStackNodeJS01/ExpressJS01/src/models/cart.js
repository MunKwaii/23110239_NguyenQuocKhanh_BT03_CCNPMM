const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'product',
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: [1, 'Quantity must be at least 1']
    }
}, { _id: false });

const cartSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    items: [cartItemSchema]
}, {
    timestamps: true
});

const Cart = mongoose.model('cart', cartSchema);

module.exports = Cart;
