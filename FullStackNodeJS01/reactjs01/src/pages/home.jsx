import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../components/context/auth.context';
import { useNavigate } from 'react-router-dom';
import { getProductsApi } from '../util/api';

const formatPrice = (v) =>
    v != null ? new Intl.NumberFormat('vi-VN').format(v) + 'đ' : '';

const formatSold = (v) => {
    if (!v && v !== 0) return '0';
    return v >= 1000 ? (v / 1000).toFixed(1).replace('.0', '') + 'k' : String(v);
};

/* ── Product Card ── */
const ProductCard = ({ product, badge, badgeColor, onDetail, formatSold: fs }) => (
    <div
        onClick={onDetail}
        style={{ cursor: 'pointer', background: '#1e293b', border: '1px solid #334155', borderRadius: '16px', overflow: 'hidden', transition: 'transform .3s, box-shadow .3s' }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 20px 40px rgba(139,92,246,.25)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
    >
        <div style={{ position: 'relative', aspectRatio: '1/1', overflow: 'hidden', background: '#0f172a' }}>
            <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform .5s' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            />
            {badge && (
                <span style={{ position: 'absolute', top: 12, left: 12, background: badgeColor, color: '#fff', fontSize: 10, fontWeight: 800, padding: '3px 10px', borderRadius: 999, letterSpacing: 1, textTransform: 'uppercase' }}>
                    {badge}
                </span>
            )}
        </div>
        <div style={{ padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ fontSize: 11, color: '#a78bfa', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>{product.brand}</span>
                {fs && <span style={{ fontSize: 10, color: '#64748b', fontWeight: 600 }}>Đã bán {fs(product.sold)}</span>}
            </div>
            <p style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 15, margin: '0 0 12px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{product.name}</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <div style={{ color: '#fff', fontWeight: 800, fontSize: 17 }}>{formatPrice(product.salePrice || product.price)}</div>
                    {product.salePrice && <div style={{ color: '#64748b', fontSize: 12, textDecoration: 'line-through' }}>{formatPrice(product.price)}</div>}
                </div>
                <button style={{ width: 38, height: 38, borderRadius: 10, background: '#7c3aed', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 300, transition: 'background .2s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#6d28d9'}
                    onMouseLeave={e => e.currentTarget.style.background = '#7c3aed'}
                    onClick={e => { e.stopPropagation(); onDetail(); }}
                >+</button>
            </div>
        </div>
    </div>
);

/* ── Section Header ── */
const SectionHeader = ({ title, sub, accent }) => (
    <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 28, fontWeight: 900, color: '#f8fafc', margin: 0, lineHeight: 1.2 }}>
            <span style={{ borderBottom: `3px solid ${accent}`, paddingBottom: 4 }}>{title}</span>
        </h2>
        {sub && <p style={{ color: '#94a3b8', margin: '8px 0 0', fontSize: 14 }}>{sub}</p>}
    </div>
);

/* ── Main Page ── */
const HomePage = () => {
    const { auth, setAuth } = useContext(AuthContext);
    const navigate = useNavigate();
    const [newProducts, setNewProducts] = useState([]);
    const [bestSellers, setBestSellers] = useState([]);
    const [promoProducts, setPromoProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const isMember = auth.isAuthenticated && (auth.user.role || 'USER') === 'USER';

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        setAuth({ isAuthenticated: false, user: { email: '', name: '', role: '' } });
        navigate('/login');
    };

    useEffect(() => {
        if (!isMember) { setLoading(false); return; }
        const fetch = async () => {
            setLoading(true);
            try {
                const [n, b, p] = await Promise.all([
                    getProductsApi('new', 8),
                    getProductsApi('best', 8),
                    getProductsApi('promo', 4),
                ]);
                // Handle both array (old) and {products, total} (new) response format
                const extract = (res) => Array.isArray(res) ? res : (res?.products ?? []);
                if (!n?.message) setNewProducts(extract(n));
                if (!b?.message) setBestSellers(extract(b));
                if (!p?.message) setPromoProducts(extract(p));
            } finally { setLoading(false); }
        };
        fetch();
    }, [isMember]);

    const S = {
        page: { minHeight: '100vh', background: '#0f172a', color: '#f1f5f9', fontFamily: "'Inter', system-ui, sans-serif" },
        nav: { position: 'sticky', top: 0, zIndex: 100, background: 'rgba(15,23,42,.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #1e293b', padding: '0 24px' },
        navInner: { maxWidth: 1280, margin: '0 auto', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
        logo: { display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' },
        logoIcon: { width: 40, height: 40, background: 'linear-gradient(135deg,#7c3aed,#ec4899)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: 18 },
        logoText: { fontSize: 20, fontWeight: 900, background: 'linear-gradient(90deg,#a78bfa,#f472b6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
        userPill: { display: 'flex', alignItems: 'center', gap: 10, background: '#1e293b', border: '1px solid #334155', borderRadius: 12, padding: '6px 14px' },
        avatar: { width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#7c3aed,#ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 13 },
        logoutBtn: { background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.3)', color: '#f87171', padding: '8px 16px', borderRadius: 10, cursor: 'pointer', fontWeight: 600, fontSize: 13, transition: 'all .2s' },
        main: { maxWidth: 1280, margin: '0 auto', padding: '40px 24px' },
        hero: { position: 'relative', borderRadius: 24, overflow: 'hidden', marginBottom: 60, height: 440 },
        heroBg: { position: 'absolute', inset: 0, backgroundImage: 'url(https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1800&fit=crop)', backgroundSize: 'cover', backgroundPosition: 'center' },
        heroOverlay: { position: 'absolute', inset: 0, background: 'linear-gradient(90deg,rgba(15,23,42,.95) 0%,rgba(15,23,42,.6) 60%,transparent 100%)' },
        heroContent: { position: 'relative', zIndex: 10, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 60px', maxWidth: 640 },
        badge: { display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(124,58,237,.2)', border: '1px solid rgba(124,58,237,.4)', color: '#a78bfa', borderRadius: 999, padding: '4px 14px', fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 20 },
        heroTitle: { fontSize: 52, fontWeight: 900, lineHeight: 1.1, color: '#f8fafc', margin: '0 0 16px' },
        heroSub: { color: '#94a3b8', fontSize: 17, lineHeight: 1.7, margin: '0 0 32px' },
        heroBtns: { display: 'flex', gap: 12 },
        heroBtn1: { background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', color: '#fff', border: 'none', borderRadius: 12, padding: '14px 32px', fontWeight: 700, fontSize: 15, cursor: 'pointer', transition: 'transform .2s,box-shadow .2s' },
        heroBtn2: { background: 'rgba(255,255,255,.08)', color: '#fff', border: '1px solid rgba(255,255,255,.15)', borderRadius: 12, padding: '14px 32px', fontWeight: 700, fontSize: 15, cursor: 'pointer' },
        promoCards: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20, marginBottom: 64 },
        promoCard: (g) => ({ background: `linear-gradient(135deg,${g})`, borderRadius: 20, padding: 28, position: 'relative', overflow: 'hidden', cursor: 'default' }),
        promoTag: { background: 'rgba(255,255,255,.2)', color: '#fff', fontSize: 10, fontWeight: 800, padding: '3px 10px', borderRadius: 6, textTransform: 'uppercase', letterSpacing: 1, display: 'inline-block', marginBottom: 14 },
        promoTitle: { color: '#fff', fontWeight: 800, fontSize: 20, margin: '0 0 8px' },
        promoDesc: { color: 'rgba(255,255,255,.75)', fontSize: 13, lineHeight: 1.6, margin: '0 0 16px' },
        promoCode: { color: '#fff', fontFamily: 'monospace', fontWeight: 700, fontSize: 14, borderBottom: '2px dashed rgba(255,255,255,.4)', display: 'inline' },
        memberCard: { background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', borderRadius: 20, padding: '32px 40px', marginBottom: 64, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20 },
        memberInfo: { color: '#fff' },
        memberPills: { display: 'flex', gap: 10, flexWrap: 'wrap' },
        memberPill: { background: 'rgba(255,255,255,.15)', border: '1px solid rgba(255,255,255,.25)', color: '#fff', borderRadius: 999, padding: '6px 16px', fontSize: 13, fontWeight: 600 },
        grid4: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 20 },
        section: { marginBottom: 64 },
    };

    /* ── NOT AUTHENTICATED ── */
    if (!auth.isAuthenticated) return (
        <div style={{ ...S.page, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
            <div style={{ textAlign: 'center', background: '#1e293b', border: '1px solid #334155', borderRadius: 24, padding: '60px 50px', maxWidth: 480, width: '100%', margin: '0 20px' }}>
                <div style={{ width: 72, height: 72, background: 'linear-gradient(135deg,#7c3aed,#ec4899)', borderRadius: 20, margin: '0 auto 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>🎧</div>
                <h1 style={{ fontSize: 36, fontWeight: 900, color: '#f8fafc', margin: '0 0 12px' }}>
                    <span style={{ background: 'linear-gradient(90deg,#a78bfa,#f472b6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>TechZone</span>
                </h1>
                <p style={{ color: '#94a3b8', fontSize: 16, lineHeight: 1.7, margin: '0 0 32px' }}>Khám phá bộ sưu tập tai nghe cao cấp dành riêng cho thành viên.</p>
                <button onClick={() => navigate('/login')} style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', color: '#fff', border: 'none', borderRadius: 14, padding: '16px 40px', fontWeight: 700, fontSize: 16, cursor: 'pointer', width: '100%' }}>
                    Đăng nhập ngay →
                </button>
            </div>
        </div>
    );

    /* ── NOT MEMBER ── */
    if (!isMember) return (
        <div style={{ ...S.page, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
            <div style={{ textAlign: 'center', background: '#1e293b', border: '1px solid #334155', borderRadius: 24, padding: '60px 50px', maxWidth: 480, width: '100%', margin: '0 20px' }}>
                <div style={{ fontSize: 56, marginBottom: 16 }}>⚠️</div>
                <h1 style={{ color: '#f8fafc', fontSize: 26, fontWeight: 800, margin: '0 0 12px' }}>Quyền truy cập bị từ chối</h1>
                <p style={{ color: '#94a3b8', margin: '0 0 28px' }}>Tài khoản này chưa có quyền thành viên.</p>
                <button onClick={handleLogout} style={{ background: '#dc2626', color: '#fff', border: 'none', borderRadius: 12, padding: '12px 32px', fontWeight: 700, cursor: 'pointer' }}>Đăng xuất</button>
            </div>
        </div>
    );

    /* ── MAIN ── */
    return (
        <div style={S.page}>
            {/* NAV */}
            <nav style={S.nav}>
                <div style={S.navInner}>
                    <div style={S.logo} onClick={() => navigate('/')}>
                        <div style={S.logoIcon}>🎧</div>
                        <span style={S.logoText}>TechZone</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <button onClick={() => navigate('/search')}
                            style={{ background: '#1e293b', border: '1px solid #334155', color: '#94a3b8', borderRadius: 12, padding: '8px 20px', cursor: 'pointer', fontSize: 14, fontWeight: 600, transition: 'all .2s', display: 'flex', alignItems: 'center', gap: 8 }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = '#7c3aed'; e.currentTarget.style.color = '#a78bfa'; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = '#334155'; e.currentTarget.style.color = '#94a3b8'; }}
                        >
                            🔍 Tìm kiếm
                        </button>
                        <div style={S.userPill}>
                            <div style={S.avatar}>{(auth.user.name || auth.user.email || 'U').charAt(0).toUpperCase()}</div>
                            <div>
                                <div style={{ color: '#f1f5f9', fontSize: 13, fontWeight: 700 }}>{auth.user.name || 'Member'}</div>
                                <div style={{ color: '#a78bfa', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>{auth.user.role || 'USER'}</div>
                            </div>
                        </div>
                        <button
                            style={S.logoutBtn}
                            onMouseEnter={e => { e.currentTarget.style.background = '#dc2626'; e.currentTarget.style.color = '#fff'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,.1)'; e.currentTarget.style.color = '#f87171'; }}
                            onClick={handleLogout}
                        >
                            Đăng xuất
                        </button>
                    </div>
                </div>
            </nav>

            <main style={S.main}>

                {/* HERO */}
                <div style={S.hero}>
                    <div style={S.heroBg} />
                    <div style={S.heroOverlay} />
                    <div style={S.heroContent}>
                        <div style={S.badge}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#a78bfa' }} />
                            Thành viên độc quyền
                        </div>
                        <h1 style={S.heroTitle}>
                            Định Nghĩa Lại<br />
                            <span style={{ background: 'linear-gradient(90deg,#a78bfa,#f472b6,#818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                Âm Thanh Thực.
                            </span>
                        </h1>
                        <p style={S.heroSub}>Khám phá thế giới tai nghe Hi-Res đỉnh cao. Ưu đãi giảm tới <strong style={{ color: '#f472b6' }}>50%</strong> dành riêng cho VIP Member.</p>
                        <div style={S.heroBtns}>
                            <button style={S.heroBtn1}
                                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 30px rgba(124,58,237,.5)'; }}
                                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
                            >Khám phá ngay</button>
                            <button style={S.heroBtn2}>Xem ưu đãi</button>
                        </div>
                    </div>
                </div>

                {/* PROMO BANNER CARDS */}
                <div style={S.promoCards}>
                    {[
                        { g: '#7c3aed,#4f46e5', tag: 'HOT DEAL', title: 'Siêu Sale VIP', desc: 'Giảm thêm 10% cho mọi đơn hàng tai nghe Sony & Bose.', code: 'VIPSONY' },
                        { g: '#0891b2,#0284c7', tag: 'NEW IN', title: 'Hàng Mới Về', desc: 'BST Apple AirPods Max màu mới – Freeship toàn quốc.', code: 'FREESHIP' },
                        { g: '#d97706,#b45309', tag: 'POINTS', title: 'Điểm Thưởng X2', desc: 'Nhân đôi điểm tích lũy cho thành viên hạng Gold tháng này.', code: 'X2POINTS' },
                    ].map((c, i) => (
                        <div key={i} style={S.promoCard(c.g)}>
                            <div style={{ position: 'absolute', right: -20, top: -20, width: 100, height: 100, background: 'rgba(255,255,255,.08)', borderRadius: '50%' }} />
                            <span style={S.promoTag}>{c.tag}</span>
                            <h3 style={S.promoTitle}>{c.title}</h3>
                            <p style={S.promoDesc}>{c.desc}</p>
                            <span style={S.promoCode}>{c.code}</span>
                        </div>
                    ))}
                </div>

                {/* MEMBER INFO */}
                <div style={S.memberCard}>
                    <div style={S.memberInfo}>
                        <div style={{ fontSize: 12, color: 'rgba(255,255,255,.6)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 6 }}>Thông Tin Thành Viên</div>
                        <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 4 }}>{auth.user.name || auth.user.email}</div>
                        <div style={{ color: 'rgba(255,255,255,.7)', fontSize: 14 }}>📧 {auth.user.email}</div>
                        <div style={{ color: 'rgba(255,255,255,.7)', fontSize: 14, marginTop: 4 }}>🎖 Vai trò: <strong>{auth.user.role || 'USER'}</strong></div>
                    </div>
                    <div style={S.memberPills}>
                        {['Tích điểm 2%', 'Ưu đãi sinh nhật', 'Hỗ trợ 24/7', 'Freeship đơn > 500k'].map(t => (
                            <span key={t} style={S.memberPill}>{t}</span>
                        ))}
                    </div>
                </div>

                {/* PROMO PRODUCTS */}
                {promoProducts.length > 0 && (
                    <div style={S.section}>
                        <SectionHeader title="🔥 Ưu Đãi Khuyến Mãi" sub="Giá tốt nhất – Số lượng có hạn!" accent="#f472b6" />
                        <div style={S.grid4}>
                            {promoProducts.map(p => (
                                <ProductCard key={p._id} product={p} badge="SALE" badgeColor="#e11d48" onDetail={() => navigate(`/product/${p._id}`)} />
                            ))}
                        </div>
                    </div>
                )}

                {/* NEW ARRIVALS */}
                <div style={S.section}>
                    <SectionHeader title="✨ Sản Phẩm Mới Nhất" sub="Cập nhật xu hướng âm thanh mới nhất" accent="#a78bfa" />
                    {loading ? (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 20 }}>
                            {[...Array(4)].map((_, i) => (
                                <div key={i} style={{ background: '#1e293b', borderRadius: 16, overflow: 'hidden', border: '1px solid #334155' }}>
                                    <div style={{ aspectRatio: '1/1', background: 'linear-gradient(90deg,#1e293b,#334155,#1e293b)', backgroundSize: '200%', animation: 'shimmer 1.5s infinite' }} />
                                    <div style={{ padding: 16 }}>
                                        <div style={{ height: 12, background: '#334155', borderRadius: 6, marginBottom: 8 }} />
                                        <div style={{ height: 20, background: '#334155', borderRadius: 6, width: '70%' }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : newProducts.length > 0 ? (
                        <div style={S.grid4}>
                            {newProducts.map(p => (
                                <ProductCard key={p._id} product={p} badge="NEW" badgeColor="#0891b2" onDetail={() => navigate(`/product/${p._id}`)} />
                            ))}
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', color: '#64748b', padding: '60px 0', background: '#1e293b', borderRadius: 16, border: '1px solid #334155' }}>
                            <div style={{ fontSize: 48, marginBottom: 12 }}>📦</div>
                            <p style={{ margin: 0, fontSize: 16 }}>Chưa có sản phẩm mới</p>
                        </div>
                    )}
                </div>

                {/* BEST SELLERS */}
                <div style={S.section}>
                    <SectionHeader title="🏆 Bán Chạy Nhất" sub="Được tin dùng bởi hàng nghìn khách hàng" accent="#f59e0b" />
                    {loading ? (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 20 }}>
                            {[...Array(4)].map((_, i) => (
                                <div key={i} style={{ background: '#1e293b', borderRadius: 16, border: '1px solid #334155', height: 300 }} />
                            ))}
                        </div>
                    ) : bestSellers.length > 0 ? (
                        <div style={S.grid4}>
                            {bestSellers.map(p => (
                                <ProductCard key={p._id} product={p} badge="HOT" badgeColor="#d97706" onDetail={() => navigate(`/product/${p._id}`)} formatSold={formatSold} />
                            ))}
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', color: '#64748b', padding: '60px 0', background: '#1e293b', borderRadius: 16, border: '1px solid #334155' }}>
                            <div style={{ fontSize: 48, marginBottom: 12 }}>🏆</div>
                            <p style={{ margin: 0 }}>Chưa có dữ liệu bán chạy</p>
                        </div>
                    )}
                </div>

            </main>

            {/* FOOTER */}
            <footer style={{ borderTop: '1px solid #1e293b', padding: '32px 24px', textAlign: 'center', color: '#475569', fontSize: 14 }}>
                <p style={{ margin: 0 }}>© 2026 <strong style={{ color: '#a78bfa' }}>TechZone Premium</strong> — Thế Giới Tai Nghe Đỉnh Cao</p>
            </footer>
        </div>
    );
};

export default HomePage;
