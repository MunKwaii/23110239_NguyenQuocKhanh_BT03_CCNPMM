const {
    createUserService,
    loginService,
    getUserService,
    forgotPasswordService,
    resetPasswordService,
    toggleFavoriteService,
    getFavoritesService,
    getViewedProductsService
} = require("../services/userService");
const User = require("../models/user");

const createUser = async (req, res) => {
    const { name, email, password } = req.body;
    const data = await createUserService(name, email, password);
    return res.status(200).json(data);
}

const handleLogin = async (req, res) => {
    const { email, password } = req.body;
    const data = await loginService(email, password);
    return res.status(200).json(data);
}

const handleForgotPassword = async (req, res) => {
    const { email } = req.body;
    const data = await forgotPasswordService(email);
    return res.status(200).json(data);
}

const handleResetPassword = async (req, res) => {
    const { email, password } = req.body;
    const data = await resetPasswordService(email, password);
    return res.status(200).json(data);
}

const getUser = async (req, res) => {
    const data = await getUserService();
    return res.status(200).json(data);
}

const getAccount = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.user.email }).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        return res.status(200).json(user);
    } catch (error) {
        return res.status(500).json({ message: 'Failed to fetch user account' });
    }
}

const toggleFavorite = async (req, res) => {
    try {
        const { productId } = req.body;
        const email = req.user.email;
        const result = await toggleFavoriteService(email, productId);
        if (!result.success) {
            return res.status(400).json({ message: result.message });
        }
        return res.status(200).json(result);
    } catch (error) {
        console.error('toggleFavorite error:', error);
        return res.status(500).json({ message: 'Lỗi toggle yêu thích.' });
    }
};

const getFavorites = async (req, res) => {
    try {
        const email = req.user.email;
        const result = await getFavoritesService(email);
        if (!result.success) {
            return res.status(400).json({ message: result.message });
        }
        return res.status(200).json(result.data);
    } catch (error) {
        console.error('getFavorites error:', error);
        return res.status(500).json({ message: 'Lỗi lấy danh sách yêu thích.' });
    }
};

const getViewedHistory = async (req, res) => {
    try {
        const email = req.user.email;
        const result = await getViewedProductsService(email);
        if (!result.success) {
            return res.status(400).json({ message: result.message });
        }
        return res.status(200).json(result.data);
    } catch (error) {
        console.error('getViewedHistory error:', error);
        return res.status(500).json({ message: 'Lỗi lấy danh sách sản phẩm đã xem.' });
    }
};

module.exports = {
    createUser,
    handleLogin,
    getUser,
    getAccount,
    handleForgotPassword,
    handleResetPassword,
    toggleFavorite,
    getFavorites,
    getViewedHistory
}
