# 🔧 Sửa lỗi deploy - Thư mục không tồn tại

## Lỗi
```
cp: target '/var/www/html/logistics/' is not a directory
chown: cannot access '/var/www/html/logistics': No such file or directory
```

## Giải pháp

Chạy lệnh sau để tạo thư mục và copy file:

```bash
# Tạo thư mục nếu chưa có
sudo mkdir -p /var/www/html/logistics

# Copy files
sudo cp -r dist/* /var/www/html/logistics/

# Set permissions
sudo chown -R www-data:www-data /var/www/html/logistics
sudo chmod -R 755 /var/www/html/logistics
```

## Hoặc xóa và tạo lại (nếu thư mục bị lỗi)

```bash
# Xóa thư mục cũ (nếu có)
sudo rm -rf /var/www/html/logistics

# Tạo mới
sudo mkdir -p /var/www/html/logistics

# Copy files
sudo cp -r dist/* /var/www/html/logistics/

# Set permissions
sudo chown -R www-data:www-data /var/www/html/logistics
sudo chmod -R 755 /var/www/html/logistics
```

## Kiểm tra

```bash
# Kiểm tra files đã copy chưa
ls -la /var/www/html/logistics/

# Kiểm tra Nginx config
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

