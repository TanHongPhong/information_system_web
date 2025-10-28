# 🔐 Hướng dẫn Setup Auth System

## ✅ Đã hoàn thành

### Backend:
1. ✅ Cài đặt `bcrypt` để hash mật khẩu
2. ✅ Tạo Model (`backend/src/models/User.js`) - Quản lý user database
3. ✅ Tạo Controllers (`backend/src/controllers/authControllers.js`) - Xử lý logic đăng ký/đăng nhập
4. ✅ Tạo Routes (`backend/src/routes/authRoutes.js`) - API endpoints
5. ✅ Cập nhật `backend/server.js` - Thêm auth routes
6. ✅ Tạo SQL Migration (`backend/migrations/001_create_users_table.sql`)

### Frontend:
1. ✅ Cập nhật SignUpForm - Gọi API đăng ký
2. ✅ Cập nhật LoginForm - Gọi API đăng nhập
3. ✅ Tạo API Helper (`frontend/src/lib/api.js`)

## 🚀 Bước tiếp theo - THỰC HIỆN:

### Bước 1: Tạo bảng users trên Neon
1. Truy cập **Neon Console**: https://console.neon.tech
2. Chọn project của bạn
3. Mở **SQL Editor**
4. Copy và chạy SQL từ file: `backend/migrations/001_create_users_table.sql`

```sql
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('user', 'transport_company')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
```

### Bước 2: Kiểm tra Backend Server
1. Chạy backend server:
```bash
cd backend
npm run dev
```

2. Kiểm tra API hoạt động:
```bash
# Test Signup
curl -X POST http://localhost:5001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","phone":"0901234567","email":"test@example.com","password":"password123","role":"user"}'

# Test Login
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","role":"user"}'
```

### Bước 3: Test Frontend
1. Chạy frontend (nếu chưa chạy):
```bash
cd frontend
npm run dev
```

2. Thử đăng ký:
   - Vào `/sign-up`
   - Điền form: Tên, Số điện thoại, Email, Mật khẩu, Vai trò
   - Click "Đăng ký"
   - Xem console để debug

3. Thử đăng nhập:
   - Vào `/sign-in`
   - Nhập email + mật khẩu đã đăng ký
   - Chọn vai trò tương ứng
   - Click "Đăng nhập"

## 📝 API Endpoints

### POST `/api/auth/signup`
**Request:**
```json
{
  "name": "Nguyễn Văn A",
  "phone": "0901234567",
  "email": "user@example.com",
  "password": "password123",
  "role": "user"
}
```

**Response (Success - 201):**
```json
{
  "message": "Đăng ký thành công",
  "user": {
    "id": "uuid",
    "name": "Nguyễn Văn A",
    "phone": "0901234567",
    "email": "user@example.com",
    "role": "user"
  }
}
```

### POST `/api/auth/login`
**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "role": "user"
}
```

**Response (Success - 200):**
```json
{
  "message": "Đăng nhập thành công",
  "user": {
    "id": "uuid",
    "name": "Nguyễn Văn A",
    "phone": "0901234567",
    "email": "user@example.com",
    "role": "user"
  }
}
```

## 🔧 Troubleshooting

### Lỗi: "Email đã được sử dụng"
- Email đã tồn tại trong database
- Hãy dùng email khác hoặc đăng nhập với email đó

### Lỗi: "Email hoặc mật khẩu không đúng"
- Mật khẩu sai hoặc email không tồn tại
- Kiểm tra lại thông tin đăng nhập

### Lỗi: "Lỗi kết nối server"
- Backend server chưa chạy
- Chạy: `cd backend && npm run dev`

### Lỗi: "Cannot find module 'bcrypt'"
- Chạy: `cd backend && npm install bcrypt`

## 🎉 Hoàn thành!

Sau khi chạy SQL migration trên Neon, bạn có thể:
- ✅ Đăng ký tài khoản mới
- ✅ Đăng nhập với email/password
- ✅ Dữ liệu được lưu trên Neon PostgreSQL
- ✅ Mật khẩu được hash với bcrypt
- ✅ Điều hướng theo vai trò sau khi đăng nhập

