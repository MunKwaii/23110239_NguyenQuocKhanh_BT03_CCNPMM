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
};