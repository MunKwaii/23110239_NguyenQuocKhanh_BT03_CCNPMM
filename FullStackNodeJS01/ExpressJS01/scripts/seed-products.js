require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../src/models/product');

const shouldAppend = process.argv.includes('--append');
const isDryRun = process.argv.includes('--dry-run');

const products = [
    {
        name: 'Sony WH-1000XM5',
        brand: 'Sony',
        price: 8490000,
        salePrice: 7990000,
        image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&q=80&w=800',
        tags: ['chong-on', 'cao-cap'],
        stock: 45,
        rating: 4.9,
        sold: 1250,
        isNewProduct: true,
        isBestSeller: true,
        isPromotion: true,
        description: 'Tai nghe chong on dinh cao, pin 30 gio, sac nhanh USB-C.'
    },
    {
        name: 'Apple AirPods Pro 2',
        brand: 'Apple',
        price: 6190000,
        salePrice: 5790000,
        image: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&q=80&w=800',
        tags: ['true-wireless', 'chong-on'],
        stock: 60,
        rating: 4.8,
        sold: 1320,
        isNewProduct: true,
        isBestSeller: true,
        isPromotion: true,
        description: 'Kiem soat tieng on, am thanh khong gian, ho tro iOS.'
    },
    {
        name: 'Bose QuietComfort Ultra',
        brand: 'Bose',
        price: 9990000,
        salePrice: 9490000,
        image: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&q=80&w=800',
        tags: ['chong-on', 'cao-cap'],
        stock: 28,
        rating: 4.8,
        sold: 860,
        isNewProduct: true,
        isBestSeller: false,
        isPromotion: true,
        description: 'Chong on manh me, chat am am ap, om tai thoai mai.'
    },
    {
        name: 'Sennheiser Momentum 4',
        brand: 'Sennheiser',
        price: 7990000,
        salePrice: 7490000,
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800',
        tags: ['hifi', 'chong-on'],
        stock: 22,
        rating: 4.7,
        sold: 790,
        isNewProduct: true,
        isBestSeller: false,
        isPromotion: true,
        description: 'Pin 60 gio, am thanh can bang, ket noi da thiet bi.'
    },
    {
        name: 'JBL Tune 770NC',
        brand: 'JBL',
        price: 2790000,
        salePrice: 2490000,
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800',
        tags: ['gia-tot', 'chong-on'],
        stock: 120,
        rating: 4.6,
        sold: 1900,
        isNewProduct: false,
        isBestSeller: true,
        isPromotion: true,
        description: 'Chong on thong minh, pin 44 gio, gia tot cho sinh vien.'
    },
    {
        name: 'Beats Studio Pro',
        brand: 'Beats',
        price: 7490000,
        salePrice: 6990000,
        image: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&q=80&w=800',
        tags: ['cao-cap', 'the-thao'],
        stock: 30,
        rating: 4.7,
        sold: 1300,
        isNewProduct: false,
        isBestSeller: true,
        isPromotion: true,
        description: 'Thiet ke the thao, am bass manh, ho tro Spatial Audio.'
    },
    {
        name: 'Soundcore Space One',
        brand: 'Anker',
        price: 2190000,
        salePrice: 1990000,
        image: 'https://images.unsplash.com/photo-1471478331149-c72f17e33c73?auto=format&fit=crop&q=80&w=800',
        tags: ['gia-tot', 'chong-on'],
        stock: 85,
        rating: 4.5,
        sold: 1100,
        isNewProduct: false,
        isBestSeller: true,
        isPromotion: true,
        description: 'Chong on tot, pin 40 gio, ket noi Bluetooth 5.3.'
    },
    {
        name: 'Sony LinkBuds S',
        brand: 'Sony',
        price: 3790000,
        salePrice: 3490000,
        image: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&q=80&w=800',
        tags: ['true-wireless', 'di-chuyen'],
        stock: 70,
        rating: 4.6,
        sold: 950,
        isNewProduct: false,
        isBestSeller: true,
        isPromotion: true,
        description: 'Gon nhe, pin ben, chong on thong minh, chong nuoc.'
    },
    {
        name: 'Marshall Major IV',
        brand: 'Marshall',
        price: 3290000,
        salePrice: 2990000,
        image: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&q=80&w=800',
        tags: ['thoi-trang', 'pin-lau'],
        stock: 55,
        rating: 4.5,
        sold: 820,
        isNewProduct: false,
        isBestSeller: true,
        isPromotion: false,
        description: 'Phong cach co dien, pin 80 gio, am thanh day dan.'
    },
    {
        name: 'Razer BlackShark V2',
        brand: 'Razer',
        price: 2590000,
        salePrice: 2390000,
        image: 'https://images.unsplash.com/photo-1518441902114-f2338c8f032d?auto=format&fit=crop&q=80&w=800',
        tags: ['gaming', 'mic-chat-luong'],
        stock: 90,
        rating: 4.6,
        sold: 780,
        isNewProduct: false,
        isBestSeller: true,
        isPromotion: false,
        description: 'Gaming headset, mic ro, am thanh dinh vi chinh xac.'
    },
    {
        name: 'HyperX Cloud II',
        brand: 'HyperX',
        price: 2290000,
        salePrice: 2090000,
        image: 'https://images.unsplash.com/photo-1518441902114-f2338c8f032d?auto=format&fit=crop&q=80&w=800',
        tags: ['gaming', 'gia-tot'],
        stock: 75,
        rating: 4.5,
        sold: 720,
        isNewProduct: false,
        isBestSeller: true,
        isPromotion: false,
        description: 'Am thanh 7.1, dem tai mem, hop cho game thu.'
    },
    {
        name: 'Sennheiser HD 450BT',
        brand: 'Sennheiser',
        price: 3990000,
        salePrice: 3690000,
        image: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&q=80&w=800',
        tags: ['chong-on', 'di-chuyen'],
        stock: 40,
        rating: 4.4,
        sold: 690,
        isNewProduct: false,
        isBestSeller: true,
        isPromotion: false,
        description: 'Am thanh chi tiet, chong on on dinh, pin 30 gio.'
    },
    {
        name: 'Audio-Technica ATH-M50x',
        brand: 'Audio-Technica',
        price: 4290000,
        salePrice: 4090000,
        image: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&q=80&w=800',
        tags: ['studio', 'hifi'],
        stock: 35,
        rating: 4.7,
        sold: 540,
        isNewProduct: false,
        isBestSeller: false,
        isPromotion: false,
        description: 'Tai nghe studio kinh dien, am thanh chuan xac.'
    },
    {
        name: 'Shokz OpenRun Pro',
        brand: 'Shokz',
        price: 4990000,
        salePrice: 4690000,
        image: 'https://images.unsplash.com/photo-1518441902114-f2338c8f032d?auto=format&fit=crop&q=80&w=800',
        tags: ['the-thao', 'xuong-ham'],
        stock: 25,
        rating: 4.6,
        sold: 410,
        isNewProduct: true,
        isBestSeller: false,
        isPromotion: false,
        description: 'Tai nghe xuong ham cho the thao, khong bit tai.'
    },
    {
        name: 'Jabra Elite 8 Active',
        brand: 'Jabra',
        price: 5290000,
        salePrice: 4890000,
        image: 'https://images.unsplash.com/photo-1471478331149-c72f17e33c73?auto=format&fit=crop&q=80&w=800',
        tags: ['true-wireless', 'the-thao'],
        stock: 48,
        rating: 4.6,
        sold: 560,
        isNewProduct: true,
        isBestSeller: false,
        isPromotion: true,
        description: 'Chong nuoc IP68, bam tai, pin ben, goi dien ro.'
    },
    {
        name: 'Xiaomi Redmi Buds 5 Pro',
        brand: 'Xiaomi',
        price: 1490000,
        salePrice: 1290000,
        image: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&q=80&w=800',
        tags: ['gia-tot', 'true-wireless'],
        stock: 150,
        rating: 4.3,
        sold: 980,
        isNewProduct: true,
        isBestSeller: true,
        isPromotion: true,
        description: 'Gia tot, chong on on dinh, sac nhanh, do tre thap.'
    }
];

const seedProducts = async () => {
    if (!process.env.MONGO_DB_URL) {
        throw new Error('Missing MONGO_DB_URL in environment');
    }

    if (isDryRun) {
        console.log(`Dry run: ${products.length} products ready to seed.`);
        console.log(products.slice(0, 3).map(item => item.name));
        return;
    }

    await mongoose.connect(process.env.MONGO_DB_URL);

    if (!shouldAppend) {
        await Product.deleteMany({});
    }

    const result = await Product.insertMany(products);
    console.log(`Seeded ${result.length} products.`);

    await mongoose.disconnect();
};

seedProducts().catch((error) => {
    console.error('Seed failed:', error.message);
    process.exit(1);
});
