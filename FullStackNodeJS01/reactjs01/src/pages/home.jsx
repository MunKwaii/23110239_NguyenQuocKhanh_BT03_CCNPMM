import { useContext } from 'react';
import { AuthContext } from '../components/context/auth.context';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
    const { auth, setAuth } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("access_token");
        setAuth({
            isAuthenticated: false,
            user: {
                email: "",
                name: "",
                role: ""
            }
        });
        navigate("/login");
    };

    const isMember = auth.isAuthenticated && (auth.user.role || "USER") === "USER";

    if (!auth.isAuthenticated) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="text-center p-10 bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-lg w-full transform transition-all hover:scale-105">
                    <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-6">
                        Chào mừng đến với TechZone
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300 text-lg mb-8">
                        Vui lòng đăng nhập để xem các ưu đãi đặc quyền, sản phẩm mới nhất và mua sắm thả ga!
                    </p>
                    <button 
                        onClick={() => navigate('/login')}
                        className="px-8 py-4 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-full font-bold text-lg shadow-lg hover:shadow-indigo-500/30 transition-all hover:-translate-y-1"
                    >
                        Đăng nhập ngay
                    </button>
                </div>
            </div>
        );
    }

    if (!isMember) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="text-center p-10 bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-lg w-full">
                    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-4">
                        Tài khoản chưa có quyền thành viên
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                        Vui lòng đăng nhập bằng tài khoản thành viên để xem trang chủ bán tai nghe và các ưu đãi đặc biệt.
                    </p>
                    <button
                        onClick={handleLogout}
                        className="px-6 py-3 rounded-full bg-amber-600 text-white font-semibold hover:bg-amber-700 transition-colors"
                    >
                        Đăng xuất
                    </button>
                </div>
            </div>
        );
    }

    const newProducts = [
        { id: 1, name: 'Sony WH-1000XM5', price: '8.490.000đ', image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&q=80&w=800', tag: 'Mới' },
        { id: 2, name: 'Apple AirPods Pro 2', price: '6.190.000đ', image: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&q=80&w=800', tag: 'Mới' },
        { id: 3, name: 'Bose QuietComfort Ultra', price: '9.990.000đ', image: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&q=80&w=800', tag: 'Mới' },
        { id: 4, name: 'Sennheiser Momentum 4', price: '7.990.000đ', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800', tag: 'Mới' },
    ];

    const bestSellers = [
        { id: 5, name: 'JBL Tune 770NC', price: '2.790.000đ', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800', sold: '1.9k' },
        { id: 6, name: 'Beats Studio Pro', price: '7.490.000đ', image: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&q=80&w=800', sold: '1.3k' },
        { id: 7, name: 'Soundcore Space One', price: '2.190.000đ', image: 'https://images.unsplash.com/photo-1471478331149-c72f17e33c73?auto=format&fit=crop&q=80&w=800', sold: '1.1k' },
        { id: 8, name: 'Sony LinkBuds S', price: '3.790.000đ', image: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&q=80&w=800', sold: '950' },
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 font-sans">
            {/* Header Dashboard Info */}
            <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-100 dark:border-gray-700 p-6 flex flex-col md:flex-row justify-between items-center sticky top-0 z-50 backdrop-blur-md bg-opacity-80 dark:bg-opacity-80">
                <div className="flex items-center gap-4 mb-4 md:mb-0">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-white text-xl font-bold shadow-lg">
                        {auth.user.email?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div>
                        <h2 className="text-xl font-bold">Xin chào, {auth.user.name || auth.user.email}!</h2>
                        <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">Vai trò: {auth.user.role || "USER"}</p>
                    </div>
                </div>
                <button 
                    onClick={handleLogout}
                    className="px-6 py-2 rounded-full border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white font-semibold transition-all duration-300"
                >
                    Đăng xuất
                </button>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

                {/* Hero / Promotional Banner */}
                <div className="relative rounded-3xl overflow-hidden shadow-2xl mb-16 group">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-900/90 to-indigo-900/80 z-10"></div>
                    <img src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=2000" alt="Promo Banner" className="w-full h-[400px] object-cover group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute inset-0 z-20 flex flex-col justify-center items-start p-10 md:p-20">
                        <span className="inline-block px-4 py-1 rounded-full bg-pink-500 text-white text-sm font-bold uppercase tracking-wider mb-4 animate-bounce">
                            Siêu Sale Cuối Tuần
                        </span>
                        <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4 leading-tight">
                            Thế Giới Tai Nghe <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-yellow-400">Giảm Đến 50%</span>
                        </h1>
                        <p className="text-lg md:text-xl text-gray-200 max-w-2xl mb-8">
                            Tận hưởng chất âm đỉnh cao với các dòng tai nghe chống ồn và true wireless. Ưu đãi độc quyền chỉ dành riêng cho thành viên!
                        </p>
                        <button className="px-8 py-4 bg-white text-purple-900 rounded-full font-bold text-lg hover:bg-purple-100 hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] transition-all">
                            Săn Deal Ngay
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                    <div className="rounded-2xl bg-white dark:bg-gray-800 shadow-lg p-6 border border-purple-100 dark:border-gray-700">
                        <h3 className="text-lg font-bold mb-2">Khuyến mãi thành viên</h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-4">Giảm thêm 10% cho tai nghe chống ồn và freeship toàn quốc.</p>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-sm font-semibold">
                            Mã: VIPAUDIO
                        </div>
                    </div>
                    <div className="rounded-2xl bg-white dark:bg-gray-800 shadow-lg p-6 border border-pink-100 dark:border-gray-700">
                        <h3 className="text-lg font-bold mb-2">Ưu đãi mới nhất</h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-4">Đổi điểm lấy quà tặng: case tai nghe, túi chống sốc.</p>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-100 text-pink-700 text-sm font-semibold">
                            Hạn: 31/05
                        </div>
                    </div>
                    <div className="rounded-2xl bg-white dark:bg-gray-800 shadow-lg p-6 border border-amber-100 dark:border-gray-700">
                        <h3 className="text-lg font-bold mb-2">Bán chạy tuần này</h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-4">Top 3 tai nghe bán chạy kèm bảo hành 24 tháng.</p>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-sm font-semibold">
                            Bảo hành 24 tháng
                        </div>
                    </div>
                </div>

                <div className="mb-16 rounded-3xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-8 shadow-xl">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                        <div>
                            <h3 className="text-2xl font-bold mb-2">Thông tin thành viên</h3>
                            <p className="text-purple-100">Email: {auth.user.email || "-"}</p>
                            <p className="text-purple-100">Vai trò: {auth.user.role || "USER"}</p>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <span className="px-4 py-2 rounded-full bg-white/20 text-sm font-semibold">Tích điểm 2%</span>
                            <span className="px-4 py-2 rounded-full bg-white/20 text-sm font-semibold">Ưu đãi sinh nhật</span>
                            <span className="px-4 py-2 rounded-full bg-white/20 text-sm font-semibold">Hỗ trợ 24/7</span>
                        </div>
                    </div>
                </div>

                {/* New Arrivals Section */}
                <div className="mb-16">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-3xl font-bold relative inline-block">
                            Sản Phẩm Mới Nhất
                            <span className="absolute bottom-0 left-0 w-1/2 h-1 bg-purple-500 rounded-full"></span>
                        </h2>
                        <a href="#" className="text-purple-600 hover:text-purple-800 font-medium flex items-center gap-2 group transition-colors">
                            Xem tất cả 
                            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                        </a>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {newProducts.map((product) => (
                            <div key={product.id} className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-lg hover:shadow-2xl transition-all duration-300 group flex flex-col">
                                <div className="relative rounded-xl overflow-hidden mb-4 bg-gray-100 dark:bg-gray-700 aspect-square flex-shrink-0">
                                    <span className="absolute top-3 left-3 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full z-10">
                                        {product.tag}
                                    </span>
                                    <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                                        <button className="bg-white text-gray-900 px-6 py-2 rounded-full font-semibold hover:bg-purple-500 hover:text-white transition-colors">
                                            Xem chi tiết
                                        </button>
                                    </div>
                                </div>
                                <h3 className="text-lg font-bold mb-2 line-clamp-1">{product.name}</h3>
                                <div className="mt-auto flex items-center justify-between">
                                    <span className="text-xl font-black text-purple-600 dark:text-purple-400">{product.price}</span>
                                    <button className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center hover:bg-purple-500 hover:text-white transition-colors">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Best Sellers Section */}
                <div className="mb-16">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-3xl font-bold relative inline-block">
                            Bán Chạy Nhất
                            <span className="absolute bottom-0 left-0 w-1/2 h-1 bg-pink-500 rounded-full"></span>
                        </h2>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {bestSellers.map((product) => (
                            <div key={product.id} className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-transparent hover:border-pink-200 dark:hover:border-pink-900 group">
                                <div className="h-48 overflow-hidden relative">
                                    <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold text-gray-800 flex items-center gap-1 shadow">
                                        <svg className="w-3 h-3 text-yellow-500" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                                        Đã bán {product.sold}
                                    </div>
                                </div>
                                <div className="p-5">
                                    <h3 className="text-lg font-bold mb-1 truncate">{product.name}</h3>
                                    <p className="text-pink-600 dark:text-pink-400 font-extrabold text-xl mb-4">{product.price}</p>
                                    <button className="w-full py-2.5 rounded-xl bg-gray-900 dark:bg-gray-700 text-white font-semibold group-hover:bg-pink-500 transition-colors">
                                        Thêm vào giỏ hàng
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default HomePage;