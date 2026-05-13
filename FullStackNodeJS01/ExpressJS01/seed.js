const mongoose = require('mongoose');
require('dotenv').config();
const Product = require('./src/models/product');

const products = [
    // NEW ARRIVALS
    {
        name: "Sony WH-1000XM5 Premium Noise Canceling",
        brand: "Sony",
        price: 9490000,
        salePrice: 8490000,
        image: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?q=80&w=800&auto=format&fit=crop",
        category: "headphones",
        tags: ["wireless", "anc", "premium"],
        stock: 50,
        sold: 120,
        isNewProduct: true,
        isBestSeller: true,
        isPromotion: false,
        description: "The best noise-cancelling headphones on the market with incredible sound quality."
    },
    {
        name: "Apple AirPods Max - Sky Blue",
        brand: "Apple",
        price: 13990000,
        salePrice: 12500000,
        image: "https://images.unsplash.com/photo-1613040809024-b4ef7ba99bc3?q=80&w=800&auto=format&fit=crop",
        category: "headphones",
        tags: ["apple", "wireless", "design"],
        stock: 30,
        sold: 85,
        isNewProduct: true,
        isBestSeller: false,
        isPromotion: true,
        description: "AirPods Max reimagine over-ear headphones. An Apple-designed dynamic driver provides immersive high-fidelity audio."
    },
    {
        name: "Sennheiser Momentum 4 Wireless",
        brand: "Sennheiser",
        price: 9990000,
        salePrice: 7990000,
        image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?q=80&w=800&auto=format&fit=crop",
        category: "headphones",
        tags: ["sennheiser", "audiophile", "wireless"],
        stock: 40,
        sold: 45,
        isNewProduct: true,
        isBestSeller: false,
        isPromotion: true,
        description: "Experience superior sound with advanced Adaptive Noise Cancellation and up to 60-hour battery life."
    },
    {
        name: "Bose QuietComfort Ultra",
        brand: "Bose",
        price: 10990000,
        salePrice: 9490000,
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800&auto=format&fit=crop",
        category: "headphones",
        tags: ["bose", "comfort", "anc"],
        stock: 60,
        sold: 210,
        isNewProduct: false,
        isBestSeller: true,
        isPromotion: true,
        description: "World-class noise cancellation, quieter than ever before. Breakthrough spatialized audio for more immersive listening."
    },
    {
        name: "JBL Live 660NC Wireless",
        brand: "JBL",
        price: 3990000,
        salePrice: 2990000,
        image: "https://images.unsplash.com/photo-1583394838336-acd977736f90?q=80&w=800&auto=format&fit=crop",
        category: "headphones",
        tags: ["jbl", "bass", "affordable"],
        stock: 100,
        sold: 450,
        isNewProduct: false,
        isBestSeller: true,
        isPromotion: true,
        description: "JBL Signature Sound, noise cancelling, and up to 50 hours of battery life."
    },
    {
        name: "Marshall Monitor II A.N.C.",
        brand: "Marshall",
        price: 8990000,
        salePrice: 7490000,
        image: "https://images.unsplash.com/photo-1524678606370-a47ad25cb82a?q=80&w=800&auto=format&fit=crop",
        category: "headphones",
        tags: ["marshall", "rock", "design"],
        stock: 25,
        sold: 65,
        isNewProduct: true,
        isBestSeller: false,
        isPromotion: false,
        description: "Classic Marshall design with active noise cancelling technology and custom-tuned drivers."
    },
    {
        name: "Beats Studio Pro",
        brand: "Beats",
        price: 8490000,
        salePrice: 5990000,
        image: "https://images.unsplash.com/photo-1577174881658-0f30ed549adc?q=80&w=800&auto=format&fit=crop",
        category: "headphones",
        tags: ["beats", "bass", "fashion"],
        stock: 80,
        sold: 320,
        isNewProduct: false,
        isBestSeller: true,
        isPromotion: true,
        description: "Beats' most powerful and precise over-ear headphones ever."
    },
    {
        name: "Audio-Technica ATH-M50xBT2",
        brand: "Audio-Technica",
        price: 5500000,
        salePrice: 4900000,
        image: "https://images.unsplash.com/photo-1599666505327-7758b44a9985?q=80&w=800&auto=format&fit=crop",
        category: "headphones",
        tags: ["studio", "audiophile", "wireless"],
        stock: 45,
        sold: 180,
        isNewProduct: true,
        isBestSeller: false,
        isPromotion: false,
        description: "Wireless over-ear headphones that deliver the same critically acclaimed sonic performance as the original ATH-M50x studio headphones."
    }
];

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_DB_URL);
        console.log("Connected to MongoDB...");
        
        await Product.deleteMany({});
        console.log("Cleared existing products.");
        
        await Product.insertMany(products);
        console.log("Seeded new products successfully!");
        
        process.exit();
    } catch (error) {
        console.error("Error seeding database:", error);
        process.exit(1);
    }
};

seedDB();
