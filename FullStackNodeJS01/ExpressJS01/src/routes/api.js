const express = require('express');
const { createUser, handleLogin, getUser, getAccount, handleForgotPassword, handleResetPassword, toggleFavorite, getFavorites, getViewedHistory } = require('../controllers/apiController');
const { getProducts, getProductById, getSimilarProducts, getFilterMeta, getTopProducts } = require('../controllers/productController');
const { getCart, addToCart, updateCartItem, removeCartItem, clearCart } = require('../controllers/cartController');
const { createOrder, getUserOrders, getOrderById, cancelOrder, updateOrderStatus, simulateOrderTime } = require('../controllers/orderController');
const { validateCoupon, getMyCoupons } = require('../controllers/couponController');
const { createReview, getProductReviews, checkReviewEligibility } = require('../controllers/reviewController');
const { getStatsSummary, getWalletHistory } = require('../controllers/statsController');
const { getNotifications, markAsRead, markAllAsRead, simulateNotification } = require('../controllers/notificationController');
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
router.get('/products/history/viewed', getViewedHistory);
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

// Coupons routes
router.post('/coupons/validate', validateCoupon);
router.get('/coupons/my-coupons', getMyCoupons);

// Reviews routes
router.post('/reviews', createReview);
router.get('/products/:productId/reviews', getProductReviews);
router.get('/products/:productId/review-eligibility', checkReviewEligibility);

// Favorites routes
router.post('/favorites', toggleFavorite);
router.get('/favorites', getFavorites);

// Statistics routes
router.get('/stats/summary', getStatsSummary);
router.get('/stats/wallet-history', getWalletHistory);

// Notifications routes
router.get('/notifications', getNotifications);
router.put('/notifications/read-all', markAllAsRead);
router.put('/notifications/:id/read', markAsRead);
router.post('/notifications/simulate', simulateNotification);

module.exports = router;