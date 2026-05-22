import { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../components/context/auth.context';
import { getUserOrdersApi } from '../util/api';
import { Spin, Card, Tag, Button, Empty, Collapse } from 'antd';
import { ShoppingOutlined, ClockCircleOutlined, CalendarOutlined } from '@ant-design/icons';

const fmt = (v) => (v != null ? new Intl.NumberFormat('vi-VN').format(v) + 'đ' : '');

const OrdersPage = () => {
    const { auth } = useContext(AuthContext);
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);

    const isMember = auth.isAuthenticated && (auth.user.role || 'USER') === 'USER';

    useEffect(() => {
        if (!auth.isAuthenticated) {
            navigate('/login');
        } else if (!isMember) {
            navigate('/');
        } else {
            fetchOrders();
        }
    }, [auth.isAuthenticated, isMember, navigate]);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const res = await getUserOrdersApi();
            if (res && !res.message) {
                setOrders(res);
            }
        } catch (error) {
            console.error('Failed to fetch orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusTag = (status) => {
        const statusMap = {
            PENDING: { color: 'warning', text: 'Chờ xử lý' },
            PROCESSING: { color: 'processing', text: 'Đang chuẩn bị' },
            SHIPPED: { color: 'purple', text: 'Đang giao hàng' },
            DELIVERED: { color: 'success', text: 'Đã giao' },
            CANCELLED: { color: 'error', text: 'Đã hủy' }
        };
        const config = statusMap[status] || { color: 'default', text: status };
        return <Tag color={config.color} style={{ borderRadius: 6, fontWeight: 600, padding: '2px 8px' }}>{config.text.toUpperCase()}</Tag>;
    };

    const getPaymentStatusTag = (status) => {
        const statusMap = {
            PENDING: { color: 'warning', text: 'Chưa thanh toán' },
            PAID: { color: 'success', text: 'Đã thanh toán' },
            FAILED: { color: 'error', text: 'Thanh toán lỗi' }
        };
        const config = statusMap[status] || { color: 'default', text: status };
        return <Tag color={config.color} style={{ borderRadius: 6, fontWeight: 600, padding: '2px 8px' }}>{config.text.toUpperCase()}</Tag>;
    };

    const getPaymentMethodLabel = (method) => {
        const methodMap = {
            COD: 'Thanh toán khi nhận hàng (COD)',
            MOMO: 'Ví MoMo',
            VNPAY: 'Cổng VNPAY'
        };
        return methodMap[method] || method;
    };

    const pageStyle = {
        minHeight: '100vh',
        background: '#0f172a',
        color: '#f1f5f9',
        fontFamily: "'Inter', system-ui, sans-serif",
    };

    return (
        <div style={pageStyle}>
            {/* Header / Breadcrumb */}
            <div style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(15,23,42,.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #1e293b', padding: '0 24px' }}>
                <div style={{ maxWidth: 1200, margin: '0 auto', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: '#64748b' }}>
                        <span onClick={() => navigate('/')} style={{ cursor: 'pointer', color: '#a78bfa', fontWeight: 700 }}>🎧 TechZone</span>
                        <span>›</span>
                        <span style={{ color: '#f1f5f9', fontWeight: 600 }}>Lịch sử Đơn hàng</span>
                    </div>
                    <Button 
                        onClick={() => navigate('/')}
                        style={{ background: '#1e293b', border: '1px solid #334155', color: '#94a3b8', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 6 }}
                    >
                        Quay lại mua sắm
                    </Button>
                </div>
            </div>

            <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px' }}>
                <h1 style={{ fontSize: 32, fontWeight: 900, marginBottom: 8, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <ShoppingOutlined style={{ color: '#7c3aed' }} /> Lịch sử Đơn hàng
                </h1>
                <p style={{ color: '#94a3b8', marginBottom: 32 }}>Xem lại các đơn hàng bạn đã đặt mua tại TechZone Premium.</p>

                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '80px 0' }}>
                        <Spin size="large" tip="Đang tải danh sách đơn hàng..." />
                    </div>
                ) : orders.length === 0 ? (
                    <div style={{ textAlign: 'center', background: '#1e293b', border: '1px solid #334155', borderRadius: 24, padding: '60px 40px', marginTop: 20 }}>
                        <Empty 
                            description={<span style={{ color: '#94a3b8', fontSize: 16 }}>Bạn chưa có đơn hàng nào.</span>}
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                        />
                        <Button 
                            onClick={() => navigate('/')}
                            style={{ 
                                marginTop: 24, background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', color: '#fff', 
                                border: 'none', borderRadius: 12, height: 44, padding: '0 28px', fontWeight: 600
                            }}
                        >
                            Khám phá sản phẩm ngay
                        </Button>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        {orders.map((order) => {
                            const orderIdShort = order._id.substring(order._id.length - 8).toUpperCase();
                            const orderDate = new Date(order.createdAt).toLocaleString('vi-VN', {
                                year: 'numeric', month: '2-digit', day: '2-digit',
                                hour: '2-digit', minute: '2-digit'
                            });

                            // Build panels for Collapse
                            const panelHeader = (
                                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', width: '100%', gap: 12 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <span style={{ fontSize: 15, fontWeight: 800, color: '#f8fafc' }}>
                                            #HN-{orderIdShort}
                                        </span>
                                        <span style={{ fontSize: 13, color: '#64748b', display: 'flex', alignItems: 'center', gap: 4 }}>
                                            <CalendarOutlined /> {orderDate}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        {getStatusTag(order.orderStatus)}
                                        {getPaymentStatusTag(order.paymentStatus)}
                                        <span style={{ fontSize: 16, fontWeight: 800, color: '#a78bfa', marginLeft: 8 }}>
                                            {fmt(order.totalAmount)}
                                        </span>
                                    </div>
                                </div>
                            );

                            return (
                                <Collapse 
                                    key={order._id}
                                    expandIconPosition="end"
                                    style={{ 
                                        background: '#1e293b', border: '1px solid #334155', borderRadius: 16, overflow: 'hidden'
                                    }}
                                >
                                    <Collapse.Panel header={panelHeader} key="1" style={{ borderBottom: 'none' }}>
                                        <div style={{ color: '#e2e8f0', display: 'flex', flexDirection: 'column', gap: 20 }}>
                                            {/* Shipping & Payment Details */}
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, borderBottom: '1px solid #334155', paddingBottom: 16 }}>
                                                <div>
                                                    <h4 style={{ color: '#94a3b8', fontSize: 13, fontWeight: 700, textTransform: 'uppercase', marginBottom: 8, letterSpacing: 0.5 }}>📍 Thông tin giao hàng</h4>
                                                    <div style={{ fontSize: 14, display: 'flex', flexDirection: 'column', gap: 4 }}>
                                                        <div><span style={{ color: '#64748b' }}>Người nhận:</span> {order.shippingAddress.fullName}</div>
                                                        <div><span style={{ color: '#64748b' }}>Điện thoại:</span> {order.shippingAddress.phoneNumber}</div>
                                                        <div><span style={{ color: '#64748b' }}>Địa chỉ:</span> {order.shippingAddress.address}</div>
                                                        {order.shippingAddress.notes && (
                                                            <div><span style={{ color: '#64748b' }}>Ghi chú:</span> <i style={{ color: '#94a3b8' }}>"{order.shippingAddress.notes}"</i></div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div>
                                                    <h4 style={{ color: '#94a3b8', fontSize: 13, fontWeight: 700, textTransform: 'uppercase', marginBottom: 8, letterSpacing: 0.5 }}>💳 Phương thức thanh toán</h4>
                                                    <div style={{ fontSize: 14, display: 'flex', flexDirection: 'column', gap: 4 }}>
                                                        <div>{getPaymentMethodLabel(order.paymentMethod)}</div>
                                                        <div>
                                                            <span style={{ color: '#64748b' }}>Trạng thái:</span>{' '}
                                                            <span style={{ fontWeight: 600, color: order.paymentStatus === 'PAID' ? '#4ade80' : '#fbbf24' }}>
                                                                {order.paymentStatus === 'PAID' ? 'ĐÃ THANH TOÁN' : 'CHỜ THANH TOÁN'}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <span style={{ color: '#64748b' }}>Phí giao hàng:</span>{' '}
                                                            {order.shippingFee === 0 ? <span style={{ color: '#4ade80' }}>Miễn phí</span> : fmt(order.shippingFee)}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Order Items */}
                                            <div>
                                                <h4 style={{ color: '#94a3b8', fontSize: 13, fontWeight: 700, textTransform: 'uppercase', marginBottom: 12, letterSpacing: 0.5 }}>📦 Sản phẩm đã mua</h4>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                                    {order.items.map((item, idx) => {
                                                        const p = item.product;
                                                        if (!p) return null;
                                                        return (
                                                            <div key={idx} style={{ display: 'flex', gap: 16, alignItems: 'center', background: '#0f172a', padding: 12, borderRadius: 12 }}>
                                                                <img src={p.image} alt={p.name} style={{ width: 50, height: 50, borderRadius: 8, objectFit: 'cover' }} />
                                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                                    <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                                        {p.name}
                                                                    </div>
                                                                    <div style={{ fontSize: 12, color: '#64748b' }}>
                                                                        Thương hiệu: {p.brand} | Số lượng: {item.quantity}
                                                                    </div>
                                                                </div>
                                                                <div style={{ textAlign: 'right' }}>
                                                                    <div style={{ fontSize: 14, fontWeight: 700, color: '#a78bfa' }}>{fmt(item.price * item.quantity)}</div>
                                                                    <div style={{ fontSize: 11, color: '#64748b' }}>{fmt(item.price)} / sp</div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    </Collapse.Panel>
                                </Collapse>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrdersPage;
