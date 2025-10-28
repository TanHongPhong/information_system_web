# Hệ Thống Quản Lý Logistics 🚚

Hệ thống quản lý vận chuyển và logistics được xây dựng với **React + Express + PostgreSQL (Neon)**

## 🏗️ Cấu Trúc Dự Án

```
project/
├── backend/          # Server API (Express.js + PostgreSQL)
├── frontend/         # React UI (Vite + TailwindCSS)
└── html/            # HTML prototypes (reference)
```

## 🚀 Cài Đặt & Chạy Dự Án

### Prerequisites
- Node.js >= 18
- npm hoặc yarn
- PostgreSQL database (Neon recommended)

### 1️⃣ Backend Setup

```bash
# Di chuyển vào thư mục backend
cd backend

# Cài đặt dependencies
npm install

# Tạo file .env (copy từ .env.example nếu có)
# Thêm connection string của Neon database
```

**File `.env` cần có:**
```env
PORT=5001
NODE_ENV=development
PSQLDB_CONNECTIONSTRING=postgresql://username:password@host.neon.tech/database?sslmode=require
```

**Chạy backend:**
```bash
# Development mode (với nodemon - auto reload)
npm run dev

# Production mode
npm start
```

Backend sẽ chạy tại: `http://localhost:5001`

### 2️⃣ Frontend Setup

```bash
# Di chuyển vào thư mục frontend
cd frontend

# Cài đặt dependencies
npm install

# Chạy development server
npm run dev
```

Frontend sẽ chạy tại: `http://localhost:5173`

### 3️⃣ Build Production

**Backend:**
```bash
cd backend
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
# Output: frontend/dist/
```

## 📡 API Endpoints

### Test Connection
```
GET /api/test
```
Kiểm tra kết nối API và database

### Transport Companies
```
GET /api/transport-companies
GET /api/transport-companies/:id
```
Query parameters:
- `q` - Tìm kiếm theo tên/địa chỉ
- `area` - Lọc theo khu vực
- `vehicle_type` - Lọc theo loại xe
- `min_rating` - Rating tối thiểu
- `max_cost_per_km` - Giá tối đa mỗi km

**Ví dụ:**
```bash
curl "http://localhost:5001/api/transport-companies?min_rating=4.5"
curl "http://localhost:5001/api/transport-companies/1"
```

## 🗄️ Database Schema

### LogisticsCompany
- `company_id` (PK)
- `company_name`
- `address`
- `phone`
- `rating`
- `description`

### CompanyCoverage
- `coverage_id` (PK)
- `company_id` (FK)
- `area_name`

### CarrierRate
- `rate_id` (PK)
- `company_id` (FK)
- `vehicle_type`
- `cost_per_km`

## 🛠️ Tech Stack

### Backend
- **Express.js 5** - Web framework
- **PostgreSQL (Neon)** - Database
- **node-postgres (pg)** - PostgreSQL client
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variables

### Frontend
- **React 19** - UI framework
- **Vite** - Build tool
- **React Router 7** - Routing
- **TailwindCSS 4** - Styling
- **Axios** - HTTP client
- **Framer Motion** - Animations
- **Lucide React** - Icons
- **Leaflet** - Maps
- **Chart.js** - Charts

## 📂 Các Trang Chính

| Route | Mô Tả |
|-------|-------|
| `/` | Dashboard Admin |
| `/home-page` | Trang chủ khách hàng |
| `/sign-in` | Đăng nhập |
| `/transport-companies` | Danh sách công ty vận chuyển |
| `/vehicle-list` | Danh sách xe |
| `/nhap-in4` | Nhập thông tin đơn hàng |
| `/payment-qr` | Thanh toán QR |
| `/payment-history` | Lịch sử giao dịch |
| `/order-tracking` | Theo dõi đơn hàng |
| `/quan-li-doi-xe` | Quản lý đội xe |
| `/driver` | Giao diện tài xế |
| `/warehouse` | Quản lý kho |

## 🔧 Development

### Backend
```bash
cd backend
npm run dev    # Auto-reload với nodemon
```

### Frontend
```bash
cd frontend
npm run dev    # Hot reload với Vite
```

## ✅ Các Vấn Đề Đã Sửa

- ✅ Xóa MongoDB/Mongoose (chỉ dùng PostgreSQL)
- ✅ Fix duplicate imports trong server.js
- ✅ Fix missing `getData` function
- ✅ Sửa package.json scripts path
- ✅ Kết nối frontend với backend API
- ✅ Thêm loading & error states
- ✅ Cấu hình CORS đúng
- ✅ Axios instance với base URL

## 📝 TODO

- [ ] Thêm authentication/authorization
- [ ] Thêm validation cho API inputs
- [ ] Implement real-time tracking với WebSocket
- [ ] Thêm unit tests
- [ ] Thêm API documentation (Swagger)
- [ ] Deploy to production

## 📞 Support

Nếu gặp vấn đề, hãy kiểm tra:
1. Backend server đã chạy chưa? (`http://localhost:5001/api/test`)
2. File `.env` đã cấu hình đúng chưa?
3. Database connection string có hợp lệ không?
4. CORS có được enable không? (check console browser)

## 📄 License

ISC

