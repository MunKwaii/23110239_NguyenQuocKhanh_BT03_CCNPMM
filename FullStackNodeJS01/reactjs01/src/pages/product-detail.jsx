import { useContext, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AuthContext } from '../components/context/auth.context';
import { getProductByIdApi, getSimilarProductsApi } from '../util/api';

const ProductDetailPage = () => {
    const { auth, setAuth } = useContext(AuthContext);
    const navigate = useNavigate();
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [similarProducts, setSimilarProducts] = useState([]);
    const [activeImage, setActiveImage] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [isLoading, setIsLoading] = useState(true);

    const isMember = auth.isAuthenticated && (auth.user.role || 'USER') === 'USER';

    useEffect(() => {
        if (!isMember) return;

        const fetchData = async () => {
            setIsLoading(true);
            const [productRes, similarRes] = await Promise.all([
                getProductByIdApi(id),
                getSimilarProductsApi(id, 8)
            ]);

            if (!productRes?.message) {
                setProduct(productRes);
            }

            if (!similarRes?.message) {
                setSimilarProducts(similarRes);
            }

            setIsLoading(false);
        };

        fetchData();
    }, [id, isMember]);

    const images = useMemo(() => {
        if (!product) return [];
        if (product.images?.length) return product.images;
        if (product.image) return [product.image];
        return [];
    }, [product]);

    const formatPrice = (value) => {
        if (!value && value !== 0) return '';
        return new Intl.NumberFormat('vi-VN').format(value) + 'đ';
    };

    const formatSold = (value) => {
        if (!value && value !== 0) return '0';
        if (value >= 1000) return (value / 1000).toFixed(1).replace('.0', '') + 'k';
        return value.toString();
    };

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        setAuth({
            isAuthenticated: false,
            user: {
                email: '',
                name: '',
                role: ''
            }
        });
        navigate('/login');
    };

    const handleDecrease = () => {
        setQuantity((prev) => Math.max(prev - 1, 1));
    };

    const handleIncrease = () => {
        const maxStock = product?.stock || 1;
        setQuantity((prev) => Math.min(prev + 1, maxStock));
    };

    if (!auth.isAuthenticated) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="text-center p-10 bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-lg w-full">
                    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-4">
                        Vui lòng đăng nhập
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                        Đăng nhập để xem chi tiết sản phẩm và ưu đãi.
                    </p>
                    <button
                        onClick={() => navigate('/login')}
                        className="px-6 py-3 rounded-full bg-purple-600 text-white font-semibold hover:bg-purple-700 transition-colors"
                    >
                        Đăng nhập
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
                        Vui lòng đăng nhập bằng tài khoản thành viên để xem chi tiết.
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

    if (isLoading) {
        return (
            <div className="min-h-[70vh] flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="text-gray-500">Đang tải sản phẩm...</div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-[70vh] flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="text-gray-500">Không tìm thấy sản phẩm.</div>
            </div>
        );
    }

    const stockLabel = product.stock > 0 ? 'Còn hàng' : 'Hết hàng';

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="mb-6 text-sm text-gray-500 dark:text-gray-300">
                    <Link to="/" className="hover:text-purple-600">Trang chủ</Link>
                    <span className="mx-2">/</span>
                    <span className="capitalize">{product.category || 'headphones'}</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-12">
                    <div>
                        <div className="relative rounded-2xl overflow-hidden bg-white dark:bg-gray-800 shadow-lg">
                            <img
                                src={images[activeImage]}
                                alt={product.name}
                                className="w-full h-[420px] object-cover"
                            />
                            {images.length > 1 && (
                                <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-4">
                                    <button
                                        onClick={() => setActiveImage((prev) => (prev - 1 + images.length) % images.length)}
                                        className="w-10 h-10 rounded-full bg-white/80 text-gray-900 shadow hover:bg-white"
                                    >
                                        ‹
                                    </button>
                                    <button
                                        onClick={() => setActiveImage((prev) => (prev + 1) % images.length)}
                                        className="w-10 h-10 rounded-full bg-white/80 text-gray-900 shadow hover:bg-white"
                                    >
                                        ›
                                    </button>
                                </div>
                            )}
                        </div>
                        {images.length > 1 && (
                            <div className="mt-4 grid grid-cols-4 gap-3">
                                {images.map((img, index) => (
                                    <button
                                        key={`${img}-${index}`}
                                        onClick={() => setActiveImage(index)}
                                        className={`rounded-xl overflow-hidden border-2 ${index === activeImage ? 'border-purple-500' : 'border-transparent'}`}
                                    >
                                        <img src={img} alt={`${product.name}-${index}`} className="h-20 w-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
                        <div className="flex flex-wrap items-center gap-3 mb-4">
                            <span className="inline-flex items-center px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-semibold">
                                {product.brand}
                            </span>
                            <span className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-semibold capitalize">
                                {product.category}
                            </span>
                        </div>
                        <h1 className="text-3xl font-bold mb-3">{product.name}</h1>
                        <p className="text-gray-600 dark:text-gray-300 mb-6">{product.description || 'Sản phẩm chất lượng cao cho nhu cầu nghe nhạc và làm việc.'}</p>

                        <div className="flex items-end gap-4 mb-6">
                            <span className="text-3xl font-extrabold text-pink-600">
                                {formatPrice(product.salePrice || product.price)}
                            </span>
                            {product.salePrice && (
                                <span className="text-gray-400 line-through">
                                    {formatPrice(product.price)}
                                </span>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                            <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/40 rounded-xl p-3">
                                <span>Hàng tồn</span>
                                <span className="font-semibold">{product.stock}</span>
                            </div>
                            <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/40 rounded-xl p-3">
                                <span>Đã bán</span>
                                <span className="font-semibold">{formatSold(product.sold)}</span>
                            </div>
                            <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/40 rounded-xl p-3">
                                <span>Tình trạng</span>
                                <span className={`font-semibold ${product.stock > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                                    {stockLabel}
                                </span>
                            </div>
                            <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/40 rounded-xl p-3">
                                <span>Bảo hành</span>
                                <span className="font-semibold">{product.warrantyMonths || 24} tháng</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 mb-6">
                            <span className="text-sm text-gray-500">Số lượng</span>
                            <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-full overflow-hidden">
                                <button
                                    onClick={handleDecrease}
                                    className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                    -
                                </button>
                                <span className="px-5 py-2 min-w-[48px] text-center">{quantity}</span>
                                <button
                                    onClick={handleIncrease}
                                    className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                                    disabled={product.stock === 0}
                                >
                                    +
                                </button>
                            </div>
                            <span className="text-xs text-gray-400">Tối đa: {product.stock}</span>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3">
                            <button
                                className="px-6 py-3 rounded-full bg-gray-900 text-white font-semibold hover:bg-gray-800 transition-colors"
                                disabled={product.stock === 0}
                            >
                                Thêm vào giỏ hàng
                            </button>
                            <button className="px-6 py-3 rounded-full border border-gray-300 font-semibold hover:border-purple-400">
                                Nhắn tư vấn
                            </button>
                        </div>
                    </div>
                </div>

                <div className="mb-12">
                    <h2 className="text-2xl font-bold mb-6">Sản phẩm tương tự</h2>
                    {similarProducts.length === 0 ? (
                        <div className="text-gray-500">Chưa có sản phẩm tương tự.</div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {similarProducts.map((item) => (
                                <Link
                                    to={`/product/${item._id}`}
                                    key={item._id || item.name}
                                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                                >
                                    <div className="h-40 overflow-hidden">
                                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="p-4">
                                        <h3 className="font-semibold mb-2 line-clamp-1">{item.name}</h3>
                                        <p className="text-pink-600 font-bold">
                                            {formatPrice(item.salePrice || item.price)}
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductDetailPage;

