# 🔧 Cấu Hình Environment Variables

## Tạo File `.env`

Tạo file `.env` trong thư mục `backend/` với nội dung sau:

```env
# Database Configuration
PSQLDB_CONNECTIONSTRING=postgresql://user:password@host:port/database

# Server Configuration
PORT=5001
NODE_ENV=development
BACKEND_URL=http://localhost:5001

# Sepay Payment Gateway Configuration
# Lấy từ Sepay Dashboard: https://sepay.vn/dashboard
SEPAY_API_KEY=your_sepay_api_key_here
SEPAY_API_SECRET=your_sepay_api_secret_here
SEPAY_ACCOUNT=your_account_number_or_phone
SEPAY_BANK=BIDV
SEPAY_WEBHOOK_SECRET=your_webhook_secret_here
SEPAY_QR_TEMPLATE=compact
SEPAY_ENVIRONMENT=production

# Sepay API URLs (mặc định)
SEPAY_API_BASE_URL=https://api.sepay.vn
SEPAY_QR_IMAGE_URL=https://qr.sepay.vn/img

# JWT Secret (cho authentication)
JWT_SECRET=your_jwt_secret_key_here
```

## ⚠️ Lưu Ý

- **KHÔNG** commit file `.env` lên Git
- File `.env` nên đã có trong `.gitignore`
- Thay các giá trị `your_xxx_here` bằng thông tin thực tế từ Sepay

## Hướng Dẫn Chi Tiết

Xem file `SEPAY_SETUP_GUIDE.md` trong thư mục root để biết cách lấy API credentials từ Sepay.

