# HomePage Navigation Setup

## Tổng quan
Đã cập nhật tất cả các nút trên HomePage để điều hướng đến các trang phù hợp trong hệ thống.

## Các thay đổi chi tiết

### 1. Header.jsx (`frontend/src/components/home/Header.jsx`)

**Đã thêm:**
- `import { useNavigate } from "react-router-dom"`
- `const navigate = useNavigate()`

**Các nút đã cập nhật:**
- **"Đăng nhập"** button → `/sign-in`
- **"Đăng ký"** button → `/sign-in`

### 2. Hero.jsx (`frontend/src/components/home/Hero.jsx`)

**Đã thêm:**
- `import { useNavigate } from "react-router-dom"`
- `const navigate = useNavigate()`

**Các nút đã cập nhật:**
- **"Đặt xe ngay"** button → `/transport-companies` (Danh sách công ty vận chuyển)
- **"Xem bảng giá"** link → Giữ nguyên `#pricing` (scroll trong trang)

### 3. MobileCTA.jsx (`frontend/src/components/home/MobileCTA.jsx`)

**Đã thêm:**
- `import { useNavigate } from "react-router-dom"`
- `const navigate = useNavigate()`

**Các nút đã cập nhật:**
- **"Bắt đầu"** button → `/transport-companies`

### 4. BookingCard.jsx (`frontend/src/components/home/BookingCard.jsx`)

**Đã thêm:**
- `import { useNavigate } from "react-router-dom"`
- `const navigate = useNavigate()`

**Các nút đã cập nhật:**
- **"Tìm chuyến"** button → `/transport-companies`
- **"Ước tính chi phí"** link → Giữ nguyên `#pricing` (scroll trong trang)

### 5. Pricing.jsx (`frontend/src/components/home/Pricing.jsx`)

**Đã thêm:**
- `import { useNavigate } from "react-router-dom"`
- `const navigate = useNavigate()`

**Các nút đã cập nhật:**
- Tất cả các nút **"Chọn"** (3 nút) → `/vehicle-list` (Trang chọn xe)

## Flow người dùng từ HomePage

```
HomePage (/home-page)
│
├─ Header
│  ├─ Đăng nhập → /sign-in
│  └─ Đăng ký → /sign-in
│
├─ Hero Section
│  ├─ Đặt xe ngay → /transport-companies
│  └─ Xem bảng giá → #pricing (scroll)
│
├─ BookingCard (Form đặt xe)
│  ├─ Ước tính chi phí → #pricing (scroll)
│  └─ Tìm chuyến → /transport-companies
│
├─ Pricing Section
│  └─ Chọn (Van/Xe tải nhỏ/Xe tải trung) → /vehicle-list
│
└─ MobileCTA (Mobile only)
   └─ Bắt đầu → /transport-companies
```

## Luồng hoạt động

### Luồng 1: Đặt xe trực tiếp
1. User vào `/home-page`
2. Click "Đặt xe ngay" hoặc "Tìm chuyến"
3. → Chuyển đến `/transport-companies` (xem danh sách công ty)
4. Chọn công ty → Tiếp tục với flow đặt xe

### Luồng 2: Xem giá và chọn xe
1. User vào `/home-page`
2. Scroll xuống "Bảng giá theo tải trọng"
3. Click nút "Chọn" ở loại xe phù hợp
4. → Chuyển đến `/vehicle-list` (trang chọn xe cụ thể)
5. Chọn xe → Tiếp tục với flow đặt xe

### Luồng 3: Đăng nhập/Đăng ký
1. User vào `/home-page`
2. Click "Đăng nhập" hoặc "Đăng ký" ở Header
3. → Chuyển đến `/sign-in`
4. Đăng nhập hoặc tạo tài khoản mới

## Các trang đích

### `/sign-in` - Trang đăng nhập
- Cho phép user đăng nhập hoặc đăng ký
- Sau khi đăng nhập có thể quay lại HomePage hoặc tiếp tục đặt xe

### `/transport-companies` - Danh sách công ty vận chuyển
- Hiển thị danh sách các công ty vận chuyển
- User có thể xem thông tin, đánh giá, giá cả
- Chọn công ty để tiếp tục đặt xe

### `/vehicle-list` - Danh sách xe
- Hiển thị các loại xe có sẵn
- Filter theo tải trọng, loại xe
- Chọn xe cụ thể để đặt chuyến

## Testing

### Cách kiểm tra:
1. Chạy ứng dụng:
```bash
cd frontend
npm run dev
```

2. Mở trình duyệt: `http://localhost:5173/home-page`

3. Test các nút:
   - ✅ Header: "Đăng nhập" và "Đăng ký"
   - ✅ Hero: "Đặt xe ngay"
   - ✅ BookingCard: "Tìm chuyến"
   - ✅ Pricing: Các nút "Chọn"
   - ✅ Mobile: "Bắt đầu" (test trên mobile viewport)

4. Kiểm tra navigation:
   - Các nút có chuyển đúng trang không?
   - Animation/transition mượt không?
   - Trạng thái page sau khi chuyển có đúng không?

## Ghi chú kỹ thuật

- **React Router v7**: Sử dụng `useNavigate()` hook để programmatic navigation
- **Button vs Link**: Đổi từ `<a>` sang `<button>` với `onClick` handler cho client-side routing
- **Giữ nguyên anchor links**: Các link scroll trong trang (như `#pricing`, `#booking`) vẫn giữ nguyên
- **Mobile responsive**: Tất cả navigation hoạt động tốt trên mobile và desktop

## Tích hợp với Dashboard

HomePage (`/home-page`) có thể được truy cập từ:
- Dashboard → User role → Trang Chủ
- Sidebar (nhiều trang) → Home icon → `/home-page`
- Direct URL: `http://localhost:5173/home-page`

## Các trang liên quan

Các trang được điều hướng đến từ HomePage:
1. `/sign-in` - SignIn page
2. `/transport-companies` - TransportCompanies page
3. `/vehicle-list` - VehicleList page

Các trang này đều đã có routing trong `App.jsx` và có sidebar navigation để quay về dashboard hoặc các trang khác.

