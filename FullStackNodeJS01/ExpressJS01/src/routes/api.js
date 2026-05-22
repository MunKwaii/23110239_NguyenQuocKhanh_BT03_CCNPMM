const express = require('express');
const { createUser, handleLogin, getUser, getAccount, handleForgotPassword, handleResetPassword } = require('../controllers/apiController');
const { getProducts, getProductById, getSimilarProducts, getFilterMeta, getTopProducts } = require('../controllers/productController');
const { getCart, addToCart, updateCartItem, removeCartItem, clearCart } = require('../controllers/cartController');
const { createOrder, getUserOrders, getOrderById, cancelOrder, updateOrderStatus, simulateOrderTime } = require('../controllers/orderController');
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
router.get('/products', getProducts);
router.get('/products/meta/filters', getFilterMeta);
router.get('/products/top', getTopProducts);
router.get('/products/:id', getProductById);
router.get('/products/:id/similar', getSimilarProducts);

// Giỏ hàng (Cart) routes
router.get('/cart', getCart);
router.post('/cart', addToCart);
router.put('/cart', updateCartItem);
router.delete('/cart/:productId', removeCartItem);
router.delete('/cart', clearCart);

// Đơn hàng (Order) routes
router.post('/orders', createOrder);
router.get('/orders', getUserOrders);
router.get('/orders/:id', getOrderById);
router.post('/orders/:id/cancel', cancelOrder);
router.put('/orders/:id/status', updateOrderStatus);
router.put('/orders/:id/simulate-time', simulateOrderTime);

module.exports = router;