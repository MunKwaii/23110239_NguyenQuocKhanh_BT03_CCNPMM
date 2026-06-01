import { useContext, useEffect, useMemo, useState, useRef, useCallback } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AuthContext } from '../components/context/auth.context';
import { CartContext } from '../components/context/cart.context';
import { getProductByIdApi, getSimilarProductsApi, toggleFavoriteApi, getFavoritesApi, createReviewApi, getReviewsApi, checkReviewEligibilityApi } from '../util/api';
import { notification, Modal, Button, Rate, Input, Tag } from 'antd';

const fmt = (v) => (v != null ? new Intl.NumberFormat('vi-VN').format(v) + 'đ' : '');
const fmtSold = (v) => (!v && v !== 0 ? '0' : v >= 1000 ? (v / 1000).toFixed(1).replace('.0', '') + 'k' : String(v));

/* ─── Image Swiper ─────────────────────────────────────────────── */
const ImageSwiper = ({ images, productName }) => {
    const [active, setActive] = useState(0);
    const [dragging, setDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const timerRef = useRef(null);

    const go = useCallback((idx) => {
        setActive((idx + images.length) % images.length);
    }, [images.length]);

    // Auto-play when multiple images
    useEffect(() => {
        if (images.length <= 1) return;
        timerRef.current = setInterval(() => go(active + 1), 4000);
        return () => clearInterval(timerRef.current);
    }, [active, go, images.length]);

    const onMouseDown = (e) => { setDragging(true); setStartX(e.clientX); };
    const onMouseUp = (e) => {
        if (!dragging) return;
        setDragging(false);
        const diff = e.clientX - startX;
        if (Math.abs(diff) > 50) go(diff < 0 ? active + 1 : active - 1);
    };

    const S = {
        wrap: { position: 'relative', background: '#0f172a', borderRadius: 20, overflow: 'hidden', userSelect: 'none' },
        mainImg: { width: '100%', height: 420, objectFit: 'contain', display: 'block', transition: 'opacity .3s' },
        arrow: (side) => ({
            position: 'absolute', top: '50%', [side]: 16, transform: 'translateY(-50%)',
            width: 44, height: 44, borderRadius: '50%', border: 'none', cursor: 'pointer',
            background: 'rgba(255,255,255,.12)', backdropFilter: 'blur(8px)',
            color: '#fff', fontSize: 22, display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background .2s', zIndex: 10,
        }),
        dots: { display: 'flex', justifyContent: 'center', gap: 8, padding: '12px 0 4px' },
        dot: (i) => ({
            width: i === active ? 24 : 8, height: 8, borderRadius: 4,
            background: i === active ? '#7c3aed' : '#334155',
            transition: 'all .3s', cursor: 'pointer', border: 'none',
        }),
        thumbWrap: { display: 'flex', gap: 10, padding: '12px 4px', overflowX: 'auto' },
        thumb: (i) => ({
            flexShrink: 0, width: 80, height: 64, borderRadius: 10, overflow: 'hidden',
            border: `2px solid ${i === active ? '#7c3aed' : '#1e293b'}`,
            cursor: 'pointer', transition: 'border-color .2s',
        }),
    };

    return (
        <div>
            <div style={S.wrap}
                onMouseDown={onMouseDown}
                onMouseUp={onMouseUp}
                onMouseLeave={() => setDragging(false)}
            >
                <img
                    key={active}
                    src={images[active]}
                    alt={`${productName} - ${active + 1}`}
                    style={S.mainImg}
                    draggable={false}
                />
                {/* Overlay badges */}
                <div style={{ position: 'absolute', top: 14, left: 14, display: 'flex', gap: 8 }}>
                    <span style={{ background: 'rgba(0,0,0,.5)', backdropFilter: 'blur(6px)', color: '#fff', fontSize: 12, padding: '3px 10px', borderRadius: 6 }}>
                        {active + 1} / {images.length}
                    </span>
                </div>
                {images.length > 1 && (
                    <>
                        <button style={S.arrow('left')} onClick={() => go(active - 1)}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(124,58,237,.6)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,.12)'}
                        >‹</button>
                        <button style={S.arrow('right')} onClick={() => go(active + 1)}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(124,58,237,.6)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,.12)'}
                        >›</button>
                    </>
                )}
            </div>

            {/* Dots */}
            {images.length > 1 && (
                <div style={S.dots}>
                    {images.map((_, i) => (
                        <button key={i} style={S.dot(i)} onClick={() => setActive(i)} />
                    ))}
                </div>
            )}

            {/* Thumbnails */}
            {images.length > 1 && (
                <div style={S.thumbWrap}>
                    {images.map((img, i) => (
                        <div key={i} style={S.thumb(i)} onClick={() => setActive(i)}>
                            <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

/* ─── Info Row ──────────────────────────────────────────────────── */
const InfoRow = ({ label, value, color }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#1e293b', borderRadius: 12, marginBottom: 8 }}>
        <span style={{ color: '#94a3b8', fontSize: 14 }}>{label}</span>
        <span style={{ fontWeight: 700, fontSize: 14, color: color || '#f1f5f9' }}>{value}</span>
    </div>
);

/* ─── Similar Card ──────────────────────────────────────────────── */
const SimilarCard = ({ item, onClick }) => (
    <div onClick={onClick} style={{ background: '#1e293b', borderRadius: 16, overflow: 'hidden', border: '1px solid #334155', cursor: 'pointer', transition: 'transform .25s, box-shadow .25s' }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 30px rgba(124,58,237,.2)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
    >
        <div style={{ height: 160, overflow: 'hidden', background: '#0f172a' }}>
            <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        <div style={{ padding: '14px 14px 16px' }}>
            <div style={{ fontSize: 11, color: '#a78bfa', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>{item.brand}</div>
            <p style={{ color: '#f1f5f9', fontWeight: 600, fontSize: 14, margin: '0 0 10px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{item.name}</p>
            <div style={{ color: '#fff', fontWeight: 800, fontSize: 15 }}>{fmt(item.salePrice || item.price)}</div>
            {item.salePrice && <div style={{ color: '#64748b', fontSize: 12, textDecoration: 'line-through' }}>{fmt(item.price)}</div>}
        </div>
    </div>
);

/* ─── Main Page ─────────────────────────────────────────────────── */
const ProductDetailPage = () => {
    const { auth, setAuth } = useContext(AuthContext);
    const { addToCart, cartCount } = useContext(CartContext);
    const navigate = useNavigate();
    const { id } = useParams();
    
    const [product, setProduct] = useState(null);
    const [similar, setSimilar] = useState([]);
    const [qty, setQty] = useState(1);
    const [loading, setLoading] = useState(true);
    const [addedToCart, setAddedToCart] = useState(false);

    // Favorites & Reviews States
    const [isFavorite, setIsFavorite] = useState(false);
    const [reviews, setReviews] = useState([]);
    const [eligibleData, setEligibleData] = useState({ eligible: false });
    const [formRating, setFormRating] = useState(5);
    const [formComment, setFormComment] = useState('');
    const [formReward, setFormReward] = useState('points');
    const [submittingReview, setSubmittingReview] = useState(false);
    const [rewardModalVisible, setRewardModalVisible] = useState(false);
    const [rewardDetail, setRewardDetail] = useState(null);

    const isMember = auth.isAuthenticated && (auth.user.role || 'USER') === 'USER';

    const loadAllDetails = async () => {
        if (!isMember) { setLoading(false); return; }
        setLoading(true);
        setQty(1);
        try {
            const [pRes, sRes, favsRes, revsRes, eligRes] = await Promise.all([
                getProductByIdApi(id),
                getSimilarProductsApi(id, 8),
                getFavoritesApi(),
                getReviewsApi(id),
                checkReviewEligibilityApi(id)
            ]);

            if (pRes && !pRes.message) setProduct(pRes);
            if (sRes && !sRes.message) setSimilar(sRes);
            if (favsRes && !favsRes.message) {
                setIsFavorite(favsRes.some(f => f._id === id));
            }
            if (revsRes && !revsRes.message) setReviews(revsRes);
            if (eligRes && !eligRes.message) setEligibleData(eligRes);
        } catch (error) {
            console.error('Error loading product details:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAllDetails();
    }, [id, isMember]);

    const handleToggleFavorite = async () => {
        try {
            const res = await toggleFavoriteApi(product._id);
            if (res && res.success) {
                setIsFavorite(res.isFavorite);
                notification.success({
                    message: res.isFavorite ? '❤️ Đã thêm vào yêu thích!' : '💔 Đã xóa khỏi yêu thích!',
                    placement: 'topRight'
                });
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleReviewSubmit = async () => {
        if (!formComment.trim()) {
            notification.warning({ message: 'Vui lòng nhập nhận xét.' });
            return;
        }
        setSubmittingReview(true);
        try {
            const res = await createReviewApi({
                productId: product._id,
                rating: formRating,
                comment: formComment,
                rewardType: formReward
            });

            if (res && !res.message) {
                setRewardDetail(res);
                setRewardModalVisible(true);
                // Reset form
                setFormComment('');
                setFormRating(5);
                setFormReward('points');
                
                // Refresh data
                const [pRes, revsRes, eligRes] = await Promise.all([
                    getProductByIdApi(id),
                    getReviewsApi(id),
                    checkReviewEligibilityApi(id)
                ]);
                if (pRes && !pRes.message) setProduct(pRes);
                if (revsRes && !revsRes.message) setReviews(revsRes);
                if (eligRes && !eligRes.message) setEligibleData(eligRes);
            } else {
                notification.error({
                    message: 'Gửi đánh giá thất bại',
                    description: res?.message || 'Đã có lỗi xảy ra.'
                });
            }
        } catch (error) {
            console.error(error);
        } finally {
            setSubmittingReview(false);
        }
    };

    const images = useMemo(() => {
        if (!product) return [];
        const all = [product.image, ...(product.images || [])].filter(Boolean);
        return [...new Set(all)]; // deduplicate
    }, [product]);

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        setAuth({ isAuthenticated: false, user: { email: '', name: '', role: '' } });
        navigate('/login');
    };

    const handleAddToCart = async () => {
        const success = await addToCart(product._id, qty);
        if (success) {
            setAddedToCart(true);
            notification.success({ message: 'Đã thêm vào giỏ hàng!', description: `${qty} x ${product.name}` });
            setTimeout(() => setAddedToCart(false), 2000);
        }
    };

    const pageStyle = { minHeight: '100vh', background: '#0f172a', color: '#f1f5f9', fontFamily: "'Inter', system-ui, sans-serif" };

    /* Gate screens */
    if (!auth.isAuthenticated) return (
        <div style={{ ...pageStyle, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center', background: '#1e293b', border: '1px solid #334155', borderRadius: 24, padding: 60, maxWidth: 400 }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
                <h2 style={{ color: '#f8fafc', margin: '0 0 12px' }}>Vui lòng đăng nhập</h2>
                <p style={{ color: '#94a3b8', margin: '0 0 24px' }}>Đăng nhập để xem chi tiết sản phẩm.</p>
                <button onClick={() => navigate('/login')} style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', color: '#fff', border: 'none', borderRadius: 12, padding: '12px 32px', fontWeight: 700, cursor: 'pointer' }}>
                    Đăng nhập
                </button>
            </div>
        </div>
    );

    if (loading) return (
        <div style={{ ...pageStyle, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center' }}>
                <div style={{ width: 48, height: 48, border: '4px solid #334155', borderTopColor: '#7c3aed', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
                <p style={{ color: '#64748b' }}>Đang tải sản phẩm...</p>
            </div>
        </div>
    );

    if (!product) return (
        <div style={{ ...pageStyle, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 64, marginBottom: 16 }}>😕</div>
                <p style={{ color: '#94a3b8' }}>Không tìm thấy sản phẩm.</p>
                <button onClick={() => navigate('/')} style={{ marginTop: 16, background: '#1e293b', border: '1px solid #334155', color: '#f1f5f9', borderRadius: 10, padding: '10px 24px', cursor: 'pointer' }}>← Về trang chủ</button>
            </div>
        </div>
    );

    const discount = product.salePrice ? Math.round((1 - product.salePrice / product.price) * 100) : 0;
    const inStock = product.stock > 0;

    return (
        <div style={pageStyle}>
            {/* Spinner keyframes */}
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

            {/* Sticky Header */}
            <div style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(15,23,42,.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #1e293b', padding: '0 24px' }}>
                <div style={{ maxWidth: 1200, margin: '0 auto', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: '#64748b' }}>
                        <span onClick={() => navigate('/')} style={{ cursor: 'pointer', color: '#a78bfa', fontWeight: 700 }}>🎧 TechZone</span>
                        <span>›</span>
                        <span style={{ color: '#94a3b8', textTransform: 'capitalize' }}>{product.category}</span>
                        <span>›</span>
                        <span style={{ color: '#f1f5f9', fontWeight: 600, maxWidth: 200, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{product.name}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 12 }}>
                        <button onClick={() => navigate('/search')} style={{ background: '#1e293b', border: '1px solid #334155', color: '#94a3b8', borderRadius: 10, padding: '7px 16px', cursor: 'pointer', fontSize: 13 }}>🔍 Tìm kiếm</button>
                        <button onClick={() => navigate('/cart')} style={{ background: '#1e293b', border: '1px solid #334155', color: '#94a3b8', borderRadius: 10, padding: '7px 16px', cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                            🛒 Giỏ hàng ({cartCount})
                        </button>
                        <button onClick={handleLogout} style={{ background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.3)', color: '#f87171', borderRadius: 10, padding: '7px 16px', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>Đăng xuất</button>
                    </div>
                </div>
            </div>

            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px' }}>

                {/* Main Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, marginBottom: 60, alignItems: 'start' }}>

                    {/* Left – Image Swiper */}
                    <div>
                        <ImageSwiper images={images} productName={product.name} />
                    </div>

                    {/* Right – Info */}
                    <div style={{ background: '#1e293b', borderRadius: 20, padding: 32, border: '1px solid #334155' }}>

                        {/* Badges */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 18 }}>
                            <span style={{ background: 'rgba(124,58,237,.15)', border: '1px solid rgba(124,58,237,.3)', color: '#a78bfa', borderRadius: 8, padding: '3px 12px', fontSize: 12, fontWeight: 700 }}>
                                {product.brand}
                            </span>
                            <span style={{ background: 'rgba(71,85,105,.3)', color: '#94a3b8', borderRadius: 8, padding: '3px 12px', fontSize: 12, fontWeight: 600, textTransform: 'capitalize' }}>
                                📁 {product.category}
                            </span>
                            {product.isNewProduct && <span style={{ background: 'rgba(6,182,212,.15)', color: '#22d3ee', borderRadius: 8, padding: '3px 12px', fontSize: 12, fontWeight: 700 }}>✨ Mới</span>}
                            {product.isBestSeller && <span style={{ background: 'rgba(217,119,6,.15)', color: '#fbbf24', borderRadius: 8, padding: '3px 12px', fontSize: 12, fontWeight: 700 }}>🏆 Bán chạy</span>}
                            {product.isPromotion && <span style={{ background: 'rgba(225,29,72,.15)', color: '#fb7185', borderRadius: 8, padding: '3px 12px', fontSize: 12, fontWeight: 700 }}>🔥 Sale</span>}
                        </div>

                        {/* Product Title and Favorite Button */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: 16, marginBottom: 12 }}>
                            <h1 style={{ fontSize: 26, fontWeight: 900, color: '#f8fafc', margin: 0, lineHeight: 1.3, flex: 1 }}>{product.name}</h1>
                            <button
                                onClick={handleToggleFavorite}
                                style={{
                                    background: 'rgba(255,255,255,.05)',
                                    border: '1px solid #334155',
                                    borderRadius: '50%',
                                    width: 46, height: 46,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    cursor: 'pointer', transition: 'all .25s',
                                    color: isFavorite ? '#ef4444' : '#94a3b8',
                                    fontSize: 20
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.background = 'rgba(255,255,255,.1)';
                                    e.currentTarget.style.borderColor = '#ef4444';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.background = 'rgba(255,255,255,.05)';
                                    e.currentTarget.style.borderColor = '#334155';
                                }}
                            >
                                {isFavorite ? '❤️' : '🤍'}
                            </button>
                        </div>

                        <p style={{ color: '#94a3b8', fontSize: 14, lineHeight: 1.7, margin: '0 0 24px' }}>
                            {product.description || 'Sản phẩm chất lượng cao, mang đến trải nghiệm âm thanh tuyệt vời cho người dùng.'}
                        </p>

                        {/* Price */}
                        <div style={{ background: '#0f172a', borderRadius: 14, padding: '18px 20px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                            <span style={{ fontSize: 32, fontWeight: 900, color: '#fff' }}>{fmt(product.salePrice || product.price)}</span>
                            {product.salePrice && (
                                <>
                                    <span style={{ fontSize: 18, color: '#64748b', textDecoration: 'line-through' }}>{fmt(product.price)}</span>
                                    <span style={{ background: '#e11d48', color: '#fff', borderRadius: 8, padding: '4px 10px', fontSize: 13, fontWeight: 800 }}>-{discount}%</span>
                                </>
                            )}
                        </div>

                        {/* Info Rows */}
                        <InfoRow label="📦 Tình trạng kho" value={inStock ? `Còn ${product.stock} sản phẩm` : 'Hết hàng'} color={inStock ? '#4ade80' : '#f87171'} />
                        <InfoRow label="🛍️ Đã bán" value={fmtSold(product.sold) + ' sản phẩm'} />
                        <InfoRow label="⭐ Đánh giá" value={`${product.rating || 4.5} / 5`} color="#fbbf24" />
                        <InfoRow label="🔧 Bảo hành" value={`${product.warrantyMonths || 24} tháng`} />
                        <InfoRow label="👁️ Lượt xem" value={`${product.views || 0} views`} color="#38bdf8" />
                        <InfoRow label="👥 Khách đã mua" value={`${product.buyersCount || 0} khách`} color="#a78bfa" />
                        <InfoRow label="💬 Khách nhận xét" value={`${product.commentersCount || 0} bình luận`} color="#fb7185" />

                        {/* Tags */}
                        {product.tags?.length > 0 && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, margin: '16px 0 20px' }}>
                                {product.tags.map(tag => (
                                    <span key={tag} style={{ background: '#0f172a', border: '1px solid #334155', color: '#64748b', borderRadius: 6, padding: '3px 10px', fontSize: 12 }}>#{tag}</span>
                                ))}
                            </div>
                        )}

                        {/* Quantity */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
                            <span style={{ color: '#94a3b8', fontSize: 14, fontWeight: 600 }}>Số lượng:</span>
                            <div style={{ display: 'flex', alignItems: 'center', background: '#0f172a', borderRadius: 12, overflow: 'hidden', border: '1px solid #334155' }}>
                                <button onClick={() => setQty(q => Math.max(1, q - 1))}
                                    style={{ width: 44, height: 44, border: 'none', background: 'transparent', color: '#fff', fontSize: 22, cursor: 'pointer', fontWeight: 300, transition: 'background .2s' }}
                                    onMouseEnter={e => e.currentTarget.style.background = '#1e293b'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                >−</button>
                                <span style={{ minWidth: 48, textAlign: 'center', fontSize: 16, fontWeight: 700, color: '#f8fafc' }}>{qty}</span>
                                <button onClick={() => setQty(q => Math.min(q + 1, product.stock || 1))}
                                    disabled={!inStock}
                                    style={{ width: 44, height: 44, border: 'none', background: 'transparent', color: inStock ? '#fff' : '#475569', fontSize: 22, cursor: inStock ? 'pointer' : 'not-allowed', fontWeight: 300, transition: 'background .2s' }}
                                    onMouseEnter={e => { if (inStock) e.currentTarget.style.background = '#1e293b'; }}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                >+</button>
                            </div>
                            <span style={{ color: '#475569', fontSize: 13 }}>Tối đa: {product.stock}</span>
                        </div>

                        {/* CTA Buttons */}
                        <div style={{ display: 'flex', gap: 12 }}>
                            <button
                                onClick={handleAddToCart}
                                disabled={!inStock}
                                style={{
                                    flex: 1, padding: '14px 0', border: 'none', borderRadius: 14, fontWeight: 700, fontSize: 15, cursor: inStock ? 'pointer' : 'not-allowed',
                                    background: addedToCart ? '#16a34a' : (inStock ? 'linear-gradient(135deg,#7c3aed,#4f46e5)' : '#1e293b'),
                                    color: inStock ? '#fff' : '#475569', transition: 'all .3s'
                                }}
                            >
                                {addedToCart ? '✓ Đã thêm!' : '🛒 Thêm vào giỏ'}
                            </button>
                            <button style={{ padding: '14px 20px', border: '1px solid #334155', borderRadius: 14, background: 'transparent', color: '#94a3b8', cursor: 'pointer', fontWeight: 600, transition: 'all .2s' }}
                                onClick={() => navigate('/profile')}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = '#7c3aed'; e.currentTarget.style.color = '#a78bfa'; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = '#334155'; e.currentTarget.style.color = '#94a3b8'; }}
                            >
                                👤 Trang cá nhân
                            </button>
                        </div>
                    </div>
                </div>

                {/* Reviews & Comments Section */}
                <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 24, padding: 32, marginBottom: 60 }}>
                    <h2 id="reviews" style={{ fontSize: 22, fontWeight: 800, color: '#f8fafc', marginBottom: 28, display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span>💬</span> Đánh giá & Nhận xét ({reviews.length})
                    </h2>

                    {/* Review Form (if eligible) */}
                    {eligibleData.eligible ? (
                        <div style={{ background: '#0f172a', padding: 24, borderRadius: 20, border: '1px solid rgba(124, 58, 237, 0.2)', marginBottom: 40 }}>
                            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#a78bfa', marginBottom: 18 }}>✍️ Viết nhận xét & Đánh giá của bạn</h3>
                            
                            <div style={{ marginBottom: 18 }}>
                                <label style={{ display: 'block', color: '#94a3b8', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Số sao đánh giá:</label>
                                <Rate value={formRating} onChange={setFormRating} style={{ color: '#fbbf24', fontSize: 24 }} />
                            </div>

                            <div style={{ marginBottom: 20 }}>
                                <label style={{ display: 'block', color: '#94a3b8', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Nhận xét chi tiết:</label>
                                <Input.TextArea
                                    rows={4}
                                    value={formComment}
                                    onChange={(e) => setFormComment(e.target.value)}
                                    placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này (chất lượng âm thanh, độ êm ái, thời lượng pin...)..."
                                    style={{ background: '#1e293b', border: '1px solid #334155', color: '#fff', borderRadius: 12 }}
                                />
                            </div>

                            {/* Reward Selection */}
                            <div style={{ marginBottom: 24 }}>
                                <label style={{ display: 'block', color: '#94a3b8', fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Chọn quà tặng của bạn sau khi gửi đánh giá:</label>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                    <div
                                        onClick={() => setFormReward('points')}
                                        style={{
                                            padding: 16, borderRadius: 14, cursor: 'pointer', textAlign: 'center',
                                            background: formReward === 'points' ? 'rgba(234,179,8,0.08)' : '#1e293b',
                                            border: formReward === 'points' ? '2px solid #eab308' : '1px solid #334155',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <div style={{ fontSize: 24, marginBottom: 4 }}>💎</div>
                                        <div style={{ fontWeight: 700, color: '#f8fafc', fontSize: 14 }}>Tặng 100 Điểm Tích Lũy</div>
                                        <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>Cộng thẳng vào kho điểm tích lũy</div>
                                    </div>

                                    <div
                                        onClick={() => setFormReward('coupon')}
                                        style={{
                                            padding: 16, borderRadius: 14, cursor: 'pointer', textAlign: 'center',
                                            background: formReward === 'coupon' ? 'rgba(124,58,237,0.08)' : '#1e293b',
                                            border: formReward === 'coupon' ? '2px solid #7c3aed' : '1px solid #334155',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <div style={{ fontSize: 24, marginBottom: 4 }}>🎟️</div>
                                        <div style={{ fontWeight: 700, color: '#f8fafc', fontSize: 14 }}>Tặng Voucher 10%</div>
                                        <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>Mã giảm giá áp cho đơn sau từ 0đ</div>
                                    </div>
                                </div>
                            </div>

                            <Button
                                type="primary"
                                loading={submittingReview}
                                onClick={handleReviewSubmit}
                                style={{
                                    height: 44, padding: '0 28px', border: 'none', borderRadius: 10, fontWeight: 700,
                                    background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', color: '#fff'
                                }}
                            >
                                Gửi Đánh Giá & Nhận Quà
                            </Button>
                        </div>
                    ) : (
                        eligibleData.reason && (
                            <div style={{ background: '#0f172a', padding: '14px 20px', borderRadius: 14, border: '1px solid #1e293b', color: '#64748b', fontSize: 13, marginBottom: 30, display: 'inline-block' }}>
                                🔒 {eligibleData.reason}
                            </div>
                        )
                    )}

                    {/* Reviews List */}
                    {reviews.length === 0 ? (
                        <div style={{ color: '#64748b', textAlign: 'center', padding: '40px 0', fontStyle: 'italic' }}>
                            Chưa có nhận xét nào cho sản phẩm này. Hãy mua hàng và để lại nhận xét đầu tiên!
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                            {reviews.map((r) => (
                                <div key={r._id} style={{ borderBottom: '1px solid #334155', paddingBottom: 20 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 8 }}>
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                <div style={{
                                                    width: 32, height: 32, borderRadius: '50%', background: '#475569',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    color: '#fff', fontWeight: 'bold', fontSize: 12
                                                }}>
                                                    {r.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 700, color: '#f1f5f9', fontSize: 14 }}>{r.name}</div>
                                                    <div style={{ color: '#64748b', fontSize: 11 }}>{new Date(r.createdAt).toLocaleDateString('vi-VN')}</div>
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <Rate disabled value={r.rating} style={{ color: '#fbbf24', fontSize: 14 }} />
                                        </div>
                                    </div>
                                    <p style={{ color: '#e2e8f0', fontSize: 14, lineHeight: 1.6, margin: '0 0 10px', paddingLeft: 42 }}>
                                        {r.comment}
                                    </p>
                                    <div style={{ paddingLeft: 42 }}>
                                        <Tag color={r.rewardType === 'points' ? 'gold' : 'purple'} style={{ fontSize: 11, borderRadius: 6 }}>
                                            🎁 Đã nhận: {r.rewardType === 'points' ? `+${r.rewardValue} điểm tích lũy` : `Mã giảm giá ${r.rewardValue}`}
                                        </Tag>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Similar Products */}
                {similar.length > 0 && (
                    <div>
                        <div style={{ marginBottom: 28 }}>
                            <h2 style={{ fontSize: 24, fontWeight: 900, color: '#f8fafc', margin: '0 0 6px' }}>
                                🔗 Sản Phẩm Tương Tự
                            </h2>
                            <p style={{ color: '#64748b', margin: 0, fontSize: 14 }}>Danh mục: <span style={{ color: '#a78bfa', fontWeight: 700, textTransform: 'capitalize' }}>{product.category}</span></p>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 20 }}>
                            {similar.map(item => (
                                <SimilarCard key={item._id} item={item} onClick={() => navigate(`/product/${item._id}`)} />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Reward Pop-up Modal */}
            <Modal
                title={null}
                open={rewardModalVisible}
                footer={null}
                onCancel={() => setRewardModalVisible(false)}
                centered
                styles={{
                    body: { background: '#1e293b', color: '#f1f5f9', padding: 32, borderRadius: 24, textAlign: 'center' },
                    content: { background: '#1e293b', padding: 0, borderRadius: 24 }
                }}
                width={420}
            >
                <div style={{ fontFamily: "'Inter', sans-serif" }}>
                    <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
                    <h3 style={{ fontSize: 20, fontWeight: 800, color: '#fff', marginBottom: 10 }}>Cảm ơn nhận xét của bạn!</h3>
                    <p style={{ color: '#94a3b8', fontSize: 14, marginBottom: 24 }}>
                        Đánh giá của bạn đã được gửi thành công. Phần thưởng của bạn là:
                    </p>

                    {rewardDetail?.rewardType === 'points' ? (
                        <div style={{ background: '#0f172a', padding: 24, borderRadius: 16, marginBottom: 24 }}>
                            <div style={{ fontSize: 32, fontWeight: 900, color: '#eab308' }}>+100</div>
                            <div style={{ color: '#eab308', fontWeight: 700, fontSize: 13, textTransform: 'uppercase', marginTop: 4 }}>Điểm tích lũy</div>
                            <p style={{ color: '#64748b', fontSize: 12, margin: '12px 0 0' }}>
                                Điểm đã được cộng trực tiếp vào Kho điểm của bạn.
                            </p>
                        </div>
                    ) : (
                        <div style={{ background: '#0f172a', padding: 24, borderRadius: 16, marginBottom: 24, border: '1px dashed #7c3aed' }}>
                            <div style={{ color: '#a78bfa', fontWeight: 700, fontSize: 12, textTransform: 'uppercase', marginBottom: 8 }}>VOUCHER GIẢM 10%</div>
                            <div style={{ fontSize: 26, fontWeight: 900, color: '#fff', letterSpacing: 1 }}>{rewardDetail?.rewardValue}</div>
                            <p style={{ color: '#64748b', fontSize: 12, margin: '12px 0 0' }}>
                                Mã đã được lưu vào ví. Dùng tại trang thanh toán cho đơn tiếp theo.
                            </p>
                        </div>
                    )}

                    <Button
                        type="primary"
                        onClick={() => setRewardModalVisible(false)}
                        style={{
                            width: '100%', height: 44, borderRadius: 10, border: 'none', fontWeight: 700,
                            background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', color: '#fff'
                        }}
                    >
                        Tuyệt vời, đóng
                    </Button>
                </div>
            </Modal>
        </div>
    );
};

export default ProductDetailPage;

