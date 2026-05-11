require('dotenv').config();
const express = require('express');
const configViewEngine = require('./config/viewEngine');
const connection = require('./config/database');
const cors = require('cors'); // 

// 1. Import các Controller và Route
const { getHomepage } = require('./controllers/homeController'); // [cite: 333]
const apiRoutes = require('./routes/api'); // [cite: 302, 356]

const app = express();
const port = process.env.PORT || 8888; // [cite: 335, 336]

// 2. Cấu hình Middleware
app.use(cors()); // Cần thiết nếu bạn gọi API từ ReactJS [cite: 337]
app.use(express.json()); // [cite: 338]
app.use(express.urlencoded({ extended: true })); // [cite: 339]

// 3. Cấu hình View Engine (EJS)
configViewEngine(app); // [cite: 340]

// 4. Khai báo Route cho Giao diện (Web View) - PHẦN BẠN ĐANG THIẾU
const webAPI = express.Router(); // [cite: 345]
webAPI.get("/", getHomepage); // Gọi hàm render index.ejs [cite: 347, 563]
app.use('/', webAPI); // [cite: 350]

// 5. Khai báo Route cho API
app.use('/v1/api/', apiRoutes); // [cite: 356]

// 6. Khởi chạy server và kết nối Database
(async () => {
    try {
        // Kết nối database bằng mongoose [cite: 370]
        await connection();
        app.listen(port, () => {
            console.log(`Backend Nodejs App listening on port ${port}`); // [cite: 373]
        });
    } catch (error) {
        console.log(">>> Error connect to DB: ", error); // [cite: 379, 380]
    }
})();