import { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../components/context/auth.context';
import { CartContext } from '../components/context/cart.context';
import { createOrderApi, getAccountApi, validateCouponApi } from '../util/api';
import { Modal, notification, Spin, Input, Radio, Button, Form } from 'antd';

const fmt = (v) => (v != null ? new Intl.NumberFormat('vi-VN').format(v) + 'đ' : '');

const CheckoutPage = () => {
    const { auth } = useContext(AuthContext);
    const { cart, fetchCart, cartCount } = useContext(CartContext);
    const navigate = useNavigate();
    const [form] = Form.useForm();

    const [loading, setLoading] = useState(false);
    const [qrModalVisible, setQrModalVisible] = useState(false);
    const [selectedMethod, setSelectedMethod] = useState('COD');
    const [pendingOrderData, setPendingOrderData] = useState(null);

    // Coupon & Points States
    const [dbUser, setDbUser] = useState(null);
    const [couponInput, setCouponInput] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [validatingCoupon, setValidatingCoupon] = useState(false);
    const [pointsToUse, setPointsToUse] = useState(0);

    // Fetch db User data for fresh points/coupons wallet
    useEffect(() => {
        const fetchUserDb = async () => {
            const res = await getAccountApi();
            if (res && !res.message) {
                setDbUser(res);
            }
        };
        if (auth.isAuthenticated) fetchUserDb();
    }, [auth.isAuthenticated]);

    const isMember = auth.isAuthenticated && (auth.user.role || 'USER') === 'USER';

    // Protect route
    useEffect(() => {
        if (!auth.isAuthenticated) {
            navigate('/login');
        } else if (!isMember) {
            navigate('/');
        }
    }, [auth.isAuthenticated, isMember, navigate]);

    // Handle back if cart empty
    useEffect(() => {
        if (cart && (!cart.items || cart.items.length === 0)) {
            notification.info({
                message: 'Giỏ hàng trống',
                description: 'Vui lòng thêm sản phẩm vào giỏ hàng trước khi thanh toán.',
            });
            navigate('/cart');
        }
    }, [cart, navigate]);

    const pageStyle = {
        minHeight: '100vh',
        background: '#0f172a',
        color: '#f1f5f9',
        fontFamily: "'Inter', system-ui, sans-serif",
    };

    if (!auth.isAuthenticated || !isMember || !cart || !cart.items || cart.items.length === 0) {
        return (
            <div style={{ ...pageStyle, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Spin size="large" tip="Đang tải thông tin thanh toán..." />
            </div>
        );
    }

    // Bill calculations
    const items = cart.items;
    const subtotal = items.reduce((sum, item) => {
        const p = item.product;
        const price = p?.salePrice || p?.price || 0;
        return sum + price * item.quantity;
    }, 0);

    const shippingFee = subtotal > 5000000 ? 0 : 30000;
    const couponDiscount = appliedCoupon ? appliedCoupon.discountAmount : 0;
    const pointsDiscount = pointsToUse * 100;
    const totalAmount = Math.max(0, subtotal + shippingFee - couponDiscount - pointsDiscount);

    // Max points user can redeem (cannot exceed remaining balance needed for order subtotal + shippingFee - couponDiscount)
    const maxPointsRedeemable = dbUser ? Math.floor(Math.max(0, subtotal + shippingFee - couponDiscount) / 100) : 0;

    const handleApplyCoupon = async () => {
        if (!couponInput.trim()) {
            notification.warning({ message: 'Vui lòng nhập mã giảm giá.' });
            return;
        }
        setValidatingCoupon(true);
        try {
            const res = await validateCouponApi(couponInput, subtotal);
            if (res && !res.message) {
                setAppliedCoupon(res);
                notification.success({
                    message: '✓ Áp dụng mã thành công!',
                    description: `Đã nhận được giảm giá ${fmt(res.discountAmount)}`
                });
            } else {
                notification.error({
                    message: 'Mã không hợp lệ',
                    description: res?.message || 'Không thể áp dụng mã giảm giá này.'
                });
            }
        } catch (error) {
            console.error(error);
        } finally {
            setValidatingCoupon(false);
        }
    };

    const handleRemoveCoupon = () => {
        setAppliedCoupon(null);
        setCouponInput('');
        notification.info({ message: 'Đã hủy áp dụng mã giảm giá.' });
    };

    const handleFormSubmit = async (values) => {
        const orderData = {
            fullName: values.fullName,
            phoneNumber: values.phoneNumber,
            address: values.address,
            notes: values.notes || '',
            paymentMethod: selectedMethod,
            paymentStatus: 'PENDING',
            couponCode: appliedCoupon ? appliedCoupon.code : '',
            pointsToRedeem: pointsToUse,
            expectedSubtotal: subtotal,
            expectedTotalAmount: totalAmount
        };

        if (selectedMethod === 'COD') {
            await submitOrder(orderData);
        } else {
            // MoMo / VNPAY -> Show QR Code modal first
            setPendingOrderData(orderData);
            setQrModalVisible(true);
        }
    };

    const submitOrder = async (orderData) => {
        setLoading(true);
        try {
            const res = await createOrderApi(orderData);
            if (res && !res.message) {
                notification.success({
                    message: '🎉 Đặt hàng thành công!',
                    description: `Đơn hàng của bạn đã được khởi tạo với mã: ${res._id.substring(res._id.length - 8).toUpperCase()}`,
                });
                await fetchCart(); // Sync/Clear cart count
                navigate('/orders');
            } else {
                notification.error({
                    message: 'Đặt hàng thất bại',
                    description: res?.message || 'Đã có lỗi xảy ra, vui lòng thử lại.',
                });
            }
        } catch (error) {
            console.error('Order error:', error);
            notification.error({
                message: 'Lỗi hệ thống',
                description: 'Không thể kết nối đến máy chủ. Vui lòng thử lại sau.',
            });
        } finally {
            setLoading(false);
            setQrModalVisible(false);
            setPendingOrderData(null);
        }
    };

    const handleConfirmQrPayment = async () => {
        if (!pendingOrderData) return;
        const orderDataWithPaid = {
            ...pendingOrderData,
            paymentStatus: 'PAID',
        };
        await submitOrder(orderDataWithPaid);
    };

    // QR Image url helper
    const getQrUrl = () => {
        const desc = `Thanh toan don hang TechZone ${fmt(totalAmount)}`;
        const encodedDesc = encodeURIComponent(desc);
        return `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodedDesc}`;
    };

    return (
        <div style={pageStyle}>
            {/* Breadcrumbs */}
            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '20px 24px 0', display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: '#64748b' }}>
                <span onClick={() => navigate('/')} style={{ cursor: 'pointer', color: '#a78bfa', fontWeight: 600 }}
                    onMouseEnter={e => e.currentTarget.style.color = '#c084fc'}
                    onMouseLeave={e => e.currentTarget.style.color = '#a78bfa'}
                >🎧 TechZone</span>
                <span>›</span>
                <span onClick={() => navigate('/cart')} style={{ cursor: 'pointer', color: '#94a3b8' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                    onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
                >Giỏ hàng</span>
                <span>›</span>
                <span style={{ color: '#f1f5f9', fontWeight: 600 }}>Thanh toán</span>
            </div>

            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px' }}>
                <h1 style={{ fontSize: 32, fontWeight: 900, marginBottom: 32, color: '#f8fafc' }}>
                    💳 Thanh toán Đơn hàng
                </h1>

                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleFormSubmit}
                    initialValues={{
                        fullName: auth?.user?.name || '',
                    }}
                >
                    <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 32, alignItems: 'start' }}>
                        {/* Delivery & Payment Form */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                            {/* Shipping Information Card */}
                            <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 24, padding: 28 }}>
                                <h2 style={{ fontSize: 20, fontWeight: 800, color: '#f8fafc', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <span>📍</span> Thông tin giao hàng
                                </h2>

                                <Form.Item
                                    label={<span style={{ color: '#94a3b8', fontWeight: 600 }}>Họ và tên người nhận</span>}
                                    name="fullName"
                                    rules={[{ required: true, message: 'Vui lòng nhập họ tên người nhận.' }]}
                                >
                                    <Input 
                                        placeholder="Ví dụ: Nguyễn Văn A" 
                                        style={{ background: '#0f172a', border: '1px solid #334155', color: '#fff', height: 44, borderRadius: 10 }}
                                    />
                                </Form.Item>

                                <Form.Item
                                    label={<span style={{ color: '#94a3b8', fontWeight: 600 }}>Số điện thoại liên hệ</span>}
                                    name="phoneNumber"
                                    rules={[
                                        { required: true, message: 'Vui lòng nhập số điện thoại.' },
                                        { pattern: /^[0-9]{10,11}$/, message: 'Số điện thoại không hợp lệ (10-11 chữ số).' }
                                    ]}
                                >
                                    <Input 
                                        placeholder="Ví dụ: 0987654321" 
                                        style={{ background: '#0f172a', border: '1px solid #334155', color: '#fff', height: 44, borderRadius: 10 }}
                                    />
                                </Form.Item>

                                <Form.Item
                                    label={<span style={{ color: '#94a3b8', fontWeight: 600 }}>Địa chỉ nhận hàng</span>}
                                    name="address"
                                    rules={[{ required: true, message: 'Vui lòng nhập địa chỉ nhận hàng.' }]}
                                >
                                    <Input.TextArea 
                                        rows={3} 
                                        placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố..." 
                                        style={{ background: '#0f172a', border: '1px solid #334155', color: '#fff', borderRadius: 10 }}
                                    />
                                </Form.Item>

                                <Form.Item
                                    label={<span style={{ color: '#94a3b8', fontWeight: 600 }}>Ghi chú đơn hàng</span>}
                                    name="notes"
                                >
                                    <Input.TextArea 
                                        rows={2} 
                                        placeholder="Ghi chú thêm về giờ giao, chỉ dẫn đường đi... (tùy chọn)" 
                                        style={{ background: '#0f172a', border: '1px solid #334155', color: '#fff', borderRadius: 10 }}
                                    />
                                </Form.Item>
                            </div>

                            {/* Payment Method Card */}
                            <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 24, padding: 28 }}>
                                <h2 style={{ fontSize: 20, fontWeight: 800, color: '#f8fafc', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <span>💳</span> Phương thức thanh toán
                                </h2>

                                <Radio.Group
                                    value={selectedMethod}
                                    onChange={(e) => setSelectedMethod(e.target.value)}
                                    style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}
                                >
                                    {/* COD Option */}
                                    <label style={{
                                        display: 'flex', alignItems: 'center', gap: 16, padding: 18, borderRadius: 16, cursor: 'pointer',
                                        background: selectedMethod === 'COD' ? 'rgba(124,58,237,0.1)' : '#0f172a',
                                        border: selectedMethod === 'COD' ? '2px solid #7c3aed' : '1px solid #334155',
                                        transition: 'all 0.2s'
                                    }}>
                                        <Radio value="COD" />
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                            <span style={{ fontSize: 24 }}>💵</span>
                                            <div>
                                                <div style={{ fontWeight: 700, color: '#f8fafc' }}>Thanh toán khi nhận hàng (COD)</div>
                                                <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>Trả tiền mặt khi hàng được giao tới nơi.</div>
                                            </div>
                                        </div>
                                    </label>

                                    {/* MoMo Option */}
                                    <label style={{
                                        display: 'flex', alignItems: 'center', gap: 16, padding: 18, borderRadius: 16, cursor: 'pointer',
                                        background: selectedMethod === 'MOMO' ? 'rgba(124,58,237,0.1)' : '#0f172a',
                                        border: selectedMethod === 'MOMO' ? '2px solid #7c3aed' : '1px solid #334155',
                                        transition: 'all 0.2s'
                                    }}>
                                        <Radio value="MOMO" />
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                            <div style={{ width: 28, height: 28, background: '#a50064', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold', fontSize: 10 }}>MoMo</div>
                                            <div>
                                                <div style={{ fontWeight: 700, color: '#f8fafc' }}>Ví Điện Tử MoMo</div>
                                                <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>Thanh toán qua ví MoMo bằng mã QR siêu nhanh.</div>
                                            </div>
                                        </div>
                                    </label>

                                    {/* VNPAY Option */}
                                    <label style={{
                                        display: 'flex', alignItems: 'center', gap: 16, padding: 18, borderRadius: 16, cursor: 'pointer',
                                        background: selectedMethod === 'VNPAY' ? 'rgba(124,58,237,0.1)' : '#0f172a',
                                        border: selectedMethod === 'VNPAY' ? '2px solid #7c3aed' : '1px solid #334155',
                                        transition: 'all 0.2s'
                                    }}>
                                        <Radio value="VNPAY" />
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                            <div style={{ width: 28, height: 28, background: '#005baa', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold', fontSize: 8 }}>VNPAY</div>
                                            <div>
                                                <div style={{ fontWeight: 700, color: '#f8fafc' }}>Cổng thanh toán VNPAY</div>
                                                <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>Hỗ trợ quét QR trên ứng dụng ngân hàng di động.</div>
                                            </div>
                                        </div>
                                    </label>
                                </Radio.Group>
                            </div>
                        </div>

                        {/* Order Summary & Actions */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, position: 'sticky', top: 84 }}>
                            {/* Summary Card */}
                            <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 24, padding: 24 }}>
                                <h2 style={{ fontSize: 20, fontWeight: 800, color: '#f8fafc', margin: 0, borderBottom: '1px solid #334155', paddingBottom: 16, marginBottom: 16 }}>
                                    Tóm tắt đơn hàng
                                </h2>

                                {/* Product List Summary */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: 200, overflowY: 'auto', marginBottom: 20, paddingRight: 4 }}>
                                    {items.map((item) => {
                                        const p = item.product;
                                        if (!p) return null;
                                        const price = p.salePrice || p.price;
                                        return (
                                            <div key={p._id} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                                                <img src={p.image} alt={p.name} style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover', background: '#0f172a' }} />
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <div style={{ fontSize: 13, fontWeight: 600, color: '#f8fafc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                                                    <div style={{ fontSize: 11, color: '#94a3b8' }}>Số lượng: {item.quantity}</div>
                                                </div>
                                                <div style={{ fontSize: 13, fontWeight: 700, color: '#a78bfa' }}>{fmt(price * item.quantity)}</div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Coupon Input Section */}
                                <div style={{ background: '#0f172a', padding: 16, borderRadius: 16, border: '1px solid #334155', marginBottom: 16 }}>
                                    <div style={{ fontSize: 13, color: '#94a3b8', fontWeight: 700, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <span>🎟️</span> Áp dụng mã giảm giá
                                    </div>
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        <Input
                                            placeholder="Nhập mã (ví dụ: WELCOME10)"
                                            value={couponInput}
                                            onChange={(e) => setCouponInput(e.target.value)}
                                            disabled={!!appliedCoupon}
                                            style={{ background: '#1e293b', border: '1px solid #334155', color: '#fff', borderRadius: 8, height: 38 }}
                                        />
                                        {appliedCoupon ? (
                                            <Button danger onClick={handleRemoveCoupon} style={{ borderRadius: 8, height: 38 }}>Hủy</Button>
                                        ) : (
                                            <Button type="primary" onClick={handleApplyCoupon} loading={validatingCoupon} style={{ background: '#7c3aed', border: 'none', borderRadius: 8, height: 38 }}>
                                                Áp dụng
                                            </Button>
                                        )}
                                    </div>
                                    {appliedCoupon && (
                                        <div style={{ color: '#4ade80', fontSize: 12, marginTop: 6, fontWeight: 600 }}>
                                            ✓ Đã áp dụng: {appliedCoupon.description}
                                        </div>
                                    )}
                                </div>

                                {/* Loyalty Points Section */}
                                {dbUser?.loyaltyPoints > 0 && (
                                    <div style={{ background: '#0f172a', padding: 16, borderRadius: 16, border: '1px solid #334155', marginBottom: 20 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                            <div style={{ fontSize: 13, color: '#94a3b8', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                                                <span>💎</span> Dùng điểm tích lũy
                                            </div>
                                            <span style={{ fontSize: 12, color: '#eab308', fontWeight: 600 }}>Có {dbUser.loyaltyPoints} điểm</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <Input
                                                type="number"
                                                min={0}
                                                max={maxPointsRedeemable}
                                                value={pointsToUse}
                                                onChange={(e) => {
                                                    let pts = parseInt(e.target.value, 10) || 0;
                                                    if (pts > dbUser.loyaltyPoints) pts = dbUser.loyaltyPoints;
                                                    if (pts > maxPointsRedeemable) pts = maxPointsRedeemable;
                                                    if (pts < 0) pts = 0;
                                                    setPointsToUse(pts);
                                                }}
                                                style={{ background: '#1e293b', border: '1px solid #334155', color: '#fff', borderRadius: 8, width: 100, height: 38 }}
                                            />
                                            <span style={{ fontSize: 12, color: '#64748b' }}>
                                                = {fmt(pointsToUse * 100)} giảm giá
                                            </span>
                                        </div>
                                        <span style={{ fontSize: 11, color: '#475569', display: 'block', marginTop: 6 }}>
                                            * Tối đa được dùng {maxPointsRedeemable} điểm cho đơn này.
                                        </span>
                                    </div>
                                )}

                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#94a3b8', marginBottom: 12 }}>
                                    <span>Tạm tính:</span>
                                    <span style={{ color: '#f1f5f9', fontWeight: 600 }}>{fmt(subtotal)}</span>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#94a3b8', marginBottom: 12 }}>
                                    <span>Phí vận chuyển:</span>
                                    <span style={{ color: shippingFee === 0 ? '#4ade80' : '#f1f5f9', fontWeight: 600 }}>
                                        {shippingFee === 0 ? 'Miễn phí' : fmt(shippingFee)}
                                    </span>
                                </div>

                                {couponDiscount > 0 && (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#f87171', marginBottom: 12 }}>
                                        <span>Giảm giá coupon:</span>
                                        <span style={{ fontWeight: 600 }}>-{fmt(couponDiscount)}</span>
                                    </div>
                                )}

                                {pointsDiscount > 0 && (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#f87171', marginBottom: 12 }}>
                                        <span>Giảm điểm tích lũy:</span>
                                        <span style={{ fontWeight: 600 }}>-{fmt(pointsDiscount)}</span>
                                    </div>
                                )}

                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 18, fontWeight: 800, color: '#f8fafc', borderTop: '1px solid #334155', paddingTop: 16, marginBottom: 24 }}>
                                    <span>Tổng cộng:</span>
                                    <span style={{ color: '#7c3aed' }}>{fmt(totalAmount)}</span>
                                </div>

                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    loading={loading}
                                    style={{
                                        width: '100%', height: 50, border: 'none', borderRadius: 14, fontWeight: 700, fontSize: 16,
                                        background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', color: '#fff', boxShadow: 'none'
                                    }}
                                >
                                    {selectedMethod === 'COD' ? 'Xác nhận Đặt hàng' : 'Tiến hành Thanh toán'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </Form>
            </div>

            {/* QR Payment Simulation Modal */}
            <Modal
                title={null}
                open={qrModalVisible}
                footer={null}
                onCancel={() => {
                    setQrModalVisible(false);
                    setPendingOrderData(null);
                }}
                centered
                styles={{
                    body: { background: '#1e293b', color: '#f1f5f9', padding: 24, borderRadius: 20 },
                    content: { background: '#1e293b', padding: 0, borderRadius: 20 }
                }}
                width={400}
            >
                <div style={{ textAlign: 'center', fontFamily: "'Inter', sans-serif" }}>
                    <div style={{
                        width: 50, height: 50, borderRadius: '50%',
                        background: selectedMethod === 'MOMO' ? '#a50064' : '#005baa',
                        margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 20, fontWeight: 'bold'
                    }}>
                        {selectedMethod === 'MOMO' ? 'M' : 'V'}
                    </div>

                    <h3 style={{ fontSize: 18, fontWeight: 800, color: '#fff', marginBottom: 8 }}>
                        Thanh toán qua {selectedMethod === 'MOMO' ? 'Ví MoMo' : 'Cổng VNPAY'}
                    </h3>
                    <p style={{ color: '#94a3b8', fontSize: 14, marginBottom: 20 }}>
                        Vui lòng quét mã QR dưới đây để thực hiện thanh toán chuyển khoản giả lập.
                    </p>

                    {/* QR Code Container */}
                    <div style={{
                        background: '#fff', padding: 16, borderRadius: 16, display: 'inline-block',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.3)', marginBottom: 20
                    }}>
                        <img 
                            src={getQrUrl()} 
                            alt="Payment QR Code" 
                            style={{ width: 220, height: 220, display: 'block' }}
                        />
                    </div>

                    {/* Transaction Details */}
                    <div style={{ background: '#0f172a', padding: 16, borderRadius: 12, textAlign: 'left', marginBottom: 24, display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                            <span style={{ color: '#64748b' }}>Chủ tài khoản:</span>
                            <span style={{ color: '#fff', fontWeight: 600 }}>TECHZONE PREMIUM STORE</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                            <span style={{ color: '#64748b' }}>Số tiền:</span>
                            <span style={{ color: '#a78bfa', fontWeight: 700 }}>{fmt(totalAmount)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                            <span style={{ color: '#64748b' }}>Nội dung:</span>
                            <span style={{ color: '#fff', fontWeight: 500, fontStyle: 'italic' }}>TechZone {pendingOrderData?.phoneNumber}</span>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: 12 }}>
                        <Button
                            onClick={() => {
                                setQrModalVisible(false);
                                setPendingOrderData(null);
                            }}
                            style={{ flex: 1, height: 44, borderRadius: 10, background: '#334155', color: '#fff', border: 'none' }}
                        >
                            Hủy giao dịch
                        </Button>
                        <Button
                            type="primary"
                            loading={loading}
                            onClick={handleConfirmQrPayment}
                            style={{
                                flex: 2, height: 44, borderRadius: 10, border: 'none', fontWeight: 600,
                                background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', color: '#fff'
                            }}
                        >
                            Xác nhận Đã chuyển khoản
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default CheckoutPage;
