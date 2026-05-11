// src/controllers/homeController.js

const getHomepage = async (req, res) => {
    return res.render('index.ejs'); // Render file index.ejs từ thư mục views [cite: 563]
}

module.exports = {
    getHomepage // Export hàm để Router có thể sử dụng [cite: 572, 574]
}