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
    }
}, {
    timestamps: true // Tự động sinh ra 2 trường createdAt và updatedAt
});

// Tạo model từ schema
const User = mongoose.model('user', userSchema);

module.exports = User;