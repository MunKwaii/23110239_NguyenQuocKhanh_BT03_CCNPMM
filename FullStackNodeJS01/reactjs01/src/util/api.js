import axios from "./axios.customize";

const createUserApi = (name, email, password) => {
    return axios.post("/v1/api/register", { name, email, password });
};

const loginApi = (email, password) => {
    return axios.post("/v1/api/login", { email, password });
};

const forgotPasswordApi = (email) => {
    return axios.post("/v1/api/forgot-password", { email });
};

const resetPasswordApi = (email, password) => {
    return axios.post("/v1/api/reset-password", { email, password });
};

const getUserApi = () => {
    return axios.get("/v1/api/user");
};

const getAccountApi = () => {
    return axios.get("/v1/api/account");
};

/**
 * Get products with optional filters
 * @param {string} filter - preset filter: 'new' | 'best' | 'promo'
 * @param {number} limit  - max results
 * @param {object} params - { search, category, brand, minPrice, maxPrice, sortBy }
 */
const getProductsApi = (filter, limit, params = {}) => {
    return axios.get("/v1/api/products", {
        params: { filter, limit, ...params }
    });
};

const getProductByIdApi = (id) => {
    return axios.get(`/v1/api/products/${id}`);
};

const getSimilarProductsApi = (id, limit) => {
    return axios.get(`/v1/api/products/${id}/similar`, { params: { limit } });
};

const getFilterMetaApi = () => {
    return axios.get("/v1/api/products/meta/filters");
};

const getTopProductsApi = () => {
    return axios.get("/v1/api/products/top");
};

const getCartApi = () => {
    return axios.get("/v1/api/cart");
};

const addToCartApi = (productId, quantity) => {
    return axios.post("/v1/api/cart", { productId, quantity });
};

const updateCartItemApi = (productId, quantity) => {
    return axios.put("/v1/api/cart", { productId, quantity });
};

const removeCartItemApi = (productId) => {
    return axios.delete(`/v1/api/cart/${productId}`);
};

const clearCartApi = () => {
    return axios.delete("/v1/api/cart");
};

const createOrderApi = (orderData) => {
    return axios.post("/v1/api/orders", orderData);
};

const getUserOrdersApi = () => {
    return axios.get("/v1/api/orders");
};

const getOrderByIdApi = (id) => {
    return axios.get(`/v1/api/orders/${id}`);
};

const cancelOrderApi = (id) => {
    return axios.post(`/v1/api/orders/${id}/cancel`);
};

const updateOrderStatusApi = (id, status) => {
    return axios.put(`/v1/api/orders/${id}/status`, { status });
};

const simulateOrderTimeApi = (id) => {
    return axios.put(`/v1/api/orders/${id}/simulate-time`);
};

const toggleFavoriteApi = (productId) => {
    return axios.post("/v1/api/favorites", { productId });
};

const getFavoritesApi = () => {
    return axios.get("/v1/api/favorites");
};

const getViewedHistoryApi = () => {
    return axios.get("/v1/api/products/history/viewed");
};

const createReviewApi = (reviewData) => {
    return axios.post("/v1/api/reviews", reviewData);
};

const getReviewsApi = (productId) => {
    return axios.get(`/v1/api/products/${productId}/reviews`);
};

const checkReviewEligibilityApi = (productId) => {
    return axios.get(`/v1/api/products/${productId}/review-eligibility`);
};

const validateCouponApi = (code, orderSubtotal) => {
    return axios.post("/v1/api/coupons/validate", { code, orderSubtotal });
};

const getMyCouponsApi = () => {
    return axios.get("/v1/api/coupons/my-coupons");
};

export {
    createUserApi,
    loginApi,
    getUserApi,
    getAccountApi,
    getProductsApi,
    getProductByIdApi,
    getSimilarProductsApi,
    forgotPasswordApi,
    resetPasswordApi,
    getFilterMetaApi,
    getTopProductsApi,
    getCartApi,
    addToCartApi,
    updateCartItemApi,
    removeCartItemApi,
    clearCartApi,
    createOrderApi,
    getUserOrdersApi,
    getOrderByIdApi,
    cancelOrderApi,
    updateOrderStatusApi,
    simulateOrderTimeApi,
    toggleFavoriteApi,
    getFavoritesApi,
    getViewedHistoryApi,
    createReviewApi,
    getReviewsApi,
    checkReviewEligibilityApi,
    validateCouponApi,
    getMyCouponsApi
};