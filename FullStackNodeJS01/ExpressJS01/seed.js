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
        name: "Sony WF-1000XM5 True Wireless Earbuds",
        brand: "Sony",
        price: 6990000,
        salePrice: 5990000,
        image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=800&auto=format&fit=crop",
        images: [
            "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=800&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1608156639585-b3a032ef9689?q=80&w=800&auto=format&fit=crop"
        ],
        category: "earbuds",
        tags: ["sony", "earbuds", "anc", "wireless"],
        warrantyMonths: 12, stock: 120, sold: 560, rating: 4.7,
        isNewProduct: false, isBestSeller: true, isPromotion: true,
        description: "Sony WF-1000XM5 sở hữu công nghệ chống ồn đỉnh cao, driver Dynamic Driver X cho chất âm chi tiết và thiết kế siêu nhỏ nhẹ thoải mái cả ngày."
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
        name: "Beats Studio Buds+ Wireless ANC",
        brand: "Beats",
        price: 4490000,
        salePrice: 3890000,
        image: "https://images.unsplash.com/photo-1608156639585-b3a032ef9689?q=80&w=800&auto=format&fit=crop",
        images: [
            "https://images.unsplash.com/photo-1608156639585-b3a032ef9689?q=80&w=800&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=800&auto=format&fit=crop"
        ],
        category: "earbuds",
        tags: ["beats", "earbuds", "fashion", "apple"],
        warrantyMonths: 12, stock: 75, sold: 410, rating: 4.5,
        isNewProduct: false, isBestSeller: true, isPromotion: true,
        description: "Beats Studio Buds+ sở hữu âm thanh mạnh mẽ, chống ồn chủ động ANC cải tiến 1.6x, thiết kế trong suốt cá tính cùng thời lượng pin lên đến 36 giờ."
    },
    {
        name: "Marshall Emberton II Portable Speaker",
        brand: "Marshall",
        price: 4990000,
        salePrice: 4290000,
        image: "https://images.unsplash.com/photo-1612198188060-c7c2a3b567d2?q=80&w=800&auto=format&fit=crop",
        images: [
            "https://images.unsplash.com/photo-1612198188060-c7c2a3b567d2?q=80&w=800&auto=format&fit=crop"
        ],
        category: "speakers",
        tags: ["marshall", "speaker", "portable", "vintage"],
        warrantyMonths: 12, stock: 40, sold: 310, rating: 4.8,
        isNewProduct: true, isBestSeller: true, isPromotion: true,
        description: "Loa di động Marshall Emberton II với âm thanh nổi trung thực True Stereophonic 360 độ độc quyền, chuẩn kháng nước IP67 và thời lượng pin hơn 30 giờ."
    },
    {
        name: "JBL Flip 6 Waterproof Bluetooth Speaker",
        brand: "JBL",
        price: 2990000,
        salePrice: 2490000,
        image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?q=80&w=800&auto=format&fit=crop",
        images: [
            "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?q=80&w=800&auto=format&fit=crop"
        ],
        category: "speakers",
        tags: ["jbl", "speaker", "waterproof", "outdoor"],
        warrantyMonths: 12, stock: 85, sold: 650, rating: 4.7,
        isNewProduct: false, isBestSeller: true, isPromotion: true,
        description: "Loa di động JBL Flip 6 với hệ thống loa 2 đường tiếng mang lại âm thanh mạnh mẽ, trầm ấm đặc trưng của JBL, kháng nước bụi IP67 tiện lợi."
    },
    {
        name: "Apple AirPods Pro 2 USB-C",
        brand: "Apple",
        price: 6190000,
        salePrice: 5490000,
        image: "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?q=80&w=800&auto=format&fit=crop",
        images: [
            "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?q=80&w=800&auto=format&fit=crop"
        ],
        category: "earbuds",
        tags: ["apple", "earbuds", "anc", "wireless"],
        warrantyMonths: 12, stock: 150, sold: 980, rating: 4.9,
        isNewProduct: false, isBestSeller: true, isPromotion: true,
        description: "AirPods Pro thế hệ 2 với chip H2 mạnh mẽ, chống ồn chủ động gấp đôi thế hệ trước, âm thanh thích ứng Adaptive Audio và cổng sạc USB-C hiện đại."
    },
    {
        name: "Skullcandy Rail ANC True Wireless",
        brand: "Skullcandy",
        price: 3190000,
        salePrice: 2490000,
        image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=800&auto=format&fit=crop",
        images: [
            "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=800&auto=format&fit=crop"
        ],
        category: "earbuds",
        tags: ["skullcandy", "earbuds", "anc", "bass"],
        warrantyMonths: 12, stock: 55, sold: 175, rating: 4.4,
        isNewProduct: false, isBestSeller: false, isPromotion: true,
        description: "Skullcandy Rail ANC tích hợp công nghệ điều khiển giọng nói thông minh Skull-iQ, chống ồn chủ động 4 mic, âm thanh Personal Sound tùy chỉnh."
    },
    {
        name: "Sony WH-CH720N Wireless Over-ear",
        brand: "Sony",
        price: 2990000,
        salePrice: 2490000,
        image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?q=80&w=800&auto=format&fit=crop",
        images: ["https://images.unsplash.com/photo-1546435770-a3e426bf472b?q=80&w=800&auto=format&fit=crop"],
        category: "headphones",
        tags: ["sony", "anc", "wireless", "lightweight"],
        warrantyMonths: 12, stock: 90, sold: 340, rating: 4.5,
        isNewProduct: false, isBestSeller: true, isPromotion: true,
        description: "Tai nghe chống ồn Over-ear nhẹ nhất của Sony, sử dụng bộ xử lý V1 đỉnh cao cùng thời lượng pin lên đến 35 giờ liên tục."
    },
    {
        name: "JBL Tour One M2 Wireless ANC",
        brand: "JBL",
        price: 6990000,
        salePrice: 5990000,
        image: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?q=80&w=800&auto=format&fit=crop",
        images: ["https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?q=80&w=800&auto=format&fit=crop"],
        category: "headphones",
        tags: ["jbl", "anc", "wireless", "tour"],
        warrantyMonths: 12, stock: 40, sold: 110, rating: 4.6,
        isNewProduct: true, isBestSeller: false, isPromotion: true,
        description: "Trải nghiệm âm thanh vòm JBL Spatial Sound sống động, công nghệ chống ồn thích ứng ANC True Adaptive hiện đại và đàm thoại rõ nét."
    },
    {
        name: "Audio-Technica ATH-M50xBT2 Studio",
        brand: "Audio-Technica",
        price: 5490000,
        salePrice: 4990000,
        image: "https://images.unsplash.com/photo-1484704849700-f032a568e944?q=80&w=800&auto=format&fit=crop",
        images: ["https://images.unsplash.com/photo-1484704849700-f032a568e944?q=80&w=800&auto=format&fit=crop"],
        category: "headphones",
        tags: ["audiotechnica", "studio", "wireless", "monitoring"],
        warrantyMonths: 12, stock: 30, sold: 190, rating: 4.8,
        isNewProduct: false, isBestSeller: true, isPromotion: true,
        description: "Huyền thoại phòng thu nay đã có phiên bản không dây. Driver 45mm khẩu độ lớn mang lại độ phản hồi âm bass sâu cực kỳ chính xác."
    },
    {
        name: "Marshall Major IV Wireless On-ear",
        brand: "Marshall",
        price: 3990000,
        salePrice: 3490000,
        image: "https://images.unsplash.com/photo-1524678606370-a47ad25cb82a?q=80&w=800&auto=format&fit=crop",
        images: ["https://images.unsplash.com/photo-1524678606370-a47ad25cb82a?q=80&w=800&auto=format&fit=crop"],
        category: "headphones",
        tags: ["marshall", "wireless", "iconic", "long-battery"],
        warrantyMonths: 12, stock: 70, sold: 480, rating: 4.7,
        isNewProduct: false, isBestSeller: true, isPromotion: true,
        description: "Tai nghe không dây biểu tượng của Marshall với thời lượng pin không tưởng hơn 80 giờ, hỗ trợ sạc không dây cực kỳ tiện lợi."
    },
    {
        name: "Soundcore Liberty 4 NC Earbuds",
        brand: "Soundcore",
        price: 2590000,
        salePrice: 1990000,
        image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=800&auto=format&fit=crop",
        images: ["https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=800&auto=format&fit=crop"],
        category: "earbuds",
        tags: ["soundcore", "earbuds", "anc", "value"],
        warrantyMonths: 12, stock: 150, sold: 720, rating: 4.6,
        isNewProduct: true, isBestSeller: true, isPromotion: true,
        description: "Giảm tiếng ồn đến 98.5% với công nghệ Adaptive ANC 2.0. Driver 11mm tùy chỉnh cho âm thanh Hi-Res Audio sắc nét vượt trội."
    },
    {
        name: "Jabra Elite 10 Premium ANC",
        brand: "Jabra",
        price: 6490000,
        salePrice: 5490000,
        image: "https://images.unsplash.com/photo-1608156639585-b3a032ef9689?q=80&w=800&auto=format&fit=crop",
        images: ["https://images.unsplash.com/photo-1608156639585-b3a032ef9689?q=80&w=800&auto=format&fit=crop"],
        category: "earbuds",
        tags: ["jabra", "earbuds", "comfort", "spatial-sound"],
        warrantyMonths: 24, stock: 45, sold: 130, rating: 4.7,
        isNewProduct: true, isBestSeller: false, isPromotion: true,
        description: "Tai nghe chống ồn cao cấp nhất của Jabra với công nghệ ComfortFit dễ chịu cả ngày, âm thanh Dolby Spatial Sound sống động kèm theo tính năng theo dõi chuyển động đầu."
    },
    {
        name: "Marshall Motif II ANC Earbuds",
        brand: "Marshall",
        price: 4990000,
        salePrice: 4390000,
        image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=800&auto=format&fit=crop",
        images: ["https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=800&auto=format&fit=crop"],
        category: "earbuds",
        tags: ["marshall", "earbuds", "anc", "rock"],
        warrantyMonths: 12, stock: 65, sold: 250, rating: 4.6,
        isNewProduct: true, isBestSeller: true, isPromotion: true,
        description: "Motif II ANC mang đến âm thanh sân khấu sống động của Marshall. Hỗ trợ Bluetooth LE Audio, chống ồn chủ động cải tiến và 30 giờ chơi nhạc."
    },
    {
        name: "JBL Tour Pro 2 Smart Case ANC",
        brand: "JBL",
        price: 5990000,
        salePrice: 4990000,
        image: "https://images.unsplash.com/photo-1608156639585-b3a032ef9689?q=80&w=800&auto=format&fit=crop",
        images: ["https://images.unsplash.com/photo-1608156639585-b3a032ef9689?q=80&w=800&auto=format&fit=crop"],
        category: "earbuds",
        tags: ["jbl", "earbuds", "smartcase", "anc"],
        warrantyMonths: 12, stock: 50, sold: 180, rating: 4.7,
        isNewProduct: true, isBestSeller: true, isPromotion: true,
        description: "Hộp sạc thông minh tích hợp màn hình cảm ứng đầu tiên trên thế giới. Quản lý cài đặt, cuộc gọi và âm nhạc trực tiếp trên hộp sạc."
    },
    {
        name: "Sony WF-C700N Entry ANC Earbuds",
        brand: "Sony",
        price: 2490000,
        salePrice: 1990000,
        image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=800&auto=format&fit=crop",
        images: ["https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=800&auto=format&fit=crop"],
        category: "earbuds",
        tags: ["sony", "earbuds", "anc", "entry"],
        warrantyMonths: 12, stock: 140, sold: 610, rating: 4.5,
        isNewProduct: false, isBestSeller: true, isPromotion: true,
        description: "Tai nghe True Wireless siêu nhỏ nhẹ, chống ồn chủ động chất lượng cao và công nghệ tăng cường âm thanh DSEE độc quyền của Sony."
    },
    {
        name: "JBL Charge 5 Waterproof Outdoor",
        brand: "JBL",
        price: 3990000,
        salePrice: 3490000,
        image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?q=80&w=800&auto=format&fit=crop",
        images: ["https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?q=80&w=800&auto=format&fit=crop"],
        category: "speakers",
        tags: ["jbl", "speaker", "waterproof", "powerbank"],
        warrantyMonths: 12, stock: 110, sold: 850, rating: 4.8,
        isNewProduct: false, isBestSeller: true, isPromotion: true,
        description: "Âm thanh JBL Original Pro mạnh mẽ, củ loa trầm tối ưu và loa tweeter độc lập. Tích hợp sạc dự phòng sạc điện thoại ngay khi chơi nhạc."
    },
    {
        name: "Bose SoundLink Flex Waterproof",
        brand: "Bose",
        price: 3890000,
        salePrice: 3290000,
        image: "https://images.unsplash.com/photo-1612198188060-c7c2a3b567d2?q=80&w=800&auto=format&fit=crop",
        images: ["https://images.unsplash.com/photo-1612198188060-c7c2a3b567d2?q=80&w=800&auto=format&fit=crop"],
        category: "speakers",
        tags: ["bose", "speaker", "waterproof", "outdoor"],
        warrantyMonths: 12, stock: 80, sold: 340, rating: 4.7,
        isNewProduct: false, isBestSeller: true, isPromotion: true,
        description: "Âm thanh rõ ràng, sâu lắng chuẩn Bose trong thiết kế di động kháng bụi nước IP67. Công nghệ PositionIQ tự động tối ưu âm thanh theo hướng đặt."
    },
    {
        name: "Marshall Stanmore III Home Speaker",
        brand: "Marshall",
        price: 10990000,
        salePrice: 9990000,
        image: "https://images.unsplash.com/photo-1612198188060-c7c2a3b567d2?q=80&w=800&auto=format&fit=crop",
        images: ["https://images.unsplash.com/photo-1612198188060-c7c2a3b567d2?q=80&w=800&auto=format&fit=crop"],
        category: "speakers",
        tags: ["marshall", "speaker", "home", "vintage"],
        warrantyMonths: 12, stock: 25, sold: 190, rating: 4.8,
        isNewProduct: true, isBestSeller: true, isPromotion: true,
        description: "Loa gia đình huyền thoại Marshall Stanmore III với âm trường rộng mở hơn thế hệ trước, nâng cấp kết nối Bluetooth 5.2 và chất âm chi tiết tuyệt vời."
    },
    {
        name: "B&O Beosound A1 2nd Gen Luxury",
        brand: "B&O",
        price: 7990000,
        salePrice: 7290000,
        image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?q=80&w=800&auto=format&fit=crop",
        images: ["https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?q=80&w=800&auto=format&fit=crop"],
        category: "speakers",
        tags: ["bangolufsen", "speaker", "luxury", "portable"],
        warrantyMonths: 24, stock: 30, sold: 90, rating: 4.9,
        isNewProduct: true, isBestSeller: false, isPromotion: true,
        description: "Loa di động siêu sang đến từ Đan Mạch. Âm thanh vòm 360 độ chân thực, kháng nước IP67 và tích hợp trợ lý ảo Alexa thông minh."
    },
    {
        name: "Sony SRS-XE300 Portable Speaker",
        brand: "Sony",
        price: 3990000,
        salePrice: 2990000,
        image: "https://images.unsplash.com/photo-1612198188060-c7c2a3b567d2?q=80&w=800&auto=format&fit=crop",
        images: ["https://images.unsplash.com/photo-1612198188060-c7c2a3b567d2?q=80&w=800&auto=format&fit=crop"],
        category: "speakers",
        tags: ["sony", "speaker", "outdoor", "bass"],
        warrantyMonths: 12, stock: 95, sold: 290, rating: 4.6,
        isNewProduct: false, isBestSeller: true, isPromotion: true,
        description: "Bộ khuếch tán dạng thẳng độc đáo giúp âm thanh lan tỏa rộng hơn. Chống nước, chống va đập hoàn hảo và pin khủng lên đến 24 giờ."
    }
];

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_DB_URL);
        console.log("✅ Connected to MongoDB...");

        await Product.deleteMany({});
        console.log("🗑️  Cleared existing products.");

        const productsWithViews = products.map(p => ({
            ...p,
            views: Math.floor(Math.random() * 1950) + 50
        }));

        await Product.insertMany(productsWithViews);
        console.log(`✅ Seeded ${products.length} products with multiple images and random views!`);

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
