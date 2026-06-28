import { useContext, useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../components/context/auth.context';
import { getProductsApi, getFilterMetaApi } from '../util/api';

const fmt = (v) => (v != null ? new Intl.NumberFormat('vi-VN').format(v) + 'đ' : '');
const fmtSold = (v) => (!v && v !== 0 ? '0' : v >= 1000 ? (v / 1000).toFixed(1).replace('.0', '') + 'k' : String(v));

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

/* ─── Category Tab Pill ─────────────────────────────────────────── */
const CategoryTab = ({ label, count, active, onClick }) => (
    <button onClick={onClick} style={{
        padding: '12px 24px', borderRadius: '14px', fontSize: 14, fontWeight: 700, cursor: 'pointer', transition: 'all .25s ease',
        background: active ? 'linear-gradient(135deg,#7c3aed,#4f46e5)' : '#1e293b',
        color: active ? '#fff' : '#94a3b8',
        border: active ? '1px solid #7c3aed' : '1px solid #334155',
        boxShadow: active ? '0 8px 20px rgba(124,58,237,.3)' : 'none',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        outline: 'none',
    }}
    onMouseEnter={e => {
        if (!active) {
            e.currentTarget.style.borderColor = '#7c3aed';
            e.currentTarget.style.color = '#fff';
            e.currentTarget.style.background = '#24324d';
        }
    }}
    onMouseLeave={e => {
        if (!active) {
            e.currentTarget.style.borderColor = '#334155';
            e.currentTarget.style.color = '#94a3b8';
            e.currentTarget.style.background = '#1e293b';
        }
    }}
    >
        <span>{label === 'all' ? '📦 Tất cả' : label === 'headphones' ? '🎧 Headphones' : label === 'earbuds' ? '💎 Earbuds' : label === 'speakers' ? '🔊 Speakers' : label}</span>
        {count !== undefined && (
            <span style={{
                background: active ? 'rgba(255,255,255,.2)' : '#0f172a',
                color: active ? '#fff' : '#a78bfa',
                fontSize: 11,
                padding: '2px 8px',
                borderRadius: 8,
            }}>{count}</span>
        )}
    </button>
);

const CategoriesPage = () => {
    const { auth, setAuth } = useContext(AuthContext);
    const navigate = useNavigate();

    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [products, setProducts] = useState([]);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    const observer = useRef();
    const isMember = auth.isAuthenticated && (auth.user.role || 'USER') === 'USER';

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        setAuth({ isAuthenticated: false, user: { email: '', name: '', role: '' } });
        navigate('/login');
    };

    // 1. Fetch categories meta
    useEffect(() => {
        if (!isMember) return;
        getFilterMetaApi().then(res => {
            if (res && !res.message) {
                setCategories(res.categories || []);
            }
        });
    }, [isMember]);

    // 2. Fetch products by category & page
    const fetchProducts = useCallback(async (cat, currentPage, append = false) => {
        if (!isMember) return;
        if (currentPage === 1) setLoading(true);
        else setLoadingMore(true);

        try {
            const limit = 4; // Fetch in small chunks to easily test scroll lazy-loading
            const res = await getProductsApi(undefined, limit, {
                category: cat !== 'all' ? cat : undefined,
                page: currentPage,
                sortBy: 'newest' // show newest first
            });

            const fetchedProducts = res?.products || [];
            const totalProducts = res?.total || 0;

            if (append) {
                setProducts(prev => {
                    // Prevent duplicate products just in case
                    const existingIds = new Set(prev.map(p => p._id));
                    const filteredNew = fetchedProducts.filter(p => !existingIds.has(p._id));
                    const nextList = [...prev, ...filteredNew];
                    setHasMore(nextList.length < totalProducts);
                    return nextList;
                });
            } else {
                setProducts(fetchedProducts);
                setHasMore(fetchedProducts.length < totalProducts);
            }

            setTotal(totalProducts);
        } catch (err) {
            console.error('Error loading products:', err);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [isMember]);

    // Trigger initial fetch when selected category changes
    useEffect(() => {
        setPage(1);
        setHasMore(true);
        fetchProducts(selectedCategory, 1, false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedCategory]);

    // Intersection observer target callback (for trigger loading more)
    const lastProductElementRef = useCallback(node => {
        if (loading || loadingMore) return;
        if (observer.current) observer.current.disconnect();

        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                setPage(prevPage => {
                    const nextPage = prevPage + 1;
                    fetchProducts(selectedCategory, nextPage, true);
                    return nextPage;
                });
            }
        }, { threshold: 0.8 });

        if (node) observer.current.observe(node);
    }, [loading, loadingMore, hasMore, fetchProducts, selectedCategory]);

    // Manual load more helper
    const handleLoadMore = () => {
        if (!hasMore || loadingMore) return;
        setPage(prevPage => {
            const nextPage = prevPage + 1;
            fetchProducts(selectedCategory, nextPage, true);
            return nextPage;
        });
    };

    const S = {
        page: { minHeight: '100vh', background: '#0f172a', color: '#f1f5f9', fontFamily: "'Inter', system-ui, sans-serif" },
        nav: { position: 'sticky', top: 0, zIndex: 100, background: 'rgba(15,23,42,.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #1e293b', padding: '0 24px' },
        navInner: { maxWidth: 1280, margin: '0 auto', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
        main: { maxWidth: 1280, margin: '0 auto', padding: '40px 24px' },
        hero: {
            background: 'linear-gradient(135deg, rgba(124,58,237,0.15) 0%, rgba(236,72,153,0.05) 100%)',
            border: '1px solid rgba(124,58,237,0.2)',
            borderRadius: 24,
            padding: '40px',
            marginBottom: 40,
            textAlign: 'center',
            backdropFilter: 'blur(8px)',
        },
        title: { fontSize: 32, fontWeight: 900, color: '#f8fafc', margin: '0 0 10px' },
        subtitle: { color: '#94a3b8', fontSize: 15, margin: 0 },
        tabContainer: { display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 40 },
        grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 24, marginBottom: 40 },
        footerText: { textAlign: 'center', color: '#64748b', fontSize: 14, margin: '20px 0 4px', fontWeight: 600, letterSpacing: 0.5 }
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
            {/* Main content */}

            <main style={S.main}>
                {/* HERO */}
                <div style={S.hero}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(124,58,237,.2)', border: '1px solid rgba(124,58,237,.4)', color: '#a78bfa', borderRadius: 999, padding: '4px 14px', fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 16 }}>
                        🌈 PHÂN LOẠI SẢN PHẨM
                    </div>
                    <h1 style={S.title}>Khám Phá Theo Danh Mục</h1>
                    <p style={S.subtitle}>Tìm kiếm các thiết bị âm thanh đỉnh cao phù hợp với phong cách của bạn với cơ chế cuộn vô hạn mượt mà.</p>
                </div>

                {/* CATEGORY TABS */}
                <div style={S.tabContainer}>
                    <CategoryTab label="all" active={selectedCategory === 'all'} onClick={() => setSelectedCategory('all')} />
                    {categories.map(cat => (
                        <CategoryTab key={cat} label={cat} active={selectedCategory === cat} onClick={() => setSelectedCategory(cat)} />
                    ))}
                </div>

                {/* PRODUCTS LIST */}
                {loading && page === 1 ? (
                    /* Initial Loading Skeleton */
                    <div style={S.grid}>
                        {[...Array(4)].map((_, i) => (
                            <div key={i} style={{ background: '#1e293b', borderRadius: 16, overflow: 'hidden', border: '1px solid #334155', height: 320, opacity: 0.6 }}>
                                <div style={{ aspectRatio: '1/1', background: '#0f172a' }} />
                                <div style={{ padding: 16 }}>
                                    <div style={{ height: 12, background: '#334155', borderRadius: 6, marginBottom: 8, width: '40%' }} />
                                    <div style={{ height: 16, background: '#334155', borderRadius: 6, marginBottom: 8 }} />
                                    <div style={{ height: 16, background: '#334155', borderRadius: 6, width: '60%' }} />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : products.length > 0 ? (
                    <>
                        <div style={S.grid}>
                            {products.map((p, index) => {
                                // Assign our intersection ref to the last item in the list
                                const isLast = index === products.length - 1;
                                return (
                                    <div key={p._id} ref={isLast ? lastProductElementRef : null}>
                                        <ProductCard product={p} onClick={() => navigate(`/product/${p._id}`)} />
                                    </div>
                                );
                            })}
                        </div>

                        {/* Infinite Loading Status / Load More Fallback */}
                        {loadingMore && (
                            <div style={{ display: 'flex', justifyContent: 'center', padding: '20px 0', marginBottom: 20 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#1e293b', border: '1px solid #334155', padding: '10px 24px', borderRadius: 999 }}>
                                    <span className="spinner" style={{
                                        width: 18, height: 18, border: '2px solid #7c3aed', borderTopColor: 'transparent', borderRadius: '50%',
                                        animation: 'spin 0.8s linear infinite', display: 'inline-block'
                                    }} />
                                    <span style={{ fontSize: 13, color: '#94a3b8', fontWeight: 600 }}>Đang tải thêm sản phẩm...</span>
                                </div>
                                <style>{`
                                    @keyframes spin {
                                        to { transform: rotate(360deg); }
                                    }
                                `}</style>
                            </div>
                        )}

                        {!loadingMore && hasMore && (
                            <div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0 40px' }}>
                                <button onClick={handleLoadMore} style={{
                                    padding: '12px 30px', background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.3)',
                                    color: '#a78bfa', borderRadius: 12, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s', fontSize: 14
                                }}
                                onMouseEnter={e => { e.currentTarget.style.background = '#7c3aed'; e.currentTarget.style.color = '#fff'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(124,58,237,0.1)'; e.currentTarget.style.color = '#a78bfa'; }}
                                >
                                    Tải thêm sản phẩm 🫵
                                </button>
                            </div>
                        )}

                        {!hasMore && (
                            <div style={{ padding: '20px 0 40px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <div style={S.footerText}>✨ Bạn đã xem hết tất cả {total} sản phẩm của danh mục này! ✨</div>
                                <div style={{ width: 60, height: 3, background: 'linear-gradient(90deg,#7c3aed,#ec4899)', borderRadius: 999, marginTop: 10 }} />
                            </div>
                        )}
                    </>
                ) : (
                    /* Empty state */
                    <div style={{ textAlign: 'center', padding: '80px 20px', background: '#1e293b', borderRadius: 20, border: '1px solid #334155' }}>
                        <div style={{ fontSize: 64, marginBottom: 16 }}>📦</div>
                        <h3 style={{ color: '#f8fafc', margin: '0 0 8px' }}>Chưa có sản phẩm nào</h3>
                        <p style={{ color: '#64748b', margin: 0 }}>Vui lòng quay lại sau.</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default CategoriesPage;
