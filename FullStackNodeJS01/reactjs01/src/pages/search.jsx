import { useContext, useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../components/context/auth.context';
import { getProductsApi, getFilterMetaApi } from '../util/api';

const fmt = (v) => (v != null ? new Intl.NumberFormat('vi-VN').format(v) + 'đ' : '');
const fmtSold = (v) => (!v && v !== 0 ? '0' : v >= 1000 ? (v / 1000).toFixed(1).replace('.0', '') + 'k' : String(v));

const SORT_OPTIONS = [
    { value: 'best_seller', label: '🔥 Bán chạy nhất' },
    { value: 'newest', label: '✨ Mới nhất' },
    { value: 'price_asc', label: '💰 Giá thấp → cao' },
    { value: 'price_desc', label: '💎 Giá cao → thấp' },
    { value: 'rating', label: '⭐ Đánh giá cao' },
];

const PRICE_RANGES = [
    { label: 'Tất cả', min: '', max: '' },
    { label: 'Dưới 2 triệu', min: '', max: '2000000' },
    { label: '2 – 5 triệu', min: '2000000', max: '5000000' },
    { label: '5 – 10 triệu', min: '5000000', max: '10000000' },
    { label: 'Trên 10 triệu', min: '10000000', max: '' },
];

/* ─── Product Card ──────────────────────────────────────────────── */
const ProductCard = ({ product, onClick }) => {
    const discount = product.salePrice ? Math.round((1 - product.salePrice / product.price) * 100) : 0;
    return (
        <div onClick={onClick}
            style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 16, overflow: 'hidden', cursor: 'pointer', transition: 'transform .25s, box-shadow .25s' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 16px 35px rgba(124,58,237,.2)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
        >
            <div style={{ position: 'relative', aspectRatio: '1/1', background: '#0f172a', overflow: 'hidden' }}>
                <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform .5s' }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.08)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                />
                <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', flexDirection: 'column', gap: 5 }}>
                    {product.isNewProduct && <span style={{ background: '#0891b2', color: '#fff', fontSize: 9, fontWeight: 800, padding: '2px 8px', borderRadius: 999, textTransform: 'uppercase', letterSpacing: 1 }}>NEW</span>}
                    {product.isBestSeller && <span style={{ background: '#d97706', color: '#fff', fontSize: 9, fontWeight: 800, padding: '2px 8px', borderRadius: 999, textTransform: 'uppercase', letterSpacing: 1 }}>HOT</span>}
                    {discount > 0 && <span style={{ background: '#e11d48', color: '#fff', fontSize: 9, fontWeight: 800, padding: '2px 8px', borderRadius: 999 }}>-{discount}%</span>}
                </div>
                {product.stock === 0 && (
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ color: '#f87171', fontWeight: 800, fontSize: 14, letterSpacing: 1 }}>HẾT HÀNG</span>
                    </div>
                )}
            </div>
            <div style={{ padding: '14px 16px 16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 11, color: '#a78bfa', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>{product.brand}</span>
                    <span style={{ fontSize: 10, color: '#64748b' }}>Đã bán {fmtSold(product.sold)}</span>
                </div>
                <p style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 14, margin: '0 0 10px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{product.name}</p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                        <div style={{ color: '#fff', fontWeight: 900, fontSize: 16 }}>{fmt(product.salePrice || product.price)}</div>
                        {product.salePrice && <div style={{ color: '#64748b', fontSize: 12, textDecoration: 'line-through' }}>{fmt(product.price)}</div>}
                    </div>
                    <div style={{ background: '#7c3aed', borderRadius: 10, width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 18, fontWeight: 300 }}>+</div>
                </div>
            </div>
        </div>
    );
};

/* ─── Filter Pill ───────────────────────────────────────────────── */
const FilterPill = ({ label, active, onClick }) => (
    <button onClick={onClick} style={{
        padding: '6px 14px', borderRadius: 999, fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all .2s',
        background: active ? '#7c3aed' : '#1e293b',
        color: active ? '#fff' : '#94a3b8',
        border: active ? '1px solid #7c3aed' : '1px solid #334155',
    }}>
        {label}
    </button>
);

/* ─── Main Page ─────────────────────────────────────────────────── */
const SearchPage = () => {
    const { auth, setAuth } = useContext(AuthContext);
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const [searchText, setSearchText] = useState(searchParams.get('q') || '');
    const [inputVal, setInputVal] = useState(searchParams.get('q') || '');
    const [category, setCategory] = useState(searchParams.get('category') || 'all');
    const [brand, setBrand] = useState(searchParams.get('brand') || 'all');
    const [priceRange, setPriceRange] = useState(0);
    const [sortBy, setSortBy] = useState('best_seller');
    const [onlyPromo, setOnlyPromo] = useState(false);
    const [onlyNew, setOnlyNew] = useState(false);
    const [onlyBest, setOnlyBest] = useState(false);

    const [products, setProducts] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [meta, setMeta] = useState({ brands: [], categories: [] });

    const isMember = auth.isAuthenticated && (auth.user.role || 'USER') === 'USER';
    const debounceRef = useRef(null);

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        setAuth({ isAuthenticated: false, user: { email: '', name: '', role: '' } });
        navigate('/login');
    };

    // Load filter meta (brands, categories) once
    useEffect(() => {
        if (!isMember) return;
        getFilterMetaApi().then(res => {
            if (res && !res.message) setMeta(res);
        });
    }, [isMember]);

    // Search function
    const doSearch = useCallback(async () => {
        if (!isMember) return;
        setLoading(true);
        const pr = PRICE_RANGES[priceRange];
        let filter = '';
        if (onlyNew) filter = 'new';
        else if (onlyBest) filter = 'best';
        else if (onlyPromo) filter = 'promo';

        try {
            const res = await getProductsApi(filter || undefined, 50, {
                search: searchText || undefined,
                category: category !== 'all' ? category : undefined,
                brand: brand !== 'all' ? brand : undefined,
                minPrice: pr.min || undefined,
                maxPrice: pr.max || undefined,
                sortBy,
            });
            // Handle both array (old) and {products, total} (new) response
            if (Array.isArray(res)) {
                setProducts(res);
                setTotal(res.length);
            } else if (res?.products) {
                setProducts(res.products);
                setTotal(res.total);
            } else {
                setProducts([]);
                setTotal(0);
            }
        } finally {
            setLoading(false);
        }
    }, [isMember, searchText, category, brand, priceRange, sortBy, onlyPromo, onlyNew, onlyBest]);

    useEffect(() => {
        doSearch();
    }, [doSearch]);

    // Debounce input
    const handleInputChange = (e) => {
        setInputVal(e.target.value);
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => setSearchText(e.target.value), 400);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        clearTimeout(debounceRef.current);
        setSearchText(inputVal);
    };

    const resetFilters = () => {
        setSearchText(''); setInputVal('');
        setCategory('all'); setBrand('all');
        setPriceRange(0); setSortBy('best_seller');
        setOnlyPromo(false); setOnlyNew(false); setOnlyBest(false);
    };

    const S = {
        page: { minHeight: '100vh', background: '#0f172a', color: '#f1f5f9', fontFamily: "'Inter', system-ui, sans-serif" },
        nav: { position: 'sticky', top: 0, zIndex: 100, background: 'rgba(15,23,42,.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #1e293b', padding: '0 24px' },
        navInner: { maxWidth: 1280, margin: '0 auto', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
        main: { maxWidth: 1280, margin: '0 auto', padding: '32px 24px', display: 'grid', gridTemplateColumns: '280px 1fr', gap: 28, alignItems: 'start' },
        sidebar: { background: '#1e293b', borderRadius: 18, padding: 24, border: '1px solid #334155', position: 'sticky', top: 80 },
        sectionTitle: { color: '#f1f5f9', fontWeight: 800, fontSize: 13, textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 12px' },
        divider: { border: 'none', borderTop: '1px solid #334155', margin: '20px 0' },
        select: { width: '100%', padding: '10px 14px', background: '#0f172a', border: '1px solid #334155', borderRadius: 10, color: '#f1f5f9', fontSize: 14, outline: 'none', cursor: 'pointer' },
    };

    if (!auth.isAuthenticated) return (
        <div style={{ ...S.page, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center', background: '#1e293b', border: '1px solid #334155', borderRadius: 24, padding: 60, maxWidth: 400 }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
                <h2 style={{ color: '#f8fafc', margin: '0 0 24px' }}>Vui lòng đăng nhập</h2>
                <button onClick={() => navigate('/login')} style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', color: '#fff', border: 'none', borderRadius: 12, padding: '12px 32px', fontWeight: 700, cursor: 'pointer' }}>Đăng nhập</button>
            </div>
        </div>
    );

    return (
        <div style={S.page}>
            {/* Breadcrumbs */}
            <div style={{ maxWidth: 1280, margin: '0 auto', padding: '20px 24px 0', display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: '#64748b' }}>
                <span onClick={() => navigate('/')} style={{ cursor: 'pointer', color: '#a78bfa', fontWeight: 600 }}
                    onMouseEnter={e => e.currentTarget.style.color = '#c084fc'}
                    onMouseLeave={e => e.currentTarget.style.color = '#a78bfa'}
                >🎧 TechZone</span>
                <span>›</span>
                <span style={{ color: '#f1f5f9', fontWeight: 600 }}>Tìm kiếm & Lọc</span>
            </div>

            {/* SEARCH BAR */}
            <div style={{ background: '#1e293b', borderBottom: '1px solid #334155', padding: '20px 24px' }}>
                <div style={{ maxWidth: 1280, margin: '0 auto' }}>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 12, maxWidth: 700 }}>
                        <div style={{ flex: 1, position: 'relative' }}>
                            <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', fontSize: 18, color: '#64748b' }}>🔍</span>
                            <input
                                value={inputVal}
                                onChange={handleInputChange}
                                placeholder="Tìm theo tên, hãng, mô tả..."
                                style={{ width: '100%', paddingLeft: 48, paddingRight: 20, paddingTop: 14, paddingBottom: 14, background: '#0f172a', border: '1px solid #334155', borderRadius: 14, color: '#f1f5f9', fontSize: 15, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
                                onFocus={e => e.target.style.borderColor = '#7c3aed'}
                                onBlur={e => e.target.style.borderColor = '#334155'}
                            />
                        </div>
                        <button type="submit" style={{ padding: '14px 28px', background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', color: '#fff', border: 'none', borderRadius: 14, fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
                            Tìm kiếm
                        </button>
                    </form>
                </div>
            </div>

            <div style={S.main}>
                {/* SIDEBAR */}
                <aside style={S.sidebar}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                        <span style={{ color: '#f1f5f9', fontWeight: 800, fontSize: 15 }}>⚙️ Bộ lọc</span>
                        <button onClick={resetFilters} style={{ background: 'none', border: 'none', color: '#a78bfa', fontSize: 12, cursor: 'pointer', fontWeight: 700 }}>Xóa tất cả</button>
                    </div>

                    {/* Tag filters */}
                    <p style={S.sectionTitle}>Loại sản phẩm</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 8 }}>
                        <FilterPill label="🔥 Đang giảm giá" active={onlyPromo} onClick={() => { setOnlyPromo(!onlyPromo); setOnlyNew(false); setOnlyBest(false); }} />
                        <FilterPill label="✨ Hàng mới về" active={onlyNew} onClick={() => { setOnlyNew(!onlyNew); setOnlyPromo(false); setOnlyBest(false); }} />
                        <FilterPill label="🏆 Bán chạy nhất" active={onlyBest} onClick={() => { setOnlyBest(!onlyBest); setOnlyPromo(false); setOnlyNew(false); }} />
                    </div>
                    <hr style={S.divider} />

                    {/* Category */}
                    <p style={S.sectionTitle}>Danh mục</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 8 }}>
                        <FilterPill label="Tất cả" active={category === 'all'} onClick={() => setCategory('all')} />
                        {meta.categories.map(c => (
                            <FilterPill key={c} label={c} active={category === c} onClick={() => setCategory(c)} />
                        ))}
                    </div>
                    <hr style={S.divider} />

                    {/* Brand */}
                    <p style={S.sectionTitle}>Thương hiệu</p>
                    <select value={brand} onChange={e => setBrand(e.target.value)} style={S.select}>
                        <option value="all">Tất cả thương hiệu</option>
                        {meta.brands.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                    <hr style={S.divider} />

                    {/* Price range */}
                    <p style={S.sectionTitle}>Khoảng giá</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {PRICE_RANGES.map((pr, i) => (
                            <FilterPill key={i} label={pr.label} active={priceRange === i} onClick={() => setPriceRange(i)} />
                        ))}
                    </div>
                    <hr style={S.divider} />

                    {/* Sort */}
                    <p style={S.sectionTitle}>Sắp xếp theo</p>
                    <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={S.select}>
                        {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                </aside>

                {/* RESULTS */}
                <div>
                    {/* Result header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                        <div>
                            <h1 style={{ color: '#f8fafc', fontSize: 22, fontWeight: 900, margin: 0 }}>
                                {searchText ? `Kết quả cho "${searchText}"` : 'Tất cả sản phẩm'}
                            </h1>
                            <p style={{ color: '#64748b', fontSize: 13, margin: '4px 0 0' }}>
                                {loading ? 'Đang tìm...' : `Tìm thấy ${total} sản phẩm`}
                            </p>
                        </div>
                    </div>

                    {/* Active filter chips */}
                    {(searchText || category !== 'all' || brand !== 'all' || priceRange > 0 || onlyPromo || onlyNew || onlyBest) && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
                            {searchText && <span style={{ background: '#7c3aed', color: '#fff', borderRadius: 999, padding: '4px 12px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                                🔍 {searchText}
                                <button onClick={() => { setSearchText(''); setInputVal(''); }} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: 0, fontSize: 14 }}>×</button>
                            </span>}
                            {category !== 'all' && <span style={{ background: '#0891b2', color: '#fff', borderRadius: 999, padding: '4px 12px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                                📁 {category}
                                <button onClick={() => setCategory('all')} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: 0, fontSize: 14 }}>×</button>
                            </span>}
                            {brand !== 'all' && <span style={{ background: '#d97706', color: '#fff', borderRadius: 999, padding: '4px 12px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                                🏷 {brand}
                                <button onClick={() => setBrand('all')} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: 0, fontSize: 14 }}>×</button>
                            </span>}
                            {priceRange > 0 && <span style={{ background: '#16a34a', color: '#fff', borderRadius: 999, padding: '4px 12px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                                💰 {PRICE_RANGES[priceRange].label}
                                <button onClick={() => setPriceRange(0)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: 0, fontSize: 14 }}>×</button>
                            </span>}
                        </div>
                    )}

                    {/* Grid */}
                    {loading ? (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 20 }}>
                            {[...Array(8)].map((_, i) => (
                                <div key={i} style={{ background: '#1e293b', borderRadius: 16, overflow: 'hidden', border: '1px solid #334155' }}>
                                    <div style={{ aspectRatio: '1/1', background: '#334155' }} />
                                    <div style={{ padding: 16 }}>
                                        <div style={{ height: 10, background: '#334155', borderRadius: 4, marginBottom: 8, width: '60%' }} />
                                        <div style={{ height: 14, background: '#334155', borderRadius: 4, marginBottom: 6 }} />
                                        <div style={{ height: 14, background: '#334155', borderRadius: 4, width: '80%' }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : products.length > 0 ? (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 20 }}>
                            {products.map(p => (
                                <ProductCard key={p._id} product={p} onClick={() => navigate(`/product/${p._id}`)} />
                            ))}
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '80px 20px', background: '#1e293b', borderRadius: 20, border: '1px solid #334155' }}>
                            <div style={{ fontSize: 64, marginBottom: 16 }}>🔎</div>
                            <h3 style={{ color: '#f8fafc', margin: '0 0 8px' }}>Không tìm thấy kết quả</h3>
                            <p style={{ color: '#64748b', margin: '0 0 24px' }}>Thử thay đổi từ khóa hoặc bộ lọc.</p>
                            <button onClick={resetFilters} style={{ background: '#7c3aed', color: '#fff', border: 'none', borderRadius: 12, padding: '10px 24px', cursor: 'pointer', fontWeight: 700 }}>Xóa bộ lọc</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SearchPage;
