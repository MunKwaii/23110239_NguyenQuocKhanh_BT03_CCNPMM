import { createContext, useState, useEffect, useContext } from 'react';
import { AuthContext } from './auth.context';
import { getCartApi, addToCartApi, updateCartItemApi, removeCartItemApi, clearCartApi } from '../../util/api';
import { message } from 'antd';

export const CartContext = createContext({
    cart: null,
    loading: false,
    cartCount: 0,
    fetchCart: () => {},
    addToCart: async () => false,
    updateCartItem: async () => false,
    removeCartItem: async () => false,
    clearCart: async () => false
});

export const CartWrapper = (props) => {
    const { auth } = useContext(AuthContext);
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(false);

    const fetchCart = async () => {
        if (!auth.isAuthenticated) return;
        setLoading(true);
        try {
            const res = await getCartApi();
            if (res && !res.message) {
                setCart(res);
            }
        } catch (error) {
            console.error("fetchCart error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (auth.isAuthenticated) {
            fetchCart();
        } else {
            setCart(null);
        }
    }, [auth.isAuthenticated]);

    const addToCart = async (productId, quantity) => {
        try {
            const res = await addToCartApi(productId, quantity);
            if (res && !res.message) {
                setCart(res);
                return true;
            } else {
                message.error(res?.message || "Thêm sản phẩm thất bại");
                return false;
            }
        } catch (error) {
            message.error("Lỗi kết nối");
            return false;
        }
    };

    const updateCartItem = async (productId, quantity) => {
        try {
            const res = await updateCartItemApi(productId, quantity);
            if (res && !res.message) {
                setCart(res);
                return true;
            } else {
                message.error(res?.message || "Cập nhật thất bại");
                return false;
            }
        } catch (error) {
            message.error("Lỗi kết nối");
            return false;
        }
    };

    const removeCartItem = async (productId) => {
        try {
            const res = await removeCartItemApi(productId);
            if (res && !res.message) {
                setCart(res);
                return true;
            } else {
                message.error(res?.message || "Xóa thất bại");
                return false;
            }
        } catch (error) {
            message.error("Lỗi kết nối");
            return false;
        }
    };

    const clearCart = async () => {
        try {
            const res = await clearCartApi();
            if (res && res.cart) {
                setCart(res.cart || { items: [] });
                return true;
            } else {
                message.error(res?.message || "Xóa giỏ hàng thất bại");
                return false;
            }
        } catch (error) {
            message.error("Lỗi kết nối");
            return false;
        }
    };

    const cartCount = cart?.items?.reduce((total, item) => total + item.quantity, 0) || 0;

    return (
        <CartContext.Provider value={{
            cart,
            loading,
            cartCount,
            fetchCart,
            addToCart,
            updateCartItem,
            removeCartItem,
            clearCart
        }}>
            {props.children}
        </CartContext.Provider>
    );
};
