import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../components/context/auth.context';
import { CartContext } from '../components/context/cart.context';
import { Modal, notification, Spin } from 'antd';

const fmt = (v) => (v != null ? new Intl.NumberFormat('vi-VN').format(v) + 'đ' : '');

const CartPage = () => {
    const { auth, setAuth } = useContext(AuthContext);
    const { cart, loading, updateCartItem, removeCartItem, clearCart, cartCount } = useContext(CartContext);
    const navigate = useNavigate();
    const [checkingOut, setCheckingOut] = useState(false);

    const isMember = auth.isAuthenticated && (auth.user.role || 'USER') === 'USER';

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        setAuth({ isAuthenticated: false, user: { email: '', name: '', role: '' } });
        navigate('/login');
    };

    const pageStyle = { minHeight: '100vh', background: '#0f172a', color: '#f1f5f9', fontFamily: "'Inter', system-ui, sans-serif" };

    /* Gate screens */
    if (!auth.isAuthenticated) return (
        <div style={{ ...pageStyle, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center', background: '#1e293b', border: '1px solid #334155', borderRadius: 24, padding: 60, maxWidth: 400 }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
                <h2 style={{ color: '#f8fafc', margin: '0 0 12px' }}>Vui lòng đăng nhập</h2>
                <p style={{ color: '#94a3b8', margin: '0 0 24px' }}>Đăng nhập để xem và quản lý giỏ hàng của bạn.</p>
                <button onClick={() => navigate('/login')} style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', color: '#fff', border: 'none', borderRadius: 12, padding: '12px 32px', fontWeight: 700, cursor: 'pointer' }}>
                    Đăng nhập
                </button>
            </div>
        </div>
    );

    if (!isMember) return (
        <div style={{ ...pageStyle, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center', background: '#1e293b', border: '1px solid #334155', borderRadius: 24, padding: 60, maxWidth: 480 }}>
                <div style={{ fontSize: 56, marginBottom: 16 }}>⚠️</div>
                <h1 style={{ color: '#f8fafc', fontSize: 26, fontWeight: 800, margin: '0 0 12px' }}>Quyền truy cập bị từ chối</h1>
                <p style={{ color: '#94a3b8', margin: '0 0 28px' }}>Tài khoản của bạn chưa có quyền thành viên.</p>
                <button onClick={handleLogout} style={{ background: '#dc2626', color: '#fff', border: 'none', borderRadius: 12, padding: '12px 32px', fontWeight: 700, cursor: 'pointer' }}>Đăng xuất</button>
            </div>
        </div>
    );

    const handleQtyChange = async (productId, newQty, stock) => {
        if (newQty < 1) return;
        if (newQty > stock) {
            notification.warning({ message: 'Vượt quá giới hạn', description: `Sản phẩm này chỉ còn ${stock} sản phẩm trong kho.` });
            return;
        }
        await updateCartItem(productId, newQty);
    };

    const handleRemoveItem = async (productId, productName) => {
        Modal.confirm({
            title: 'Xác nhận xóa',
            content: `Bạn có chắc chắn muốn xóa sản phẩm "${productName}" khỏi giỏ hàng?`,
            okText: 'Xóa',
            okType: 'danger',
            cancelText: 'Hủy',
            onOk: async () => {
                const success = await removeCartItem(productId);
                if (success) {
                    notification.success({ message: 'Đã xóa sản phẩm', description: `Đã xóa ${productName} khỏi giỏ hàng.` });
                }
            }
        });
    };

    const handleCheckout = () => {
        navigate('/checkout');
    };

    // Calculate billing
    const items = cart?.items || [];
    const subtotal = items.reduce((sum, item) => {
        const p = item.product;
        const price = p?.salePrice || p?.price || 0;
        return sum + price * item.quantity;
    }, 0);

    const shippingFee = subtotal === 0 ? 0 : (subtotal > 5000000 ? 0 : 30000); // Freeship for orders over 5M VND
    const totalAmount = subtotal + shippingFee;

    return (
        <div style={pageStyle}>
            {/* Breadcrumbs */}
            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '20px 24px 0', display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: '#64748b' }}>
                <span onClick={() => navigate('/')} style={{ cursor: 'pointer', color: '#a78bfa', fontWeight: 600 }}
                    onMouseEnter={e => e.currentTarget.style.color = '#c084fc'}
                    onMouseLeave={e => e.currentTarget.style.color = '#a78bfa'}
                >🎧 TechZone</span>
                <span>›</span>
                <span style={{ color: '#f1f5f9', fontWeight: 600 }}>Giỏ hàng của bạn</span>
            </div>

            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px' }}>
                <h1 style={{ fontSize: 32, fontWeight: 900, marginBottom: 32, color: '#f8fafc' }}>
                    🛒 Giỏ Hàng <span style={{ fontSize: 18, color: '#64748b', fontWeight: 400 }}>({cartCount} sản phẩm)</span>
                </h1>

                {loading && !cart ? (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '100px 0' }}>
                        <Spin size="large" tip="Đang tải giỏ hàng..." />
                    </div>
                ) : items.length === 0 ? (
                    <div style={{ textAlign: 'center', background: '#1e293b', border: '1px solid #334155', borderRadius: 24, padding: '80px 40px', maxWidth: 600, margin: '0 auto' }}>
                        <div style={{ fontSize: 72, marginBottom: 24 }}>🛍️</div>
                        <h2 style={{ color: '#f8fafc', marginBottom: 12 }}>Giỏ hàng của bạn đang trống</h2>
                        <p style={{ color: '#94a3b8', marginBottom: 32, lineHeight: 1.6 }}>Có vẻ như bạn chưa thêm sản phẩm nào vào giỏ hàng. Hãy khám phá các sản phẩm chất lượng cao của chúng tôi ngay!</p>
                        <button onClick={() => navigate('/')} style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', color: '#fff', border: 'none', borderRadius: 12, padding: '14px 36px', fontWeight: 700, fontSize: 15, cursor: 'pointer', transition: 'all 0.2s' }}
                            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'none'}
                        >
                            Tiếp tục mua sắm
                        </button>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: '2.2fr 1fr', gap: 32, alignItems: 'start' }}>
                        
                        {/* Cart items list */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            {items.map((item) => {
                                const p = item.product;
                                if (!p) return null;
                                const itemPrice = p.salePrice || p.price;
                                const itemSubtotal = itemPrice * item.quantity;
                                return (
                                    <div key={p._id} style={{ display: 'flex', gap: 20, background: '#1e293b', border: '1px solid #334155', borderRadius: 20, padding: 20, position: 'relative', alignItems: 'center' }}>
                                        {/* Product Image */}
                                        <div style={{ width: 100, height: 100, borderRadius: 12, overflow: 'hidden', background: '#0f172a', flexShrink: 0 }}>
                                            <img src={p.image} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        </div>

                                        {/* Info */}
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontSize: 11, color: '#a78bfa', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>{p.brand}</div>
                                            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#f8fafc', margin: '0 0 8px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', cursor: 'pointer' }}
                                                onClick={() => navigate(`/product/${p._id}`)}
                                            >
                                                {p.name}
                                            </h3>
                                            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                                                <span style={{ fontSize: 16, fontWeight: 800, color: '#fff' }}>{fmt(itemPrice)}</span>
                                                {p.salePrice && <span style={{ fontSize: 12, color: '#64748b', textDecoration: 'line-through' }}>{fmt(p.price)}</span>}
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 16, flexShrink: 0 }}>
                                            {/* Quantity selector */}
                                            <div style={{ display: 'flex', alignItems: 'center', background: '#0f172a', borderRadius: 10, overflow: 'hidden', border: '1px solid #334155' }}>
                                                <button onClick={() => handleQtyChange(p._id, item.quantity - 1, p.stock)}
                                                    style={{ width: 32, height: 32, border: 'none', background: 'transparent', color: '#fff', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                >−</button>
                                                <span style={{ minWidth: 32, textAlign: 'center', fontSize: 14, fontWeight: 700, color: '#f8fafc' }}>{item.quantity}</span>
                                                <button onClick={() => handleQtyChange(p._id, item.quantity + 1, p.stock)}
                                                    style={{ width: 32, height: 32, border: 'none', background: 'transparent', color: '#fff', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                >+</button>
                                            </div>

                                            {/* Subtotal & Delete */}
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                                <span style={{ fontSize: 16, fontWeight: 800, color: '#a78bfa' }}>{fmt(itemSubtotal)}</span>
                                                <button onClick={() => handleRemoveItem(p._id, p.name)}
                                                    style={{ background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: 14, padding: 0 }}
                                                    onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                                                    onMouseLeave={e => e.currentTarget.style.color = '#f87171'}
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Summary Column */}
                        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 24, padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
                            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#f8fafc', margin: 0, borderBottom: '1px solid #334155', paddingBottom: 16 }}>Tóm tắt đơn hàng</h2>
                            
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#94a3b8' }}>
                                <span>Tạm tính:</span>
                                <span style={{ color: '#f1f5f9', fontWeight: 600 }}>{fmt(subtotal)}</span>
                            </div>
                            
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#94a3b8' }}>
                                <span>Phí vận chuyển:</span>
                                <span style={{ color: shippingFee === 0 ? '#4ade80' : '#f1f5f9', fontWeight: 600 }}>
                                    {shippingFee === 0 ? 'Miễn phí' : fmt(shippingFee)}
                                </span>
                            </div>

                            {shippingFee > 0 && (
                                <div style={{ fontSize: 12, color: '#a78bfa', background: 'rgba(167,139,250,0.1)', padding: '8px 12px', borderRadius: 8, marginTop: -8 }}>
                                    💡 <i>Mua thêm <b>{fmt(5000000 - subtotal)}</b> để được miễn phí vận chuyển!</i>
                                </div>
                            )}

                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 18, fontWeight: 800, color: '#f8fafc', borderTop: '1px solid #334155', paddingTop: 16 }}>
                                <span>Tổng cộng:</span>
                                <span style={{ color: '#7c3aed' }}>{fmt(totalAmount)}</span>
                            </div>

                            <button onClick={handleCheckout} disabled={items.length === 0}
                                style={{
                                    width: '100%', padding: '16px 0', border: 'none', borderRadius: 14, fontWeight: 700, fontSize: 16, cursor: 'pointer',
                                    background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', color: '#fff', transition: 'transform 0.2s, box-shadow 0.2s'
                                }}
                                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(124,58,237,0.4)'; }}
                                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
                            >
                                Tiến hành thanh toán →
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CartPage;
