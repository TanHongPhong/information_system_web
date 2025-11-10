# 🔍 Debug Production - Companies không hiển thị

## Các bước kiểm tra

### 1. Kiểm tra Browser Console (F12)

Mở https://visionchain.online/transport-companies và mở Console (F12), kiểm tra:

#### ✅ Logs bình thường:
```
🔍 CompanyDirectory: Fetching companies
📦 CompanyDirectory: Received X companies from API
✅ CompanyDirectory: Found X companies
🔍 CompanyDirectory: Filtering companies
✅ CompanyDirectory: Filtered to X companies
🎨 CompanyDirectory: Rendering X companies
🏁 CompanyDirectory: Fetch completed, loading = false
```

#### ❌ Nếu có lỗi:
- `❌ CompanyDirectory: Invalid response` → API trả về dữ liệu không đúng format
- `❌ CompanyDirectory: Error fetching companies` → API call bị lỗi
- Xem `Error details` để biết status code và message

### 2. Kiểm tra Network Tab (F12 → Network)

1. Reload trang
2. Tìm request: `/api/transport-companies` hoặc `/api/transport-companies?origin_region=...`
3. Kiểm tra:
   - **Status**: Phải là `200 OK`
   - **Response**: Phải là JSON array `[{...}, {...}]`
   - **Request URL**: Phải là `/api/...` (KHÔNG phải `localhost:5001`)

#### ❌ Nếu lỗi:
- **404 Not Found** → Nginx không proxy đúng
- **500 Internal Server Error** → Backend lỗi
- **CORS error** → Cấu hình CORS sai
- **Network Error** → Không kết nối được backend

### 3. Kiểm tra Backend Logs

```bash
pm2 logs logistics-api --lines 50
```

Tìm các dòng:
- `🔍 GET /api/transport-companies - Filter by route:`
- `✅ GET /api/transport-companies: Found X companies`

### 4. Test API trực tiếp

```bash
# Test từ server
curl http://localhost:5001/api/transport-companies

# Test từ browser (mở trong tab mới)
https://visionchain.online/api/transport-companies
```

Kết quả phải là JSON array:
```json
[
  {
    "company_id": 1,
    "name": "...",
    "areas": [...],
    ...
  }
]
```

### 5. Kiểm tra Nginx Proxy

```bash
# Kiểm tra cấu hình Nginx
sudo nginx -t

# Xem cấu hình
cat /etc/nginx/sites-available/logistics
```

Đảm bảo có:
```nginx
location /api {
    proxy_pass http://localhost:5001/api;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
}
```

## Các vấn đề thường gặp

### Vấn đề 1: API URL sai
**Triệu chứng**: Console log `localhost:5001` trong Network tab

**Giải pháp**: 
- Đã sửa trong code, cần rebuild:
```bash
cd frontend
npm run build
sudo cp -r dist/* /var/www/html/logistics/
```

### Vấn đề 2: API trả về empty array
**Triệu chứng**: `Received 0 companies from API`

**Giải pháp**:
- Kiểm tra database có companies không
- Kiểm tra routes có tồn tại không
- Chạy script tạo routes:
```bash
cd backend
node scripts/check_and_create_routes.js
```

### Vấn đề 3: Loading state không reset
**Triệu chứng**: Màn hình loading mãi không hiển thị companies

**Giải pháp**:
- Đã sửa trong code, đảm bảo `setLoading(false)` luôn được gọi
- Kiểm tra console có log `🏁 Fetch completed` không

### Vấn đề 4: Filtered array rỗng
**Triệu chứng**: `Companies: 3, Filtered: 0`

**Giải pháp**:
- Click nút "Debug Info" để xem chi tiết
- Kiểm tra `keyword` có giá trị không (có thể đang filter quá strict)

## Quick Fix

Nếu vẫn không hiển thị, thử:

```bash
# 1. Rebuild frontend
cd /var/www/logistics-system/frontend
npm run build
sudo cp -r dist/* /var/www/html/logistics/
sudo chown -R www-data:www-data /var/www/html/logistics

# 2. Restart backend
cd ../backend
pm2 restart logistics-api

# 3. Reload Nginx
sudo systemctl reload nginx

# 4. Clear browser cache
# Trong browser: Ctrl+Shift+Delete → Clear cache
```

## Báo cáo lỗi

Nếu vẫn không được, cung cấp:
1. Console logs (copy tất cả)
2. Network tab screenshot (request `/api/transport-companies`)
3. Backend logs (`pm2 logs logistics-api --lines 100`)
4. Response từ API (test bằng curl)

