# ✅ Checklist: Kiểm Tra File .env Cho Production

## 📋 Các Biến BẮT BUỘC Phải Có

### 1. **NODE_ENV**
```env
NODE_ENV=production
```
✅ **Cần sửa**: Đảm bảo là `production` (không phải `development`)

### 2. **PSQLDB_CONNECTIONSTRING**
```env
PSQLDB_CONNECTIONSTRING=postgresql://user:password@host:port/database?sslmode=require
```
✅ **Cần sửa**: 
- Thay `user`, `password`, `host`, `port`, `database` bằng giá trị thực tế
- **QUAN TRỌNG**: Phải có `?sslmode=require` ở cuối (cho Neon PostgreSQL)
- Lấy từ Neon Dashboard: https://console.neon.tech

### 3. **JWT_SECRET**
```env
JWT_SECRET=your-strong-random-secret-key-min-32-characters
```
✅ **Cần sửa**: 
- **PHẢI** là string mạnh, ít nhất 32 ký tự
- Generate bằng: `openssl rand -base64 32`
- **KHÔNG** dùng giá trị mặc định hoặc dễ đoán

### 4. **ALLOWED_ORIGINS**
```env
ALLOWED_ORIGINS=https://visionchain.online,https://www.visionchain.online
```
✅ **Cần sửa**: 
- Phải chứa domain frontend của bạn
- Format: comma-separated, không có khoảng trắng thừa
- **QUAN TRỌNG**: Phải có `https://` prefix

### 5. **BACKEND_URL**
```env
BACKEND_URL=https://api.visionchain.online
```
✅ **Cần sửa**: 
- Phải là URL đầy đủ của backend API
- Format: `https://api.visionchain.online` (không có trailing slash)

## 📋 Các Biến TÙY CHỌN

### 6. **PORT** (Optional, default: 5001)
```env
PORT=5001
```
✅ **Có thể giữ nguyên** nếu dùng port 5001

### 7. **JWT_EXPIRES_IN** (Optional, default: 7d)
```env
JWT_EXPIRES_IN=7d
```
✅ **Có thể giữ nguyên** nếu muốn token hết hạn sau 7 ngày

### 8. **SEPAY_*** (Optional - chỉ cần nếu dùng Sepay)
```env
SEPAY_API_KEY=
SEPAY_API_SECRET=
SEPAY_WEBHOOK_SECRET=
SEPAY_WEBHOOK_URL=https://api.visionchain.online/api/sepay/webhook
```
✅ **Cần điền** nếu sử dụng Sepay payment gateway

## 🔍 Kiểm Tra Nhanh

### ✅ Checklist Trước Khi Deploy:

- [ ] `NODE_ENV=production` (không phải development)
- [ ] `PSQLDB_CONNECTIONSTRING` đã được thay bằng connection string thực tế
- [ ] `PSQLDB_CONNECTIONSTRING` có `?sslmode=require` ở cuối
- [ ] `JWT_SECRET` đã được generate bằng `openssl rand -base64 32`
- [ ] `JWT_SECRET` ít nhất 32 ký tự
- [ ] `ALLOWED_ORIGINS` chứa `https://visionchain.online`
- [ ] `ALLOWED_ORIGINS` chứa `https://www.visionchain.online`
- [ ] `BACKEND_URL=https://api.visionchain.online` (đúng format)
- [ ] Không có giá trị placeholder như `your-secret-key` hoặc `change-this`

## 🚨 Lỗi Thường Gặp

### ❌ Lỗi 1: JWT_SECRET quá ngắn hoặc dễ đoán
```env
# SAI
JWT_SECRET=secret123

# ĐÚNG
JWT_SECRET=<generate-with-openssl-rand-base64-32>
```

### ❌ Lỗi 2: ALLOWED_ORIGINS thiếu https://
```env
# SAI
ALLOWED_ORIGINS=visionchain.online,www.visionchain.online

# ĐÚNG
ALLOWED_ORIGINS=https://visionchain.online,https://www.visionchain.online
```

### ❌ Lỗi 3: PSQLDB_CONNECTIONSTRING thiếu sslmode
```env
# SAI (cho Neon)
PSQLDB_CONNECTIONSTRING=postgresql://user:pass@host:port/db

# ĐÚNG
PSQLDB_CONNECTIONSTRING=postgresql://user:pass@host:port/db?sslmode=require
```

### ❌ Lỗi 4: BACKEND_URL có trailing slash
```env
# SAI
BACKEND_URL=https://api.visionchain.online/

# ĐÚNG
BACKEND_URL=https://api.visionchain.online
```

## 📝 Template .env Hoàn Chỉnh

```env
NODE_ENV=production
PORT=5001
PSQLDB_CONNECTIONSTRING=postgresql://neondb_owner:your-password@ep-xxx-xxx.region.aws.neon.tech/neondb?sslmode=require
JWT_SECRET=<paste-result-from-openssl-rand-base64-32>
JWT_EXPIRES_IN=7d
ALLOWED_ORIGINS=https://visionchain.online,https://www.visionchain.online
BACKEND_URL=https://api.visionchain.online
```

## 🔧 Generate JWT Secret

Trên VPS hoặc máy local, chạy:
```bash
openssl rand -base64 32
```

Copy kết quả và paste vào `JWT_SECRET` trong file `.env`

## ✅ Sau Khi Sửa

1. Lưu file `.env`
2. Restart backend: `pm2 restart logistics-api`
3. Kiểm tra logs: `pm2 logs logistics-api`
4. Test API: `curl https://api.visionchain.online/api/transport-companies`

