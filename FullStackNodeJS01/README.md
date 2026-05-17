# BÀI TẬP 03: PHÁT TRIỂN ỨNG DỤNG FULLSTACK (EXPRESSJS, REACTJS, API & MONGODB)
## MÔN HỌC: CÁC CÔNG NGHỆ PHÂN MỀM MỚI (CCNPMM) - MTSE431179

---

## 👨‍🎓 THÔNG TIN SINH VIÊN

* **Họ và tên:** Nguyễn Quốc Khánh
* **Mã số sinh viên (MSSV):** 23110239
* **Lớp:** CCNPMM (Các Công Nghệ Phần Mềm Mới)
* **Bài tập:** Bài tập 03 - Tích hợp Hệ thống Authentication Full-Stack với JWT, ExpressJS, ReactJS và MongoDB

---

## 📝 TỔNG QUAN DỰ ÁN

Dự án này là sản phẩm hoàn thiện của **Bài tập 03**, thực hiện xây dựng một ứng dụng web Full-Stack hoàn chỉnh bao gồm:
1. **Backend (ExpressJS01):** Xây dựng RESTful API sử dụng NodeJS & Express, kết nối cơ sở dữ liệu MongoDB thông qua Mongoose ODM, mã hóa mật khẩu, thực hiện xác thực người dùng bằng cơ chế JWT (JSON Web Token), và viết các middleware bảo mật.
2. **Frontend (reactjs01):** Giao diện Single Page Application (SPA) xây dựng bằng ReactJS (Vite), sử dụng thư viện UI cao cấp **Ant Design (antd)**, quản lý định tuyến với **React Router DOM v6**, đồng bộ trạng thái đăng nhập toàn cục với **React Context API** và xử lý truyền nhận dữ liệu tự động gắn token qua **Axios Interceptor**.

---

## 🚀 CÁC TÍNH NĂNG ĐÃ HOÀN THÀNH

### 1. ⚙️ Phía Backend (ExpressJS01)
* **Kết nối MongoDB:** Thiết lập kết nối thành công tới Database `fullstack02` trên MongoDB Local/Atlas sử dụng thư viện `mongoose` đảm bảo hoạt động bất đồng bộ (`async/await`).
* **Hệ thống API RESTful hoàn chỉnh (`/v1/api/`):**
  * `POST /register`: Tiếp nhận thông tin đăng ký người dùng mới (Name, Email, Password). Thực hiện mã hóa mật khẩu bảo mật và lưu vào database.
  * `POST /login`: Kiểm tra thông tin tài khoản, tạo mã thông báo bảo mật JWT chứa thông tin định danh và trả về cho client.
  * `POST /forgot-password`: Tiếp nhận yêu cầu đặt lại mật khẩu của người dùng qua email.
  * `POST /reset-password`: Thực hiện cập nhật mật khẩu mới an toàn.
  * `GET /user` *(Protected API)*: Lấy danh sách toàn bộ người dùng có trong cơ sở dữ liệu MongoDB để hiển thị trên Dashboard.
  * `GET /account` *(Protected API)*: Xác minh mã token của người dùng hiện tại và trả về thông tin cá nhân.
* **Xây dựng hệ thống Middleware thông minh:**
  * `auth.js` *(Authentication Middleware)*: Trích xuất JWT Token từ HTTP Header `Authorization: Bearer <token>`, tiến hành giải mã, kiểm tra tính hợp lệ và đính kèm thông tin user vào request.
  * `delay.js` *(Simulation Middleware)*: Giả lập độ trễ mạng mạng (ví dụ: 1-2 giây) giúp việc kiểm thử giao diện phía client (chờ load, hiển thị trạng thái loading spinner) trở nên chân thực hơn.
  * `cors`: Giải quyết triệt để lỗi chặn tài nguyên chéo nguồn khi ReactJS (port `5173`) gọi API tới ExpressJS (port `8080`).
* **Cơ chế cấu hình linh hoạt:** Tích hợp `dotenv` để tách biệt cấu hình môi trường (Port, JWT Secret Key, MongoDB URI) ra khỏi mã nguồn chính.

---

### 2. 💻 Phía Frontend (reactjs01)
* **Công nghệ & Thẩm mỹ:**
  * Khởi tạo dự án tối ưu bằng **Vite** mang lại tốc độ biên dịch cực nhanh.
  * Sử dụng thư viện **Ant Design (antd)** để thiết kế giao diện: Các Form đăng nhập/đăng ký có tính năng kiểm tra lỗi (validation) thời gian thực, bảng dữ liệu (Table) trực quan, và các thông báo đẹp mắt (`notification`, `message`).
* **Hệ thống định tuyến nâng cao (React Router DOM v6):**
  * Khai báo cấu trúc Router dạng cây lồng nhau (`createBrowserRouter`, `RouterProvider`, `<Outlet />`).
  * Tích hợp thành công thanh điều hướng chung (`Header`) hiển thị động tùy thuộc trạng thái người dùng (Đã đăng nhập / Chưa đăng nhập).
* **Quản lý trạng thái đăng nhập toàn cục (Auth Context):**
  * Tạo `AuthContext` và `AuthWrapper` để lưu trữ dữ liệu người dùng (`name`, `email`) và trạng thái xác thực `isAuthenticated` trên toàn ứng dụng.
  * Xử lý thông minh trạng thái **Tự động đăng nhập lại (Auto-Login)** khi F5/reload trang: Hệ thống tự động gọi API `GET /v1/api/account` để lấy thông tin cá nhân mới nhất nếu phát hiện có mã token trong bộ nhớ.
  * Quản lý trạng thái tải ứng dụng (`appLoading`) kết hợp hiển thị màn hình chờ Spinner (`<Spin size="large" />`) chuyên nghiệp khi đang xác thực token.
* **Các trang chức năng hoàn chỉnh:**
  * **Trang chủ (`/`):** Giới thiệu thông tin dự án bài tập và giao diện chào mừng ấn tượng.
  * **Đăng ký (`/register`):** Form nhập thông tin đầy đủ, thông báo trực quan khi đăng ký thành công hoặc báo lỗi trùng lặp email.
  * **Đăng nhập (`/login`):** Nhận JWT từ Backend, lưu vào `localStorage` dưới khóa `access_token` để duy trì phiên làm việc, cập nhật Context và chuyển hướng người dùng.
  * **Quên mật khẩu (`/forgot-password`):** Giao diện tương tác giúp người dùng gửi yêu cầu khôi phục và đặt lại mật khẩu mới.
  * **Quản lý người dùng (`/user`):** Protected route - chỉ hiển thị danh sách người dùng lấy từ MongoDB dạng bảng biểu khi đã đăng nhập thành công.
* **Axios Interceptor tự động hóa:**
  * Cấu hình instance `axios.customize.js` giúp tự động chèn token từ `localStorage` vào header `Authorization` cho toàn bộ các request gửi lên server mà không cần khai báo thủ công ở từng hàm.
  * Định dạng trước dữ liệu trả về (response interceptor) giúp code phía component ngắn gọn và dễ bảo trì.

---

## 📁 CẤU TRÚC THƯ MỤC CHÍNH

Dưới đây là sơ đồ thư mục mã nguồn chính của bài tập:

```text
FullStackNodeJS01/
├── ExpressJS01/                      # THƯ MỤC MÃ NGUỒN BACKEND (NODEJS & EXPRESS)
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js          # Kết nối MongoDB bằng Mongoose
│   │   │   └── viewEngine.js        # Cấu hình EJS View Engine
│   │   ├── controllers/
│   │   │   ├── apiController.js     # Xử lý Logic Auth APIs (Register, Login, Account, v.v.)
│   │   │   └── homeController.js    # Render trang chủ EJS
│   │   ├── middleware/
│   │   │   ├── auth.js              # Middleware kiểm tra và giải mã JWT
│   │   │   └── delay.js             # Middleware giả lập trễ mạng
│   │   ├── models/
│   │   │   └── user.js              # Mongoose User Schema & Model (Name, Email, Password)
│   │   ├── routes/
│   │   │   └── api.js               # Khai báo các Endpoint Router API
│   │   ├── views/                   # Template EJS
│   │   └── server.js                # Điểm khởi chạy chính của Server Express
│   ├── .env                         # Lưu trữ các biến môi trường (PORT, MONGO_DB_URL, JWT_SECRET...)
│   └── package.json                 # Khai báo Dependencies phía Backend (express, mongoose, jsonwebtoken, cors, bcrypt...)
│
├── reactjs01/                        # THƯ MỤC MÃ NGUỒN FRONTEND (REACTJS + VITE)
│   ├── src/
│   │   ├── components/
│   │   │   ├── context/
│   │   │   │   └── auth.context.jsx # Quản lý và cung cấp Auth State toàn cục
│   │   │   └── layout/
│   │   │       └── layout/
│   │   │           └── header.jsx   # Thanh điều hướng chung (Navigation Bar)
│   │   ├── pages/
│   │   │   ├── forgot-password.jsx  # Giao diện đặt lại mật khẩu
│   │   │   ├── home.jsx             # Giao diện Trang chủ giới thiệu
│   │   │   ├── login.jsx            # Giao diện Đăng nhập người dùng
│   │   │   ├── register.jsx         # Giao diện Đăng ký tài khoản mới
│   │   │   └── user.jsx             # Danh sách người dùng lấy từ MongoDB (Protected)
│   │   ├── styles/
│   │   │   └── global.css           # CSS tùy chỉnh toàn cục
│   │   ├── util/
│   │   │   ├── api.js               # Định nghĩa các hàm gọi API (createUser, login, getUser...)
│   │   │   └── axios.customize.js   # Cấu hình Axios & Tự động gắn Bearer Token
│   │   ├── App.jsx                  # Điểm bọc Layout chính và kiểm tra Token khi reload
│   │   └── main.jsx                 # Cấu hình Routing và khởi chạy ứng dụng React
│   ├── .env                         # Lưu URL kết nối Backend (VITE_BACKEND_URL)
│   └── package.json                 # Khai báo Dependencies phía Frontend (react, react-router-dom, antd, axios...)
└── README.md                        # File tài liệu hướng dẫn bài tập (File này)
```

---

## 🛠️ HƯỚNG DẪN CÀI ĐẶT VÀ CHẠY ỨNG DỤNG

Đảm bảo máy tính của bạn đã cài đặt sẵn **Node.js** và **MongoDB Local** đang hoạt động (hoặc có chuỗi kết nối MongoDB Atlas).

### Bước 1: Khởi chạy Backend ExpressJS
1. Mở cửa sổ Terminal mới và di chuyển vào thư mục `ExpressJS01`:
   ```bash
   cd ExpressJS01
   ```
2. Cài đặt các gói thư viện cần thiết:
   ```bash
   npm install
   ```
3. Tạo file `.env` tại thư mục gốc của `ExpressJS01` (nếu chưa có) và cấu hình các giá trị phù hợp:
   ```env
   NODE_ENV=development
   PORT=8080
   MONGO_DB_URL=mongodb://localhost:27017/fullstack02
   JWT_SECRET=mot_chuoi_bi_mat_bat_ky
   JWT_EXPIRE=1d
   ```
4. Khởi động máy chủ API:
   ```bash
   npm start
   # Hoặc nếu chạy chế độ develop để tự động reload code:
   npm run dev
   ```
   *Server backend sẽ chạy tại: **http://localhost:8080***

---

### Bước 2: Khởi chạy Frontend ReactJS
1. Mở cửa sổ Terminal thứ hai và di chuyển vào thư mục `reactjs01`:
   ```bash
   cd reactjs01
   ```
2. Cài đặt các gói thư viện cần thiết:
   ```bash
   npm install
   ```
3. Đảm bảo file `.env` của frontend chứa chính xác địa chỉ API backend:
   ```env
   VITE_BACKEND_URL=http://localhost:8080
   ```
4. Khởi chạy dự án ReactJS:
   ```bash
   npm run dev
   ```
   *Giao diện người dùng sẽ chạy tại: **http://localhost:5173***

---

## 💡 KẾT LUẬN & ĐÁNH GIÁ KẾT QUẢ BÀI TẬP

* **Xác thực an toàn và tiện lợi:** Nhờ cơ chế JWT Token được lưu ở `localStorage` và xử lý thông qua `Axios Request Interceptor`, người dùng không cần phải đăng nhập lại mỗi khi tải lại trang, tăng đáng kể trải nghiệm sử dụng (UX).
* **Phân quyền và bảo vệ tài nguyên:** Trang quản trị người dùng `/user` hoàn toàn được bảo vệ. Nếu người dùng chưa đăng nhập cố tình truy cập trực tiếp bằng đường dẫn, hệ thống React Router kết hợp Auth Context sẽ kiểm tra và hiển thị các cảnh báo thích hợp hoặc chặn truy xuất dữ liệu từ API được bảo vệ.
* **Giao diện hiện đại, mượt mà:** Ant Design đem lại các hiệu ứng nút bấm, thanh điều hướng và thông báo dạng popup sống động, trực quan và chuyên nghiệp.

Dự án đã đáp ứng hoàn hảo và vượt mong đợi các tiêu chí kỹ thuật được yêu cầu trong tài liệu hướng dẫn của môn học **Các công nghệ phần mềm mới (Bài tập 03)**!
