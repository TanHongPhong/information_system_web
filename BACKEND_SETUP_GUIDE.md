# 🚀 Hướng dẫn chạy Backend

## 📋 Yêu cầu hệ thống

- Node.js (v16 trở lên)
- PostgreSQL database (Neon hoặc local)
- npm hoặc yarn

## 🔧 Bước 1: Cài đặt Dependencies

Mở terminal và di chuyển vào thư mục backend:

```bash
cd backend
npm install
```

Dependencies cần thiết:
- `express` - Web framework
- `dotenv` - Environment variables
- `cors` - Cross-Origin Resource Sharing
- `pg` - PostgreSQL client

## 🗄️ Bước 2: Setup Database

### Option A: Sử dụng Neon (Cloud PostgreSQL - Recommended)

1. **Tạo tài khoản Neon**:
   - Truy cập: https://neon.tech
   - Sign up miễn phí
   - Tạo project mới

2. **Lấy Connection String**:
   - Vào project → Dashboard
   - Copy connection string (dạng: `postgresql://user:pass@host/database`)

### Option B: Sử dụng PostgreSQL Local

1. **Cài đặt PostgreSQL**:
   - Download: https://www.postgresql.org/download/
   - Install và setup password

2. **Tạo Database**:
```sql
CREATE DATABASE logistics_db;
```

## 📝 Bước 3: Tạo file .env

Tạo file `.env` trong thư mục `backend/`:

```bash
cd backend
# Windows
type nul > .env

# Mac/Linux
touch .env
```

Thêm nội dung vào file `.env`:

```env
# Server Port
PORT=5001

# Database URL (Neon hoặc Local PostgreSQL)
DATABASE_URL=postgresql://user:password@host:port/database

# Environment
NODE_ENV=development
```

**Ví dụ với Neon:**
```env
PORT=5001
DATABASE_URL=postgresql://myuser:mypass@ep-cool-name-123.us-east-2.aws.neon.tech/logistics_db?sslmode=require
NODE_ENV=development
```

**Ví dụ với Local PostgreSQL:**
```env
PORT=5001
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/logistics_db
NODE_ENV=development
```

## 🗃️ Bước 4: Tạo Database Schema

Tạo file `backend/setup-db.sql` với nội dung:

```sql
-- Tạo bảng LogisticsCompany
CREATE TABLE IF NOT EXISTS "LogisticsCompany" (
  company_id SERIAL PRIMARY KEY,
  company_name VARCHAR(255) NOT NULL,
  address TEXT,
  phone VARCHAR(20),
  rating DECIMAL(3,2) DEFAULT 0,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tạo bảng CompanyCoverage (Khu vực hoạt động)
CREATE TABLE IF NOT EXISTS "CompanyCoverage" (
  coverage_id SERIAL PRIMARY KEY,
  company_id INTEGER REFERENCES "LogisticsCompany"(company_id) ON DELETE CASCADE,
  area_name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tạo bảng CarrierRate (Giá cước)
CREATE TABLE IF NOT EXISTS "CarrierRate" (
  rate_id SERIAL PRIMARY KEY,
  company_id INTEGER REFERENCES "LogisticsCompany"(company_id) ON DELETE CASCADE,
  vehicle_type VARCHAR(50) NOT NULL,
  cost_per_km DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert dữ liệu mẫu
INSERT INTO "LogisticsCompany" (company_name, address, phone, rating, description) VALUES
  ('Gemadept Logistics', '123 Nguyễn Huệ, Q.1, TP.HCM', '1900 1234', 4.8, 'Công ty logistics hàng đầu Việt Nam với mạng lưới toàn quốc'),
  ('Transimex Logistics', '456 Lê Lợi, Q.1, TP.HCM', '1900 5678', 4.6, 'Chuyên vận chuyển hàng lạnh và hàng tiêu dùng'),
  ('DHL Supply Chain', '789 Võ Văn Tần, Q.3, TP.HCM', '1900 9999', 4.9, 'Dịch vụ logistics quốc tế với tracking GPS realtime'),
  ('Viettel Post', '234 Điện Biên Phủ, Q.3, TP.HCM', '1900 8095', 4.5, 'Mạng lưới rộng khắp với chi phí cạnh tranh'),
  ('GHTK Express', '567 Cách Mạng Tháng 8, Q.10, TP.HCM', '1900 2222', 4.3, 'Giao hàng nhanh trong ngày với giá rẻ'),
  ('Kerry Logistics', '890 Trường Sơn, Q.Tân Bình, TP.HCM', '1900 3333', 4.7, 'Logistics chuyên nghiệp với dịch vụ cao cấp');

-- Insert khu vực hoạt động
INSERT INTO "CompanyCoverage" (company_id, area_name) VALUES
  (1, 'Toàn quốc'),
  (2, 'Miền Nam'),
  (3, 'Nội thành HCM'),
  (3, 'Liên tỉnh'),
  (4, 'Toàn quốc'),
  (5, 'Nội thành HCM'),
  (6, 'Miền Nam'),
  (6, 'Liên tỉnh');

-- Insert giá cước
INSERT INTO "CarrierRate" (company_id, vehicle_type, cost_per_km) VALUES
  (1, '≤ 2 tấn', 15000),
  (1, '≤ 4 tấn', 20000),
  (1, 'Container 20ft', 35000),
  (1, 'Container 40ft', 50000),
  (2, '≤ 2 tấn', 12000),
  (2, '≤ 4 tấn', 18000),
  (2, 'Xe lạnh', 25000),
  (3, '≤ 2 tấn', 18000),
  (3, '≤ 4 tấn', 24000),
  (3, 'Container 20ft', 40000),
  (4, '≤ 2 tấn', 11000),
  (4, '≤ 4 tấn', 16000),
  (5, '≤ 2 tấn', 9500),
  (6, '≤ 2 tấn', 16000),
  (6, '≤ 4 tấn', 22000),
  (6, 'Container 20ft', 38000),
  (6, 'Container 40ft', 55000);
```

**Chạy SQL script:**

### Với Neon:
1. Mở Neon Console → SQL Editor
2. Paste toàn bộ nội dung file `setup-db.sql`
3. Click "Run"

### Với PostgreSQL Local:
```bash
# Windows (PowerShell)
psql -U postgres -d logistics_db -f setup-db.sql

# Mac/Linux
psql -U postgres -d logistics_db -f setup-db.sql
```

## ✅ Bước 5: Test Database Connection

Tạo file test: `backend/test-db.js`

```javascript
import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL.includes('neon.tech') 
    ? { rejectUnauthorized: false } 
    : false
});

async function testConnection() {
  try {
    const { rows } = await pool.query('SELECT NOW()');
    console.log('✅ Database connected successfully!');
    console.log('Current time:', rows[0].now);
    
    // Test query companies
    const companies = await pool.query('SELECT * FROM "LogisticsCompany"');
    console.log(`\n✅ Found ${companies.rows.length} companies in database`);
    companies.rows.forEach(c => {
      console.log(`  - ${c.company_name} (Rating: ${c.rating})`);
    });
    
    await pool.end();
  } catch (err) {
    console.error('❌ Database connection error:', err.message);
    process.exit(1);
  }
}

testConnection();
```

**Chạy test:**
```bash
cd backend
node test-db.js
```

**Expected output:**
```
✅ Database connected successfully!
Current time: 2025-10-28T...
✅ Found 6 companies in database
  - Gemadept Logistics (Rating: 4.80)
  - Transimex Logistics (Rating: 4.60)
  - DHL Supply Chain (Rating: 4.90)
  ...
```

## 🚀 Bước 6: Chạy Backend Server

### Development mode (auto-restart khi có thay đổi):

```bash
cd backend
npm run dev
```

### Production mode:

```bash
cd backend
npm start
```

**Expected output:**
```
✅ Server running on http://localhost:5001
```

## 🧪 Bước 7: Test API Endpoints

### Test 1: Health Check

```bash
# Windows (PowerShell)
Invoke-WebRequest -Uri http://localhost:5001/api/test

# Mac/Linux
curl http://localhost:5001/api/test
```

**Expected response:**
```json
{
  "message": "API is working! ✅",
  "database": "Connected to Neon PostgreSQL",
  "timestamp": "2025-10-28T..."
}
```

### Test 2: Get Companies

```bash
# Windows (PowerShell)
Invoke-WebRequest -Uri http://localhost:5001/api/transport-companies

# Mac/Linux
curl http://localhost:5001/api/transport-companies
```

**Expected response:**
```json
[
  {
    "company_id": 1,
    "name": "Gemadept Logistics",
    "address": "123 Nguyễn Huệ, Q.1, TP.HCM",
    "phone": "1900 1234",
    "rating": "4.80",
    "description": "...",
    "areas": ["Toàn quốc"],
    "rates": [
      {
        "vehicle_type": "≤ 2 tấn",
        "cost_per_km": "15000.00"
      }
    ]
  },
  ...
]
```

### Test 3: Get Company by ID

```bash
curl http://localhost:5001/api/transport-companies/1
```

## 🌐 Bước 8: Chạy Frontend + Backend cùng lúc

### Terminal 1 - Backend:
```bash
cd backend
npm run dev
```

### Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
```

**Sau đó:**
1. Mở browser: `http://localhost:5173/transport-companies`
2. Trang sẽ load dữ liệu từ backend
3. Nếu thấy loading spinner → backend đang xử lý
4. Nếu thấy danh sách công ty → ✅ Thành công!

## 🐛 Troubleshooting

### Lỗi 1: "Cannot connect to database"

**Nguyên nhân:** DATABASE_URL sai hoặc database không tồn tại

**Giải pháp:**
1. Kiểm tra file `.env` có DATABASE_URL đúng không
2. Test connection: `node test-db.js`
3. Với Neon: Check project có active không
4. Với Local: Check PostgreSQL service đang chạy

```bash
# Windows - Check PostgreSQL service
Get-Service postgresql*

# Mac - Check PostgreSQL
brew services list | grep postgresql

# Linux - Check PostgreSQL
sudo systemctl status postgresql
```

### Lỗi 2: "Port 5001 already in use"

**Giải pháp:**

```bash
# Windows - Tìm và kill process
netstat -ano | findstr :5001
taskkill /PID <PID> /F

# Mac/Linux - Tìm và kill process
lsof -ti:5001 | xargs kill -9
```

Hoặc đổi port trong `.env`:
```env
PORT=5002
```

### Lỗi 3: "CORS error" trên Frontend

**Nguyên nhân:** Backend chưa enable CORS cho frontend

**Giải pháp:** Backend đã có CORS config, kiểm tra `server.js`:
```javascript
app.use(cors({ origin: "http://localhost:5173" }));
```

### Lỗi 4: "Table does not exist"

**Giải pháp:** Chạy lại SQL script (Bước 4)

### Lỗi 5: Backend chạy nhưng frontend không load được data

**Check list:**
1. ✅ Backend đang chạy? → `http://localhost:5001/api/test`
2. ✅ Database có dữ liệu? → `node test-db.js`
3. ✅ Frontend gọi đúng URL? → Check `frontend/src/lib/axios.js`
4. ✅ CORS enabled? → Check console browser

## 📊 Database Management

### Xem dữ liệu:

```sql
-- Xem tất cả công ty
SELECT * FROM "LogisticsCompany";

-- Xem công ty với khu vực
SELECT 
  lc.company_name,
  lc.rating,
  array_agg(DISTINCT cc.area_name) as areas
FROM "LogisticsCompany" lc
LEFT JOIN "CompanyCoverage" cc ON lc.company_id = cc.company_id
GROUP BY lc.company_id, lc.company_name, lc.rating;

-- Xem công ty với giá cước
SELECT 
  lc.company_name,
  cr.vehicle_type,
  cr.cost_per_km
FROM "LogisticsCompany" lc
JOIN "CarrierRate" cr ON lc.company_id = cr.company_id
ORDER BY lc.company_name, cr.vehicle_type;
```

### Thêm công ty mới:

```sql
-- Insert company
INSERT INTO "LogisticsCompany" (company_name, address, phone, rating, description)
VALUES ('ABC Logistics', '123 Main St', '0901234567', 4.5, 'Fast delivery');

-- Insert coverage (giả sử company_id = 7)
INSERT INTO "CompanyCoverage" (company_id, area_name)
VALUES (7, 'TP.HCM'), (7, 'Hà Nội');

-- Insert rates
INSERT INTO "CarrierRate" (company_id, vehicle_type, cost_per_km)
VALUES (7, '≤ 2 tấn', 13000), (7, '≤ 4 tấn', 19000);
```

## 🎯 Các API Endpoints

| Method | Endpoint | Description | Query Params |
|--------|----------|-------------|--------------|
| GET | `/api/test` | Health check | - |
| GET | `/api/transport-companies` | Get all companies | q, area, vehicle_type, min_rating, max_cost_per_km |
| GET | `/api/transport-companies/:id` | Get company by ID | - |

**Ví dụ với query params:**
```
GET /api/transport-companies?area=HCM&vehicle_type=2 tấn&min_rating=4.5
```

## ✨ Next Steps

Sau khi backend chạy thành công, bạn có thể:

1. **Thêm authentication**: JWT tokens cho user login
2. **Thêm endpoints mới**: 
   - POST `/api/bookings` - Đặt xe
   - GET `/api/orders` - Lịch sử đơn hàng
   - PUT `/api/companies/:id` - Cập nhật thông tin
3. **Thêm validation**: Input validation với express-validator
4. **Thêm logging**: Winston hoặc Morgan
5. **Deploy**: Heroku, Railway, hoặc Vercel

## 📞 Support

Nếu gặp vấn đề, check:
1. Console logs (Browser F12)
2. Terminal logs (Backend)
3. Network tab (F12 → Network)
4. File `.env` có đúng không

Good luck! 🚀

