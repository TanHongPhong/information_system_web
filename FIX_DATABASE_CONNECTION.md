# 🔧 Sửa Lỗi Không Truy Cập Được Database

## ❌ Vấn Đề Hiện Tại

Connection string trong `backend/.env` vẫn là **placeholder**:
```
PSQLDB_CONNECTIONSTRING=postgresql://user:password@host:port/database
```

## ✅ Giải Pháp

### Bước 1: Lấy Connection String

#### Cách 1: Từ Neon (Khuyến nghị - Miễn phí)

1. **Truy cập**: https://console.neon.tech
2. **Đăng nhập** (hoặc Sign up nếu chưa có)
3. **Tạo Project mới** (nếu chưa có):
   - Click "New Project"
   - Chọn region (ví dụ: Southeast Asia)
   - Chọn PostgreSQL version (14 hoặc 15)
   - Click "Create Project"
4. **Copy Connection String**:
   - Vào Project → Dashboard
   - Tìm phần **"Connection String"**
   - Click "Copy" để copy connection string
   - Format: `postgresql://user:pass@ep-xxx.region.aws.neon.tech/database?sslmode=require`

#### Cách 2: Từ PostgreSQL Local

Nếu bạn có PostgreSQL cài local:

```env
PSQLDB_CONNECTIONSTRING=postgresql://postgres:your_password@localhost:5432/database_name
```

Thay:
- `your_password` = Password PostgreSQL của bạn
- `database_name` = Tên database (ví dụ: `logistics_db`)

### Bước 2: Cập Nhật File .env

1. **Mở file**: `backend/.env`
2. **Tìm dòng**:
   ```
   PSQLDB_CONNECTIONSTRING=postgresql://user:password@host:port/database
   ```
3. **Thay bằng connection string thực tế**:
   ```
   PSQLDB_CONNECTIONSTRING=postgresql://user:pass@ep-xxx.neon.tech/db?sslmode=require
   ```
   (Paste connection string từ Neon hoặc PostgreSQL)

4. **Lưu file**

### Bước 3: Restart Backend

```powershell
# Trong terminal đang chạy backend
Ctrl+C

# Chạy lại
cd backend
npm start
```

### Bước 4: Test Connection

```powershell
Invoke-RestMethod -Uri "http://localhost:5001/api/test"
```

**Kết quả mong đợi:**
```json
{
  "message": "API is working! ✅",
  "database": "Connected to PostgreSQL",
  "timestamp": "2025-01-XX...",
  "status": "healthy"
}
```

Nếu vẫn lỗi → Xem phần Troubleshooting bên dưới.

---

## 🐛 Troubleshooting

### Lỗi: "Cannot connect to database server"

**Nguyên nhân:**
- Connection string sai
- Database server không chạy
- Host/port không đúng

**Giải pháp:**
1. Kiểm tra connection string có đầy đủ không
2. Nếu dùng Neon: Kiểm tra project có active không
3. Nếu dùng local: Kiểm tra PostgreSQL service đang chạy
   ```powershell
   # Windows - Check PostgreSQL service
   Get-Service -Name postgresql*
   ```

### Lỗi: "Database authentication failed"

**Nguyên nhân:**
- Username/password sai

**Giải pháp:**
1. Kiểm tra lại username/password trong connection string
2. Nếu Neon: Reset password nếu cần
3. Nếu local: Kiểm tra password PostgreSQL

### Lỗi: "Database does not exist"

**Nguyên nhân:**
- Tên database sai

**Giải pháp:**
1. Kiểm tra tên database trong connection string
2. Tạo database mới nếu chưa có:
   ```sql
   CREATE DATABASE logistics_db;
   ```

### Lỗi: "PSQLDB_CONNECTIONSTRING chưa được cấu hình"

**Giải pháp:**
- Đảm bảo đã cập nhật connection string trong `.env`
- Đảm bảo không có khoảng trắng thừa
- Restart backend sau khi update

---

## ✅ Checklist

- [ ] Connection string đã được lấy từ Neon/PostgreSQL
- [ ] File `backend/.env` đã được cập nhật với connection string thực tế
- [ ] Không còn placeholder trong connection string
- [ ] Backend đã restart sau khi update `.env`
- [ ] Test API: `http://localhost:5001/api/test` thành công
- [ ] Database connection established (thấy log trong backend terminal)

---

## 💡 Tips

1. **Connection string không được có khoảng trắng** ở đầu/cuối
2. **Nếu dùng Neon**: Connection string tự động có `?sslmode=require`
3. **Nếu copy từ Neon**: Đảm bảo copy đầy đủ, không thiếu phần nào
4. **Test connection string** trước khi dùng:
   - Có thể dùng pgAdmin, DBeaver, hoặc psql để test

---

**Sau khi sửa xong, backend sẽ có thể kết nối database và webhook sẽ hoạt động!**

