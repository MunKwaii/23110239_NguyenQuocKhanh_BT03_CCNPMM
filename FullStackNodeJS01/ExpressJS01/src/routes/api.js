const express = require('express');
const { createUser, handleLogin, getUser, getAccount, handleForgotPassword, handleResetPassword } = require('../controllers/apiController');
const auth = require("../middleware/auth");
const delay = require("../middleware/delay");

const router = express.Router();

// Route test cơ bản
router.get('/', (req, res) => {
    return res.status(200).json({
        message: "Hello từ API Express!"
    });
});

// Khai báo các API cho việc Đăng ký, Đăng nhập và Lấy danh sách User
router.post('/register', createUser);
router.post('/login', handleLogin);
router.post('/forgot-password', handleForgotPassword);
router.post('/reset-password', handleResetPassword);

router.use(auth);

router.get('/user', getUser);
router.get('/account', delay, getAccount);


module.exports = router;