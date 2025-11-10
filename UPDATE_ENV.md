# 🔧 Hướng dẫn cập nhật file .env

## Cách 1: Dùng nano (Khuyến nghị)

```bash
cd /var/www/logistics-system/backend
nano .env
```

### Các bước:
1. Mở file: `nano .env`
2. Tìm dòng `PSQLDB_CONNECTIONSTRING=`
3. Sửa connection string
4. Lưu: `Ctrl + O` (Write Out)
5. Xác nhận: `Enter`
6. Thoát: `Ctrl + X`

## Cách 2: Dùng vi/vim

```bash
cd /var/www/logistics-system/backend
vi .env
```

### Các bước:
1. Mở file: `vi .env`
2. Nhấn `i` để vào chế độ insert
3. Tìm và sửa `PSQLDB_CONNECTIONSTRING=`
4. Lưu: `Esc` → `:wq` → `Enter`

## Cách 3: Dùng sed (nếu biết connection string mới)

```bash
cd /var/www/logistics-system/backend

# Backup trước
cp .env .env.backup

# Thay thế connection string (thay YOUR_NEW_CONNECTION_STRING)
sed -i 's|PSQLDB_CONNECTIONSTRING=.*|PSQLDB_CONNECTIONSTRING=YOUR_NEW_CONNECTION_STRING|' .env
```

## Format Connection String

```
postgresql://username:password@host:port/database?sslmode=require
```

### Ví dụ:
```env
PSQLDB_CONNECTIONSTRING=postgresql://user:pass123@ep-dry-moon-123456.us-east-1.aws.neon.tech:5432/logistics_db?sslmode=require
```

## Các biến môi trường quan trọng khác

```env
NODE_ENV=production
PORT=5001
PSQLDB_CONNECTIONSTRING=postgresql://user:pass@host:port/db?sslmode=require
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=7d
```

## Sau khi sửa .env

```bash
# Restart backend để áp dụng thay đổi
pm2 restart logistics-api

# Kiểm tra logs
pm2 logs logistics-api --lines 20

# Kiểm tra kết nối database
cd /var/www/logistics-system/backend
node -e "
require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.PSQLDB_CONNECTIONSTRING });
pool.query('SELECT NOW()').then(() => {
    console.log('✅ Database connection OK');
    process.exit(0);
}).catch(err => {
    console.error('❌ Database connection failed:', err.message);
    process.exit(1);
});
"
```

## Lưu ý

- **KHÔNG commit file .env vào Git**
- **Backup file .env trước khi sửa**: `cp .env .env.backup`
- **Kiểm tra kết nối sau khi sửa** để đảm bảo không có lỗi

