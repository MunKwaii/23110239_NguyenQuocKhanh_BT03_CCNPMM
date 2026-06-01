import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../components/context/auth.context';
import { getAccountApi, getFavoritesApi, getViewedHistoryApi } from '../util/api';
import { Spin, Card, Row, Col, Tag, Empty, Button, Modal, notification } from 'antd';
import { HeartFilled, HistoryOutlined, GiftOutlined, StarOutlined, UserOutlined } from '@ant-design/icons';

const fmt = (v) => (v != null ? new Intl.NumberFormat('vi-VN').format(v) + 'đ' : '');

const ProfilePage = () => {
    const { auth } = useContext(AuthContext);
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [userData, setUserData] = useState(null);
    const [favorites, setFavorites] = useState([]);
    const [history, setHistory] = useState([]);

    const fetchAllData = async () => {
        setLoading(true);
        try {
            const [userRes, favRes, histRes] = await Promise.all([
                getAccountApi(),
                getFavoritesApi(),
                getViewedHistoryApi()
            ]);

            if (userRes && !userRes.message) setUserData(userRes);
            if (favRes && !favRes.message) setFavorites(favRes);
            if (histRes && !histRes.message) setHistory(histRes);
        } catch (error) {
            console.error('Error fetching profile data:', error);
            notification.error({
                message: 'Lỗi đồng bộ',
                description: 'Không thể tải đầy đủ dữ liệu tài khoản.'
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!auth.isAuthenticated) {
            navigate('/login');
            return;
        }
        fetchAllData();
    }, [auth.isAuthenticated, navigate]);

    const pageStyle = {
        minHeight: '100vh',
        background: '#0f172a',
        color: '#f1f5f9',
        fontFamily: "'Inter', system-ui, sans-serif",
        paddingBottom: 60
    };

    if (loading) {
        return (
            <div style={{ ...pageStyle, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Spin size="large" tip="Đang tải thông tin tài khoản..." />
            </div>
        );
    }

    const pointsValue = (userData?.loyaltyPoints || 0) * 100;

    return (
        <div style={pageStyle}>
            {/* Header Banner */}
            <div style={{
                background: 'linear-gradient(135deg, #1e1b4b 0%, #311042 100%)',
                padding: '60px 24px',
                borderBottom: '1px solid #1e293b',
                textAlign: 'center',
                position: 'relative'
            }}>
                <div style={{
                    width: 90, height: 90, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                    margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 36, color: '#fff', boxShadow: '0 8px 24px rgba(124, 58, 237, 0.4)'
                }}>
                    <UserOutlined />
                </div>
                <h1 style={{ fontSize: 28, fontWeight: 900, color: '#fff', margin: '0 0 6px' }}>{userData?.name}</h1>
                <p style={{ color: '#94a3b8', fontSize: 15, margin: '0 0 16px' }}>📧 {userData?.email}</p>
                <Tag color="purple" style={{ fontSize: 13, padding: '4px 14px', borderRadius: 20, fontWeight: 600 }}>
                    Thành viên {userData?.role}
                </Tag>
            </div>

            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px' }}>
                <Row gutter={[32, 32]}>
                    {/* Left Column: Points & Vouchers */}
                    <Col xs={24} lg={10}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                            {/* Loyalty Points Card */}
                            <Card style={{
                                background: '#1e293b', border: '1px solid #334155', borderRadius: 24,
                                boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
                            }} styles={{ body: { padding: 32 } }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                                    <h3 style={{ fontSize: 18, fontWeight: 800, color: '#fff', margin: 0 }}>
                                        💎 Kho điểm tích lũy
                                    </h3>
                                    <StarOutlined style={{ fontSize: 24, color: '#eab308' }} />
                                </div>
                                <div style={{ background: '#0f172a', padding: 24, borderRadius: 16, textAlign: 'center', marginBottom: 20 }}>
                                    <div style={{ fontSize: 42, fontWeight: 900, color: '#eab308' }}>
                                        {userData?.loyaltyPoints || 0}
                                    </div>
                                    <div style={{ color: '#94a3b8', fontSize: 14, fontWeight: 600, marginTop: 4 }}>Điểm tích lũy</div>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#94a3b8', borderTop: '1px solid #334155', paddingTop: 16 }}>
                                    <span>Giá trị quy đổi (1 điểm = 100đ):</span>
                                    <strong style={{ color: '#4ade80' }}>{fmt(pointsValue)}</strong>
                                </div>
                                <p style={{ fontSize: 12, color: '#64748b', marginTop: 14, fontStyle: 'italic', lineHeight: 1.5 }}>
                                    * Điểm tích lũy nhận được mỗi khi bạn viết đánh giá, bình luận sản phẩm đã mua thành công. Bạn có thể sử dụng điểm để giảm trực tiếp hóa đơn khi mua hàng.
                                </p>
                            </Card>

                            {/* Vouchers Wallet */}
                            <Card style={{
                                background: '#1e293b', border: '1px solid #334155', borderRadius: 24,
                                boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
                            }} styles={{ body: { padding: 32 } }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                                    <h3 style={{ fontSize: 18, fontWeight: 800, color: '#fff', margin: 0 }}>
                                        🎟️ Ví Voucher của bạn
                                    </h3>
                                    <GiftOutlined style={{ fontSize: 24, color: '#a78bfa' }} />
                                </div>

                                {(!userData?.coupons || userData.coupons.length === 0) ? (
                                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={<span style={{ color: '#64748b' }}>Bạn chưa sở hữu voucher nào. Hãy đánh giá sản phẩm để nhận voucher!</span>} />
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxHeight: 350, overflowY: 'auto', paddingRight: 4 }}>
                                        {userData.coupons.map((coupon, idx) => (
                                            <div key={idx} style={{
                                                background: coupon.isUsed ? '#0f172a' : 'rgba(124,58,237,0.06)',
                                                border: coupon.isUsed ? '1px dashed #334155' : '1px solid rgba(124,58,237,0.3)',
                                                borderRadius: 16, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                                opacity: coupon.isUsed ? 0.6 : 1, transition: 'all 0.2s'
                                            }}>
                                                <div>
                                                    <div style={{ fontSize: 16, fontWeight: 800, color: coupon.isUsed ? '#64748b' : '#a78bfa' }}>
                                                        {coupon.code}
                                                    </div>
                                                    <div style={{ fontSize: 13, color: '#f1f5f9', marginTop: 4, fontWeight: 500 }}>
                                                        {coupon.description || `Giảm ${coupon.discountValue}${coupon.discountType === 'percentage' ? '%' : 'đ'}`}
                                                    </div>
                                                    <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
                                                        Nhận ngày: {new Date(coupon.acquiredAt).toLocaleDateString('vi-VN')}
                                                    </div>
                                                </div>
                                                <div>
                                                    {coupon.isUsed ? (
                                                        <Tag color="default">Đã dùng</Tag>
                                                    ) : (
                                                        <Button type="primary" size="small" onClick={() => navigate('/')} style={{
                                                            background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600
                                                        }}>
                                                            Dùng ngay
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </Card>
                        </div>
                    </Col>

                    {/* Right Column: Favorites & History */}
                    <Col xs={24} lg={14}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                            {/* Favorite Products */}
                            <Card style={{
                                background: '#1e293b', border: '1px solid #334155', borderRadius: 24,
                                boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
                            }} styles={{ body: { padding: 32 } }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                                    <h3 style={{ fontSize: 18, fontWeight: 800, color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <HeartFilled style={{ color: '#ef4444' }} /> Sản phẩm yêu thích ({favorites.length})
                                    </h3>
                                </div>

                                {favorites.length === 0 ? (
                                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={<span style={{ color: '#64748b' }}>Danh sách yêu thích trống.</span>} />
                                ) : (
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                                        {favorites.map((p) => {
                                            if (!p) return null;
                                            return (
                                                <div key={p._id} onClick={() => navigate(`/product/${p._id}`)} style={{
                                                    background: '#0f172a', border: '1px solid #334155', borderRadius: 16, overflow: 'hidden', cursor: 'pointer',
                                                    transition: 'all 0.2s', display: 'flex', flexDirection: 'column'
                                                }}
                                                onMouseEnter={e => e.currentTarget.style.borderColor = '#7c3aed'}
                                                onMouseLeave={e => e.currentTarget.style.borderColor = '#334155'}
                                                >
                                                    <div style={{ height: 130, background: '#1e293b', position: 'relative' }}>
                                                        <img src={p.image} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                    </div>
                                                    <div style={{ padding: 14, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                                        <div>
                                                            <div style={{ fontSize: 10, color: '#a78bfa', fontWeight: 700, textTransform: 'uppercase' }}>{p.brand}</div>
                                                            <div style={{ fontSize: 13, fontWeight: 600, color: '#f1f5f9', marginTop: 4, height: 38, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                                                                {p.name}
                                                            </div>
                                                        </div>
                                                        <div style={{ fontSize: 14, fontWeight: 800, color: '#fff', marginTop: 10 }}>
                                                            {fmt(p.salePrice || p.price)}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </Card>

                            {/* Recently Viewed */}
                            <Card style={{
                                background: '#1e293b', border: '1px solid #334155', borderRadius: 24,
                                boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
                            }} styles={{ body: { padding: 32 } }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                                    <h3 style={{ fontSize: 18, fontWeight: 800, color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <HistoryOutlined style={{ color: '#38bdf8' }} /> Lịch sử đã xem gần đây
                                    </h3>
                                </div>

                                {history.length === 0 ? (
                                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={<span style={{ color: '#64748b' }}>Bạn chưa xem sản phẩm nào gần đây.</span>} />
                                ) : (
                                    <div style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 10 }}>
                                        {history.map((p) => {
                                            if (!p) return null;
                                            return (
                                                <div key={p._id} onClick={() => navigate(`/product/${p._id}`)} style={{
                                                    flexShrink: 0, width: 140, background: '#0f172a', border: '1px solid #334155', borderRadius: 16, overflow: 'hidden', cursor: 'pointer',
                                                    transition: 'all 0.2s'
                                                }}
                                                onMouseEnter={e => e.currentTarget.style.borderColor = '#7c3aed'}
                                                onMouseLeave={e => e.currentTarget.style.borderColor = '#334155'}
                                                >
                                                    <div style={{ height: 100, background: '#1e293b' }}>
                                                        <img src={p.image} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                    </div>
                                                    <div style={{ padding: 10 }}>
                                                        <div style={{ fontSize: 11, fontWeight: 600, color: '#f1f5f9', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                            {p.name}
                                                        </div>
                                                        <div style={{ fontSize: 12, fontWeight: 800, color: '#a78bfa', marginTop: 4 }}>
                                                            {fmt(p.salePrice || p.price)}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </Card>
                        </div>
                    </Col>
                </Row>
            </div>
        </div>
    );
};

export default ProfilePage;
