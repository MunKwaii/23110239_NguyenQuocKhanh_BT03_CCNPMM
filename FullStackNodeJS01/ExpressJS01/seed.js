const mongoose = require('mongoose');
require('dotenv').config();
const Product = require('./src/models/product');

const products = [
    {
        name: "Sony WH-1000XM5 Wireless Noise Canceling",
        brand: "Sony",
        price: 9490000,
        salePrice: 7990000,
        image: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?q=80&w=800&auto=format&fit=crop",
        images: [
            "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?q=80&w=800&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1484704849700-f032a568e944?q=80&w=800&auto=format&fit=crop"
        ],
        category: "headphones",
        tags: ["wireless", "anc", "premium", "sony"],
        warrantyMonths: 24, stock: 45, sold: 320, rating: 4.8,
        isNewProduct: true, isBestSeller: true, isPromotion: true,
        description: "Tai nghe chống ồn chủ động tốt nhất thế giới. Công nghệ Dual Noise Sensor, âm thanh 360 Reality Audio và pin 30 giờ liên tục."
    },
    {
        name: "Apple AirPods Max Sky Blue",
        brand: "Apple",
        price: 13990000,
        salePrice: 12490000,
        image: "https://images.unsplash.com/photo-1613040809024-b4ef7ba99bc3?q=80&w=800&auto=format&fit=crop",
        images: [
            "https://images.unsplash.com/photo-1613040809024-b4ef7ba99bc3?q=80&w=800&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?q=80&w=800&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1491553895911-0055eca6402d?q=80&w=800&auto=format&fit=crop"
        ],
        category: "headphones",
        tags: ["apple", "wireless", "design", "premium"],
        warrantyMonths: 12, stock: 28, sold: 140, rating: 4.7,
        isNewProduct: true, isBestSeller: false, isPromotion: true,
        description: "AirPods Max mang đến trải nghiệm nghe nhạc đỉnh cao với driver động tùy chỉnh của Apple, chống ồn chủ động và âm thanh không gian."
    },
    {
        name: "Bose QuietComfort 45 Wireless",
        brand: "Bose",
        price: 8990000,
        salePrice: 6990000,
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800&auto=format&fit=crop",
        images: [
            "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1546435770-a3e426bf472b?q=80&w=800&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1524678606370-a47ad25cb82a?q=80&w=800&auto=format&fit=crop"
        ],
        category: "headphones",
        tags: ["bose", "comfort", "anc", "wireless"],
        warrantyMonths: 24, stock: 60, sold: 280, rating: 4.7,
        isNewProduct: false, isBestSeller: true, isPromotion: true,
        description: "Chống ồn đẳng cấp thế giới từ Bose. Thiết kế siêu nhẹ, êm tai, pin 24 giờ và chế độ Aware cho phép nghe âm thanh xung quanh."
    },
    {
        name: "Sennheiser Momentum 4 Wireless",
        brand: "Sennheiser",
        price: 9990000,
        salePrice: 7490000,
        image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?q=80&w=800&auto=format&fit=crop",
        images: [
            "https://images.unsplash.com/photo-1546435770-a3e426bf472b?q=80&w=800&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1583394838336-acd977736f90?q=80&w=800&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?q=80&w=800&auto=format&fit=crop"
        ],
        category: "headphones",
        tags: ["sennheiser", "audiophile", "wireless", "hifi"],
        warrantyMonths: 24, stock: 35, sold: 95, rating: 4.8,
        isNewProduct: true, isBestSeller: false, isPromotion: true,
        description: "Momentum 4 với pin khủng 60 giờ, chống ồn Adaptive và âm thanh Hi-Fi chuẩn audiophile. Thiết kế sang trọng gấp gọn tiện lợi."
    },
    {
        name: "JBL Live 660NC Over-Ear Wireless",
        brand: "JBL",
        price: 3990000,
        salePrice: 2790000,
        image: "https://images.unsplash.com/photo-1583394838336-acd977736f90?q=80&w=800&auto=format&fit=crop",
        images: [
            "https://images.unsplash.com/photo-1583394838336-acd977736f90?q=80&w=800&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1484704849700-f032a568e944?q=80&w=800&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800&auto=format&fit=crop"
        ],
        category: "headphones",
        tags: ["jbl", "bass", "affordable", "wireless"],
        warrantyMonths: 12, stock: 120, sold: 560, rating: 4.5,
        isNewProduct: false, isBestSeller: true, isPromotion: true,
        description: "JBL Signature Sound cực bass, chống ồn chủ động, pin 50 giờ. Lựa chọn tốt nhất cho phân khúc tầm trung với chất âm JBL nổi tiếng."
    },
    {
        name: "Marshall Monitor II ANC Wireless",
        brand: "Marshall",
        price: 8990000,
        salePrice: null,
        image: "https://images.unsplash.com/photo-1524678606370-a47ad25cb82a?q=80&w=800&auto=format&fit=crop",
        images: [
            "https://images.unsplash.com/photo-1524678606370-a47ad25cb82a?q=80&w=800&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1599666505327-7758b44a9985?q=80&w=800&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1546435770-a3e426bf472b?q=80&w=800&auto=format&fit=crop"
        ],
        category: "headphones",
        tags: ["marshall", "rock", "design", "vintage"],
        warrantyMonths: 24, stock: 22, sold: 75, rating: 4.6,
        isNewProduct: true, isBestSeller: false, isPromotion: false,
        description: "Thiết kế vintage rock huyền thoại của Marshall, chống ồn chủ động, driver 40mm tùy chỉnh. Pin 30 giờ và âm thanh ấm áp đặc trưng."
    },
    {
        name: "Beats Studio Pro Wireless",
        brand: "Beats",
        price: 8490000,
        salePrice: 5990000,
        image: "https://images.unsplash.com/photo-1577174881658-0f30ed549adc?q=80&w=800&auto=format&fit=crop",
        images: [
            "https://images.unsplash.com/photo-1577174881658-0f30ed549adc?q=80&w=800&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1613040809024-b4ef7ba99bc3?q=80&w=800&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800&auto=format&fit=crop"
        ],
        category: "headphones",
        tags: ["beats", "bass", "fashion", "apple"],
        warrantyMonths: 12, stock: 75, sold: 410, rating: 4.5,
        isNewProduct: false, isBestSeller: true, isPromotion: true,
        description: "Beats Studio Pro mạnh mẽ nhất từ trước đến nay. Chống ồn chủ động, âm bass cực đỉnh, tương thích hoàn hảo iPhone và Android."
    },
    {
        name: "Audio-Technica ATH-M50xBT2 Studio",
        brand: "Audio-Technica",
        price: 5500000,
        salePrice: 4490000,
        image: "https://images.unsplash.com/photo-1599666505327-7758b44a9985?q=80&w=800&auto=format&fit=crop",
        images: [
            "https://images.unsplash.com/photo-1599666505327-7758b44a9985?q=80&w=800&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1484704849700-f032a568e944?q=80&w=800&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1583394838336-acd977736f90?q=80&w=800&auto=format&fit=crop"
        ],
        category: "headphones",
        tags: ["studio", "audiophile", "wireless", "monitor"],
        warrantyMonths: 24, stock: 50, sold: 195, rating: 4.7,
        isNewProduct: true, isBestSeller: false, isPromotion: true,
        description: "Phiên bản wireless của huyền thoại M50x. Âm thanh chuẩn studio monitor, kết nối đa điểm, LDAC Hi-Res Audio."
    },
    {
        name: "Sony WH-CH720N Lightweight ANC",
        brand: "Sony",
        price: 4490000,
        salePrice: 3490000,
        image: "https://images.unsplash.com/photo-1484704849700-f032a568e944?q=80&w=800&auto=format&fit=crop",
        images: [
            "https://images.unsplash.com/photo-1484704849700-f032a568e944?q=80&w=800&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?q=80&w=800&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1546435770-a3e426bf472b?q=80&w=800&auto=format&fit=crop"
        ],
        category: "headphones",
        tags: ["sony", "lightweight", "anc", "compact"],
        warrantyMonths: 12, stock: 80, sold: 235, rating: 4.4,
        isNewProduct: true, isBestSeller: true, isPromotion: true,
        description: "Tai nghe ANC nhẹ nhất của Sony, chỉ 192g. Phù hợp cho người dùng năng động, pin 35 giờ và Quick Charge 10 phút dùng 60 phút."
    },
    {
        name: "Jabra Evolve2 85 Business UC",
        brand: "Jabra",
        price: 12990000,
        salePrice: 10990000,
        image: "https://images.unsplash.com/photo-1491553895911-0055eca6402d?q=80&w=800&auto=format&fit=crop",
        images: [
            "https://images.unsplash.com/photo-1491553895911-0055eca6402d?q=80&w=800&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1577174881658-0f30ed549adc?q=80&w=800&auto=format&fit=crop"
        ],
        category: "headphones",
        tags: ["jabra", "business", "professional", "uc"],
        warrantyMonths: 24, stock: 18, sold: 45, rating: 4.6,
        isNewProduct: true, isBestSeller: false, isPromotion: false,
        description: "Giải pháp tai nghe chuyên nghiệp cho doanh nghiệp. 8 mic chống ồn, ANC hàng đầu, pin 36 giờ và sạc không dây tích hợp."
    },
    {
        name: "Anker Soundcore Q45 Hi-Res",
        brand: "Anker",
        price: 1990000,
        salePrice: 1490000,
        image: "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?q=80&w=800&auto=format&fit=crop",
        images: [
            "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?q=80&w=800&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1583394838336-acd977736f90?q=80&w=800&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800&auto=format&fit=crop"
        ],
        category: "headphones",
        tags: ["anker", "budget", "hi-res", "affordable"],
        warrantyMonths: 18, stock: 200, sold: 890, rating: 4.3,
        isNewProduct: false, isBestSeller: true, isPromotion: true,
        description: "Hi-Res Audio giá rẻ nhất thị trường. Driver 40mm, LDAC, chống ồn 4 mic và pin 50 giờ khủng. Xứng đáng từng đồng bỏ ra."
    },
    {
        name: "Skullcandy Crusher ANC 2",
        brand: "Skullcandy",
        price: 4990000,
        salePrice: 3290000,
        image: "https://images.unsplash.com/photo-1524678606370-a47ad25cb82a?q=80&w=800&auto=format&fit=crop",
        images: [
            "https://images.unsplash.com/photo-1524678606370-a47ad25cb82a?q=80&w=800&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1583394838336-acd977736f90?q=80&w=800&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1577174881658-0f30ed549adc?q=80&w=800&auto=format&fit=crop"
        ],
        category: "headphones",
        tags: ["skullcandy", "bass", "crusher", "sensory-bass"],
        warrantyMonths: 12, stock: 55, sold: 175, rating: 4.4,
        isNewProduct: false, isBestSeller: false, isPromotion: true,
        description: "Tai nghe với công nghệ Sensory Bass độc quyền, cảm nhận bass rung cả hộp sọ. ANC, pin 60 giờ. Dành cho tín đồ bass."
    }
];

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_DB_URL);
        console.log("✅ Connected to MongoDB...");

        await Product.deleteMany({});
        console.log("🗑️  Cleared existing products.");

        await Product.insertMany(products);
        console.log(`✅ Seeded ${products.length} products with multiple images!`);

        // Show price distribution
        console.log("\n📊 Price distribution:");
        console.log("  Dưới 2 triệu:", products.filter(p => (p.salePrice || p.price) < 2000000).map(p => p.name));
        console.log("  2-5 triệu:", products.filter(p => { const ep = p.salePrice || p.price; return ep >= 2000000 && ep <= 5000000; }).map(p => p.name));
        console.log("  5-10 triệu:", products.filter(p => { const ep = p.salePrice || p.price; return ep >= 5000000 && ep <= 10000000; }).map(p => p.name));
        console.log("  Trên 10 triệu:", products.filter(p => (p.salePrice || p.price) > 10000000).map(p => p.name));

        process.exit();
    } catch (error) {
        console.error("❌ Error seeding database:", error);
        process.exit(1);
    }
};

seedDB();
