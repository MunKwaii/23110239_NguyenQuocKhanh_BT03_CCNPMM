# BÀI TẬP 05: HỆ THỐNG LAZY LOADING DANH MỤC & PHÂN TRANG NGANG TOP PRODUCTS
## MÔN HỌC: CÁC CÔNG NGHỆ PHÂN MỀM MỚI (CCNPMM) - MTSE431179

---

## 👨‍🎓 THÔNG TIN SINH VIÊN

* **Họ và tên:** Nguyễn Quốc Khánh
* **Mã số sinh viên (MSSV):** 23110239
* **Lớp:** CCNPMM (Các Công Nghệ Phần Mềm Mới)
* **Bài tập:** Bài tập 05 - Hiển thị sản phẩm theo danh mục sử dụng Lazy Loading và Top 10 Bán chạy / Xem nhiều có Phân trang ngang (Full-Stack ExpressJS + ReactJS + MongoDB)
* **Yêu cầu:** Thực hiện cả API + UI, thiết kế giao diện Dark Theme cao cấp và triển khai hoàn thiện các giải pháp tối ưu.

---

## 📝 TỔNG QUAN BÀI TẬP 05

Bài tập này kế thừa hệ thống bán hàng Hi-End và nâng cấp mạnh mẽ các kỹ thuật tối ưu hóa trải nghiệm người dùng (UX) và hiệu năng mạng (Performance) thông qua hai chức năng cốt lõi:

1. **Hiển thị sản phẩm theo Danh mục kết hợp Lazy Loading (Cuộn vô hạn):**
   * Tải danh mục động từ cơ sở dữ liệu MongoDB để dựng hệ thống tab phân loại sang trọng.
   * Áp dụng **Intersection Observer API** gốc của trình duyệt để theo dõi phần tử cuối cùng của danh sách. Khi người dùng cuộn đến đáy, hệ thống tự động tăng trang (`page = page + 1`) và nạp nối tiếp sản phẩm tiếp theo mà không cần tải lại trang.
   * Tích hợp nút nhấn thủ công dự phòng và dòng chữ thông báo tinh tế khi đã tải hết sản phẩm trong danh mục.
2. **Top 10 Bán Chạy & Top 10 Xem Nhiều nhất có Phân trang ngang (Horizontal Pagination):**
   * **Đo lường lượt xem thực tế (Views Counter):** Bổ sung trường `views` trong Schema và tự động tích lũy lượt xem bằng thuật toán `$inc` mỗi khi người dùng xem chi tiết sản phẩm.
   * **API Gộp Top Products:** Truy vấn đồng thời 10 sản phẩm bán chạy nhất (`sold: -1`) và 10 sản phẩm xem nhiều nhất (`views: -1`) trong **1 request duy nhất** giúp tăng tốc độ tải trang chủ.
   * **Giao diện Trượt Ngang Phân Trang (Horizontal Slider Carousel):** Hiển thị danh sách sản phẩm dạng trượt ngang (4 sản phẩm/trang) với các phím điều hướng Trái/Phải glassmorphism cùng hàng dấu chấm định vị (pagination dots) chuyển trang vô cùng mượt mà.

---

## ✨ CÁC TÍNH NĂNG CHI TIẾT ĐÃ HOÀN THÀNH

### 1. 📂 Trang Danh Mục Sản Phẩm & Lazy Loading (`/categories`)
* **Tab Danh Mục Động:** Gọi API `getFilterMetaApi` để lấy toàn bộ danh mục thực tế trong database (như `headphones`, `earbuds`, `speakers`) rồi sinh ra các tab tương ứng cùng nút "Tất cả".
* **Cuộn vô hạn thông minh (Intersection Observer):**
  * Tự động quan sát thẻ card sản phẩm cuối cùng. Khi thẻ này lộ diện vào khung nhìn, React gọi API nạp thêm dữ liệu của trang tiếp theo.
  * Tải tối ưu: Sử dụng cấu hình `limit = 4` sản phẩm/trang trong giai đoạn thử nghiệm để dễ quan sát hoạt động của Lazy Loading.
* **Xử lý Race Condition triệt để:** Khi người dùng chuyển đổi cực nhanh giữa các danh mục khác nhau, hệ thống tự động reset danh sách, đưa trang về 1 và hủy các tác vụ nạp cũ tránh việc hiển thị sai dữ liệu bất đồng bộ.
* **Thông báo kết thúc:** Hiển thị dòng chữ lung linh `✨ Bạn đã xem hết tất cả X sản phẩm của danh mục này! ✨` khi số lượng sản phẩm hiển thị đạt mức tối đa.

### 2. 🏆 Trang Chủ & Phân Trang Ngang Top Products (`/`)
* **API Tốc Độ Cao:** Endpoint `/v1/api/products/top` trả về kết quả gộp của hai nhóm sản phẩm hàng đầu:
  * **Top 10 Bán chạy nhất:** Định giá theo thuộc tính `sold` giảm dần.
  * **Top 10 Xem nhiều nhất:** Định giá theo thuộc tính `views` giảm dần.
* **Tự động Đo Lường Lượt Xem (Views Tracking):** Khi người dùng nhấp vào chi tiết bất kỳ sản phẩm nào (`/product/:id`), server tự động tăng lượt xem của sản phẩm đó trong database MongoDB, giúp cập nhật danh sách "Xem nhiều nhất" theo thời gian thực.
* **Giao Diện Trượt Phân Trang (Horizontal Pagination Slider):**
  * Chia 10 sản phẩm thành 3 trang hiển thị ngang (Trang 1: 4 sp, Trang 2: 4 sp, Trang 3: 2 sp).
  * Hai nút mũi tên Trái/Phải (`⟨`, `⟩`) hỗ trợ xoay vòng slide liên tục.
  * Chấm tròn pagination biểu thị trạng thái trang hiện tại, hỗ trợ click chuyển slide nhanh chóng.
  * Tự động tính toán hiển thị card ẩn giữ nguyên cấu trúc lưới của trang chủ khi trang cuối cùng bị thiếu sản phẩm.
* **Thẻ sản phẩm trực quan:** Hiển thị huy hiệu `HOT` đính kèm lượt bán (`Đã bán X`) và huy hiệu `XEM NHIỀU` đính kèm lượt xem (`👁 X xem`) tương ứng.

---

## 📁 CẤU TRÚC THƯ MỤC CẬP NHẬT (BÀI TẬP 05)

```text
FullStackNodeJS01/
├── ExpressJS01/                      # MÃ NGUỒN BACKEND EXPRESSJS
│   ├── src/
│   │   ├── models/
│   │   │   └── product.js           # [CẬP NHẬT] Thêm trường views vào productSchema
│   │   ├── controllers/
│   │   │   └── productController.js # [CẬP NHẬT] Thêm API getTopProducts & cộng dồn views trong getProductById
│   │   └── routes/
│   │       └── api.js               # [CẬP NHẬT] Đăng ký API /products/top trước /products/:id
│   ├── seed.js                      # [CẬP NHẬT] Mở rộng lên 25 sản phẩm cao cấp, gán views ngẫu nhiên
│   └── package.json
│
├── reactjs01/                        # MÃ NGUỒN FRONTEND REACTJS (VITE)
│   ├── src/
│   │   ├── pages/
│   │   │   ├── home.jsx             # [CẬP NHẬT] Dựng 2 bộ HorizontalSlider cho Bán chạy & Xem nhiều
│   │   │   └── categories.jsx       # [MỚI] Trang danh mục lazy loading cuộn vô hạn (Intersection Observer)
│   │   ├── util/
│   │   │   └── api.js               # [CẬP NHẬT] Đăng ký gọi API getTopProductsApi
│   │   └── main.jsx                 # Khai báo cây Router định tuyến trang Danh mục
│   └── package.json
└── README.md                        # Hướng dẫn chi tiết Bài tập 05 (File này)
```

---

## 🛠️ HƯỚNG DẪN CÀI ĐẶT VÀ KHỞI CHẠY DỰ ÁN

### Bước 1: Thiết lập Cơ sở dữ liệu và nạp dữ liệu mẫu (Seed Data)
1. Mở terminal và chuyển vào thư mục backend:
   ```bash
   cd ExpressJS01
   ```
2. Cài đặt các thư viện:
   ```bash
   npm install
   ```
3. Tạo file cấu hình `.env` trong thư mục `ExpressJS01` nếu chưa có:
   ```env
   NODE_ENV=development
   PORT=8080
   MONGO_DB_URL=mongodb://localhost:27017/fullstack02
   JWT_SECRET=mot_chuoi_bi_mat_bat_ky
   JWT_EXPIRE=1d
   ```
4. Khởi chạy tập lệnh nạp dữ liệu mẫu để tạo sẵn **25 sản phẩm cao cấp** với đầy đủ các ảnh trình chiếu, số lượng bán và lượt xem giả lập:
   ```bash
   node seed.js
   ```
   *Màn hình hiển thị thông báo nạp thành công 25 sản phẩm cùng phân bố phổ giá.*

5. Khởi động máy chủ API backend:
   ```bash
   npm run dev
   ```
   *Backend API sẵn sàng hoạt động tại: **http://localhost:8080***

---

### Bước 2: Thiết lập và Khởi chạy Frontend ReactJS
1. Mở một terminal mới và chuyển vào thư mục frontend:
   ```bash
   cd reactjs01
   ```
2. Cài đặt các thư viện:
   ```bash
   npm install
   ```
3. Tạo/kiểm tra file `.env` tại thư mục `reactjs01` đảm bảo trỏ đúng cổng của Backend:
   ```env
   VITE_BACKEND_URL=http://localhost:8080
   ```
4. Khởi chạy server phát triển giao diện:
   ```bash
   npm run dev
   ```
   *Giao diện người dùng sẵn sàng tại: **http://localhost:5173***

---

## 💡 ĐÁNH GIÁ CHẤT LƯỢNG KỸ THUẬT (BÀI TẬP 05)

* **Giải pháp Lazy Loading hiện đại:** Sử dụng Intersection Observer API là giải pháp tối ưu nhất hiện nay trong các ứng dụng web thực tế, giúp trình duyệt chạy cực kỳ nhẹ nhàng so với việc lắng nghe sự kiện cuộn chuột (`window.addEventListener('scroll')`) truyền thống vốn rất dễ gây giật/lag.
* **Xử lý UX đỉnh cao ở Frontend:** Giao diện Dark Theme kết hợp hiệu ứng kính mờ (glassmorphism), các slide trượt ngang phân trang vô cùng tinh tế, hỗ trợ định vị chấm tròn và xoay vòng lặp vô hạn mang lại cảm giác mượt mà như một trang e-commerce thương mại đẳng cấp quốc tế.
* **Tối ưu hóa tài nguyên mạng:** Phục vụ dữ liệu Top Products gộp chỉ trong 1 request duy nhất làm giảm thiểu độ trễ mạng RTT (Round Trip Time) và hạn chế việc tạo kết nối thừa lên cơ sở dữ liệu MongoDB.

Hệ thống đã được kiểm thử toàn diện và hoạt động vô cùng trơn tru!
