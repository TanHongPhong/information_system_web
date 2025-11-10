# 🔧 Sửa lỗi Git Pull - File .env bị conflict

## Vấn đề
File `backend/.env` đã bị thay đổi local, Git không thể pull code mới.

## Giải pháp

### Cách 1: Backup .env và pull (Khuyến nghị)

```bash
cd /var/www/logistics-system

# 1. Backup file .env hiện tại
cp backend/.env backend/.env.backup

# 2. Stash thay đổi local (tạm thời lưu lại)
git stash

# 3. Pull code mới
git pull origin main

# 4. Restore file .env từ backup
cp backend/.env.backup backend/.env

# 5. Xóa backup (tùy chọn)
# rm backend/.env.backup
```

### Cách 2: Discard thay đổi .env (nếu không quan trọng)

```bash
cd /var/www/logistics-system

# 1. Discard thay đổi local của .env
git checkout -- backend/.env

# 2. Pull code mới
git pull origin main
```

### Cách 3: Commit thay đổi .env (nếu muốn giữ)

```bash
cd /var/www/logistics-system

# 1. Commit thay đổi .env
git add backend/.env
git commit -m "Update .env config"

# 2. Pull code mới (sẽ merge)
git pull origin main

# 3. Nếu có conflict, giải quyết conflict
# Sau đó:
git add backend/.env
git commit -m "Merge .env changes"
```

## ⚠️ Lưu ý quan trọng

**File `.env` KHÔNG nên commit vào Git!**

Nếu file `.env` đã bị commit nhầm, thêm vào `.gitignore`:

```bash
# Kiểm tra .gitignore
cat backend/.gitignore | grep .env

# Nếu chưa có, thêm vào:
echo ".env" >> backend/.gitignore
echo ".env.local" >> backend/.gitignore
echo ".env.*.local" >> backend/.gitignore

# Xóa .env khỏi Git tracking (nhưng giữ file local)
git rm --cached backend/.env
git commit -m "Remove .env from git tracking"
```

## Sau khi pull thành công

Tiếp tục deploy như bình thường:

```bash
# Chạy migration
cd backend
node scripts/run_migrations.js 055_add_company_areas_4_regions.sql

# Restart backend
pm2 restart logistics-api

# Deploy frontend
cd ../frontend
npm install
npm run build
sudo cp -r dist/* /var/www/html/logistics/
sudo systemctl reload nginx
```

