import { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../components/context/auth.context';
import { getUserOrdersApi, cancelOrderApi, updateOrderStatusApi, simulateOrderTimeApi } from '../util/api';
import { Spin, Tag, Button, Empty, Collapse, Modal, notification } from 'antd';
import { ShoppingOutlined, CalendarOutlined } from '@ant-design/icons';

const fmt = (v) => (v != null ? new Intl.NumberFormat('vi-VN').format(v) + 'đ' : '');

// Sub-component for live countdown timer and cancel actions
const CancelTimer = ({ createdAt, status, onCancel }) => {
    const [timeLeft, setTimeLeft] = useState(0);

    useEffect(() => {
        const calculateTimeLeft = () => {
            const limit = 30 * 60 * 1000; // 30 minutes
            const elapsed = Date.now() - new Date(createdAt).getTime();
            const remaining = Math.max(0, limit - elapsed);
            setTimeLeft(remaining);
        };

        calculateTimeLeft();
        const timer = setInterval(calculateTimeLeft, 1000);

        return () => clearInterval(timer);
    }, [createdAt]);

    if (timeLeft <= 0 || !['PENDING', 'CONFIRMED', 'PROCESSING'].includes(status)) {
        return null;
    }

    const minutes = Math.floor(timeLeft / 60000);
    const seconds = Math.floor((timeLeft % 60000) / 1000);
    const timeStr = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    const isProcessing = status === 'PROCESSING';

    return (
        <div style={{
            background: 'rgba(239, 68, 68, 0.05)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: 16,
            padding: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
            marginTop: 16
        }}>
            <div>
                <div style={{ fontWeight: 700, color: '#f87171', fontSize: 14 }}>
                    {isProcessing ? 'Gửi Yêu Cầu Hủy Đơn' : 'Hủy Đơn Hàng Trực Tiếp'}
                </div>
                <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>
                    {isProcessing 
                        ? 'Đơn hàng đang chuẩn bị. Bạn có thể gửi yêu cầu hủy đơn cho shop.' 
                        : 'Bạn có thể hủy đơn hàng này trực tiếp. Sản phẩm sẽ được hoàn lại kho.'}
                </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: 11, color: '#64748b', display: 'block' }}>Thời gian còn lại</span>
                    <span style={{ fontSize: 16, fontWeight: 800, color: '#f87171', fontFamily: 'monospace' }}>{timeStr}</span>
                </div>
                <button 
                    onClick={onCancel}
                    style={{
                        background: '#ef4444',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 10,
                        padding: '8px 16px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        fontSize: 13,
                        transition: 'background 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#dc2626'}
                    onMouseLeave={e => e.currentTarget.style.background = '#ef4444'}
                >
                    {isProcessing ? 'Gửi yêu cầu hủy' : 'Hủy đơn'}
                </button>
            </div>
        </div>
    );
};

// Sub-component for custom premium tracking timeline
const OrderTimeline = ({ status }) => {
    const steps = [
        { key: 'PENDING', label: 'Đơn hàng mới', desc: 'Đã nhận đơn' },
        { key: 'CONFIRMED', label: 'Đã xác nhận', desc: 'Đã duyệt tự động/thủ công' },
        { key: 'PROCESSING', label: 'Chuẩn bị hàng', desc: 'Shop đang chuẩn bị hàng' },
        { key: 'SHIPPED', label: 'Đang giao hàng', desc: 'Shipper đang giao hàng' },
        { key: 'DELIVERED', label: 'Đã giao thành công', desc: 'Thành công' }
    ];

    const statusIndices = {
        'PENDING': 0,
        'CONFIRMED': 1,
        'PROCESSING': 2,
        'SHIPPED': 3,
        'DELIVERED': 4,
        'CANCELLED': -1,
        'CANCEL_REQUESTED': -1
    };

    const currentIndex = statusIndices[status] ?? 0;

    if (status === 'CANCELLED' || status === 'CANCEL_REQUESTED') {
        return null;
    }

    return (
        <div style={{ marginTop: 24, padding: '16px 8px', borderTop: '1px solid #334155' }}>
            <h4 style={{ color: '#94a3b8', fontSize: 13, fontWeight: 700, textTransform: 'uppercase', marginBottom: 20, letterSpacing: 0.5 }}>🚚 Trạng thái vận chuyển</h4>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', width: '100%' }}>
                {/* Connector line background */}
                <div style={{
                    position: 'absolute', top: 12, left: '5%', right: '5%', height: 2, background: '#334155', zIndex: 1
                }} />
                {/* Active gradient progress line */}
                <div style={{
                    position: 'absolute', top: 12, left: '5%', 
                    width: currentIndex >= 0 ? `${(currentIndex / 4) * 90}%` : '0%', 
                    height: 2, background: 'linear-gradient(90deg, #7c3aed, #06b6d4)', zIndex: 1,
                    transition: 'width 0.4s ease'
                }} />

                {steps.map((step, idx) => {
                    const isCompleted = idx < currentIndex;
                    const isActive = idx === currentIndex;
                    const isFuture = idx > currentIndex;

                    let circleBg = '#0f172a';
                    let circleBorder = '2px solid #334155';
                    let glow = 'none';

                    if (isActive) {
                        circleBg = '#7c3aed';
                        circleBorder = '2px solid #a78bfa';
                        glow = '0 0 12px rgba(124, 58, 237, 0.6)';
                    } else if (isCompleted) {
                        circleBg = '#06b6d4';
                        circleBorder = '2px solid #22d3ee';
                    }

                    return (
                        <div key={step.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2, width: '18%', textAlign: 'center' }}>
                            <div style={{
                                width: 26, height: 26, borderRadius: '50%', background: circleBg, border: circleBorder,
                                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700,
                                color: isFuture ? '#475569' : '#fff', boxShadow: glow, transition: 'all 0.3s ease'
                            }}>
                                {isCompleted ? '✓' : idx + 1}
                            </div>
                            <div style={{ marginTop: 10, fontSize: 12, fontWeight: isActive ? 700 : 600, color: isFuture ? '#64748b' : '#fff' }}>
                                {step.label}
                            </div>
                            <div style={{ fontSize: 10, color: '#64748b', marginTop: 2, lineHeight: 1.2 }}>
                                {step.desc}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// Sub-component for Admin Simulation controls
const AdminSimulationPanel = ({ order, onStatusChange, onSimulateTime }) => {
    const [visible, setVisible] = useState(false);

    return (
        <div style={{
            background: 'rgba(30, 41, 59, 0.4)',
            border: '1px dashed #475569',
            borderRadius: 16,
            padding: 16,
            marginTop: 20
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }} onClick={() => setVisible(!visible)}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#38bdf8', display: 'flex', alignItems: 'center', gap: 6 }}>
                    🛠️ Bảng điều khiển giả lập Admin {visible ? '▼' : '▶'}
                </span>
                <span style={{ fontSize: 11, color: '#64748b' }}>Sử dụng cho kiểm thử trạng thái đơn hàng</span>
            </div>

            {visible && (
                <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {/* Time simulation */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #334155', paddingBottom: 12 }}>
                        <div>
                            <span style={{ fontSize: 13, fontWeight: 600, color: '#fff', display: 'block' }}>Giả lập trôi qua 30 phút</span>
                            <span style={{ fontSize: 11, color: '#94a3b8' }}>Đặt thời gian tạo đơn về 31 phút trước để test Auto-Confirm và Hết hạn hủy.</span>
                        </div>
                        <button 
                            onClick={onSimulateTime}
                            style={{
                                background: '#0284c7', color: '#fff', border: 'none', borderRadius: 8,
                                padding: '6px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer'
                            }}
                        >
                            Chạy giả lập
                        </button>
                    </div>

                    {/* Status simulation */}
                    <div>
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#fff', display: 'block', marginBottom: 8 }}>Chuyển đổi trạng thái thủ công:</span>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                            {[
                                { status: 'PENDING', label: 'Đơn mới' },
                                { status: 'CONFIRMED', label: 'Đã xác nhận' },
                                { status: 'PROCESSING', label: 'Chuẩn bị hàng' },
                                { status: 'SHIPPED', label: 'Đang giao' },
                                { status: 'DELIVERED', label: 'Đã giao' },
                                { status: 'CANCELLED', label: 'Đã hủy' },
                                { status: 'CANCEL_REQUESTED', label: 'Yêu cầu hủy' }
                            ].map((s) => (
                                <button
                                    key={s.status}
                                    onClick={() => onStatusChange(s.status)}
                                    disabled={order.orderStatus === s.status}
                                    style={{
                                        background: order.orderStatus === s.status ? '#1e293b' : '#334155',
                                        color: order.orderStatus === s.status ? '#64748b' : '#fff',
                                        border: order.orderStatus === s.status ? '1px solid #475569' : '1px solid #475569',
                                        borderRadius: 6,
                                        padding: '4px 10px',
                                        fontSize: 11,
                                        cursor: order.orderStatus === s.status ? 'not-allowed' : 'pointer',
                                        fontWeight: 600
                                    }}
                                >
                                    {s.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

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

    const handleCancelOrder = async (orderId, currentStatus) => {
        const isProcessing = currentStatus === 'PROCESSING';
        const title = isProcessing ? 'Gửi yêu cầu hủy đơn?' : 'Xác nhận hủy đơn hàng?';
        const content = isProcessing 
            ? 'Đơn hàng đang chuẩn bị. Yêu cầu hủy đơn sẽ được gửi tới shop để duyệt.' 
            : 'Đơn hàng sẽ được hủy lập tức và sản phẩm sẽ hoàn lại kho.';

        Modal.confirm({
            title,
            content,
            okText: isProcessing ? 'Gửi yêu cầu' : 'Hủy đơn hàng',
            cancelText: 'Quay lại',
            okType: isProcessing ? 'default' : 'danger',
            onOk: async () => {
                try {
                    const res = await cancelOrderApi(orderId);
                    if (res && !res.message) {
                        notification.success({
                            message: 'Thành công',
                            description: res.message || 'Xử lý hủy đơn hoàn tất.'
                        });
                        fetchOrders();
                    } else {
                        notification.error({
                            message: 'Lỗi',
                            description: res?.message || 'Không thể hủy đơn hàng.'
                        });
                    }
                } catch (err) {
                    notification.error({
                        message: 'Lỗi hệ thống',
                        description: 'Lỗi kết nối máy chủ.'
                    });
                }
            }
        });
    };

    const handleSimulateStatus = async (orderId, newStatus) => {
        try {
            const res = await updateOrderStatusApi(orderId, newStatus);
            if (res && !res.message) {
                notification.success({
                    message: 'Giả lập thành công',
                    description: `Đơn hàng đã được chuyển sang trạng thái: ${newStatus}`
                });
                fetchOrders();
            } else {
                notification.error({
                    message: 'Lỗi giả lập',
                    description: res?.message || 'Có lỗi xảy ra.'
                });
            }
        } catch (error) {
            notification.error({
                message: 'Lỗi',
                description: 'Lỗi kết nối máy chủ.'
            });
        }
    };

    const handleSimulateTime = async (orderId) => {
        try {
            const res = await simulateOrderTimeApi(orderId);
            if (res && !res.message) {
                notification.success({
                    message: 'Giả lập thành công',
                    description: 'Thời gian đặt hàng đã được lùi lại 31 phút.'
                });
                fetchOrders();
            } else {
                notification.error({
                    message: 'Lỗi giả lập',
                    description: res?.message || 'Có lỗi xảy ra.'
                });
            }
        } catch (error) {
            notification.error({
                message: 'Lỗi',
                description: 'Lỗi kết nối máy chủ.'
            });
        }
    };

    const getStatusTag = (status) => {
        const statusMap = {
            PENDING: { color: 'warning', text: 'Đơn mới' },
            CONFIRMED: { color: 'processing', text: 'Đã xác nhận' },
            PROCESSING: { color: 'orange', text: 'Đang chuẩn bị' },
            SHIPPED: { color: 'purple', text: 'Đang giao hàng' },
            DELIVERED: { color: 'success', text: 'Đã giao' },
            CANCELLED: { color: 'error', text: 'Đã hủy' },
            CANCEL_REQUESTED: { color: 'magenta', text: 'Yêu cầu hủy' }
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
                    <ShoppingOutlined style={{ color: '#7c3aed' }} /> Lịch sử & Theo dõi Đơn hàng
                </h1>
                <p style={{ color: '#94a3b8', marginBottom: 32 }}>Xem lại tiến trình vận chuyển của các đơn hàng bạn đã mua tại TechZone Premium.</p>

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

                            // Build custom header for accordion panel
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
                                            
                                            {/* Cancelled Info Alerts */}
                                            {order.orderStatus === 'CANCELLED' && (
                                                <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', padding: 16, borderRadius: 12, color: '#f87171', fontSize: 14 }}>
                                                    ❌ <b>Đơn hàng đã hủy:</b> Sản phẩm thuộc đơn hàng này đã được hoàn lại kho thành công.
                                                </div>
                                            )}

                                            {order.orderStatus === 'CANCEL_REQUESTED' && (
                                                <div style={{ background: 'rgba(217,70,239,0.1)', border: '1px solid rgba(217,70,239,0.3)', padding: 16, borderRadius: 12, color: '#f472b6', fontSize: 14 }}>
                                                    📩 <b>Yêu cầu hủy đơn đang chờ duyệt:</b> Shop đã nhận được yêu cầu hủy đơn hàng của bạn và đang chuẩn bị xử lý.
                                                </div>
                                            )}

                                            {/* Shipping & Payment Details */}
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, paddingBottom: 16 }}>
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

                                            {/* Order Timeline Tracking */}
                                            <OrderTimeline status={order.orderStatus} />

                                            {/* Cancellation Countdown Timer Widget */}
                                            <CancelTimer 
                                                createdAt={order.createdAt} 
                                                status={order.orderStatus} 
                                                onCancel={() => handleCancelOrder(order._id, order.orderStatus)} 
                                            />

                                            {/* Order Items */}
                                            <div style={{ borderTop: '1px solid #334155', paddingTop: 20 }}>
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

                                            {/* Admin Simulation Controller */}
                                            <AdminSimulationPanel 
                                                order={order}
                                                onStatusChange={(status) => handleSimulateStatus(order._id, status)}
                                                onSimulateTime={() => handleSimulateTime(order._id)}
                                            />

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
