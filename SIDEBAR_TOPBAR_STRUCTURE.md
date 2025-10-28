# 📋 Cấu trúc Sidebar & Topbar - Hệ thống Logistics

## 🎯 Tổng quan

Hệ thống đã được tổ chức thành **3 nhóm role** với Sidebar và Topbar riêng biệt, được đồng bộ giữa các trang trong cùng nhóm:

### 1. **Supplier Group** (Nhà cung cấp vận chuyển)
- **Components**: 
  - `frontend/src/components/sup/Sidebar.jsx`
  - `frontend/src/components/sup/Topbar.jsx`
  - `frontend/src/components/chi tiet don hang/Sidebar.jsx`
  - `frontend/src/components/chi tiet don hang/Topbar.jsx`
  - `frontend/src/components/tracking/SidebarTrack.jsx` (có style riêng)
  - `frontend/src/components/quan li doi xe/SidebarNav.jsx` (có style riêng)

- **Pages**:
  - `/suplier` - Dashboard Supplier
  - `/quan-li-doi-xe` - Theo dõi đội xe
  - `/order-tracking` - Theo dõi đơn hàng
  - `/chi-tiet-don-hang` - Chi tiết đơn hàng

- **Navigation Menu**:
  1. 🏠 Dashboard Supplier → `/suplier`
  2. 🚚 Theo dõi đội xe → `/quan-li-doi-xe`
  3. 🗺️ Theo dõi đơn hàng → `/order-tracking`
  4. 📦 Chi tiết đơn hàng → `/chi-tiet-don-hang`
  5. 🔔 Thông báo (có red dot)
  6. 👤 Người dùng → `/sign-in`
  7. ⚙️ Cài đặt

---

### 2. **User Group** (Khách hàng/Người dùng)
- **Components**: 
  - `frontend/src/components/user/Sidebar.jsx` ⭐ (MỚI)
  - `frontend/src/components/user/Topbar.jsx` ⭐ (MỚI)

- **Pages**:
  - `/home-page` - Trang chủ
  - `/transport-companies` - Danh sách công ty vận tải
  - `/vehicle-list` - Chọn xe
  - `/nhap-in4` - Nhập thông tin đơn hàng
  - `/payment-qr` - Quét mã QR thanh toán
  - `/payment-history` - Lịch sử thanh toán
  - `/order-tracking-customer` - Theo dõi đơn hàng (khách)

- **Navigation Menu**:
  1. 🏠 Trang chủ → `/home-page`
  2. 💼 Danh sách công ty → `/transport-companies`
  3. 🚚 Chọn xe → `/vehicle-list`
  4. 📋 Nhập thông tin → `/nhap-in4`
  5. 💳 Quét mã QR → `/payment-qr`
  6. 📄 Lịch sử thanh toán → `/payment-history`
  7. 🗺️ Theo dõi đơn hàng → `/order-tracking-customer`
  8. 🔔 Thông báo (có red dot)
  9. 👤 Người dùng → `/sign-in`
  10. ⚙️ Cài đặt

---

### 3. **Warehouse Group** (Quản lý kho)
- **Components**: 
  - `frontend/src/components/warehouse/Sidebar.jsx` ⭐ (MỚI)
  - `frontend/src/components/warehouse/Topbar.jsx` ⭐ (MỚI)

- **Pages**:
  - `/warehouse` - Quản lý kho hàng

- **Navigation Menu**:
  1. 📦 Quản lý kho hàng → `/warehouse`
  2. 🗺️ Theo dõi đơn hàng → `/order-tracking`
  3. 🔔 Thông báo (có red dot)
  4. 👤 Người dùng → `/sign-in`
  5. ⚙️ Cài đặt

---

### 4. **Driver (Mobile)** - Không có Sidebar/Topbar
- **Page**: `/driver` - Quản lý xe (Tài xế)
- Layout mobile riêng biệt, không sử dụng Sidebar/Topbar

---

### 5. **Admin/Dashboard** - Giữ nguyên
- **Pages**: 
  - `/` - HomePageAdmin (chọn role)
  - `/dashboard` - RoleDashboard (sidebar động)
  - `/sign-in` - SignIn

---

## 🔧 Cấu trúc Technical

### Template Components
Tất cả Sidebar/Topbar đều dựa trên 2 template:
- `frontend/src/components/Sidebar.jsx` (template chuẩn)
- `frontend/src/components/Topbar.jsx` (template chuẩn)

### Đặc điểm chung:
1. **Sidebar**:
   - Fixed, width: `80px` (`w-20`)
   - Logo "LGBT" (click → Dashboard)
   - Feather Icons với `useEffect` để render
   - Active state highlighting (blue)
   - Navigation với `useNavigate` và `useLocation`

2. **Topbar**:
   - Fixed, offset left: `80px` (marginLeft: "5rem")
   - Gradient background: `from-blue-900 via-sky-200 to-white`
   - Search bar
   - Action buttons (Plus, Bell, Archive)
   - User avatar dropdown
   - Feather Icons

3. **Layout Pattern**:
   ```jsx
   <Sidebar />
   <Topbar />
   <main className="ml-20 pt-[72px]">
     {/* Content */}
   </main>
   ```

---

## 📊 Bảng mapping Pages → Components

| Page | Sidebar | Topbar | Group |
|------|---------|--------|-------|
| `/suplier` | `sup/Sidebar.jsx` | `sup/Topbar.jsx` | Supplier |
| `/quan-li-doi-xe` | `quan li doi xe/SidebarNav.jsx` | `quan li doi xe/HeaderBar.jsx` | Supplier |
| `/order-tracking` | `tracking/SidebarTrack.jsx` | `tracking/TopbarTrack.jsx` | Supplier |
| `/chi-tiet-don-hang` | `chi tiet don hang/Sidebar.jsx` | `chi tiet don hang/Topbar.jsx` | Supplier |
| `/transport-companies` | `user/Sidebar.jsx` ⭐ | `user/Topbar.jsx` ⭐ | User |
| `/vehicle-list` | `user/Sidebar.jsx` ⭐ | `user/Topbar.jsx` ⭐ | User |
| `/nhap-in4` | `user/Sidebar.jsx` ⭐ | `user/Topbar.jsx` ⭐ | User |
| `/payment-qr` | `user/Sidebar.jsx` ⭐ | `user/Topbar.jsx` ⭐ | User |
| `/payment-history` | `user/Sidebar.jsx` ⭐ | `user/Topbar.jsx` ⭐ | User |
| `/order-tracking-customer` | `user/Sidebar.jsx` ⭐ | `user/Topbar.jsx` ⭐ | User |
| `/warehouse` | `warehouse/Sidebar.jsx` ⭐ | `warehouse/Topbar.jsx` ⭐ | Warehouse |
| `/driver` | ❌ (mobile layout) | ❌ | Driver |
| `/` | ❌ (admin page) | ❌ | Admin |
| `/dashboard` | ✅ (dynamic) | ❌ | Admin |
| `/home-page` | ❌ (landing page) | ❌ | Landing |
| `/sign-in` | ❌ (auth page) | ❌ | Auth |

⭐ = Component mới được tạo

---

## ✅ Công việc đã hoàn thành

### 1. **Supplier Group**
- ✅ Đồng bộ `sup/Sidebar.jsx` với 4 menu items
- ✅ Đồng bộ `sup/Topbar.jsx` với feather icons
- ✅ Đồng bộ `chi tiet don hang/Sidebar.jsx` và `Topbar.jsx`
- ✅ Cập nhật `tracking/SidebarTrack.jsx` với menu supplier
- ✅ Cập nhật `quan li doi xe/SidebarNav.jsx` thêm Dashboard Supplier

### 2. **User Group**
- ✅ Tạo `user/Sidebar.jsx` với 10 menu items
- ✅ Tạo `user/Topbar.jsx`
- ✅ Cập nhật 6 pages: TransportCompanies, VehicleList, NhapIn4, PaymentQR, PaymentHistory, OrderTrackingCustomer

### 3. **Warehouse Group**
- ✅ Tạo `warehouse/Sidebar.jsx` với 5 menu items
- ✅ Tạo `warehouse/Topbar.jsx`
- ✅ Cập nhật page WareHouse

### 4. **Routing**
- ✅ Tất cả navigation đều dùng `useNavigate` từ `react-router-dom`
- ✅ Active state highlighting với `useLocation`
- ✅ Logo click → `/dashboard`

---

## 🎨 Styling đồng nhất

### Colors
- **Active**: `text-blue-600 bg-blue-50 ring-1 ring-blue-200`
- **Hover**: `hover:text-slate-600 hover:bg-slate-50`
- **Default**: `text-slate-400`
- **Logo gradient**: `from-sky-50 to-white`

### Icons
- **Library**: Feather Icons
- **Size**: `w-5 h-5` (sidebar), `w-4 h-4` (topbar)
- **Render**: `feather.replace()` trong `useEffect`

### Layout
- **Sidebar**: `w-20` (80px) fixed left
- **Topbar**: `h-[72px]` fixed top, offset left 80px
- **Main**: `ml-20 pt-[72px]`

---

## 🚀 Hướng dẫn mở rộng

### Thêm menu item mới:
1. Thêm button vào `Sidebar.jsx` của group tương ứng
2. Thêm route vào `App.jsx`
3. Cập nhật `RoleDashboard.jsx` nếu cần

### Tạo role group mới:
1. Tạo `components/[group-name]/Sidebar.jsx`
2. Tạo `components/[group-name]/Topbar.jsx`
3. Copy template từ `Sidebar.jsx` và `Topbar.jsx`
4. Cập nhật menu items theo role
5. Apply vào pages tương ứng

---

## 📝 Notes

1. **Feather Icons**: Cần import `feather-icons` và gọi `feather.replace()` trong `useEffect`
2. **Active State**: Sử dụng `location.pathname === path` để check
3. **Logo Text**: "LGBT" (có thể thay đổi nếu cần)
4. **Responsive**: Tất cả pages đều responsive với breakpoints Tailwind
5. **Z-index**: Sidebar `z-40`, Topbar `z-50`

---

## 🐛 Troubleshooting

### Icons không hiển thị?
→ Kiểm tra `feather.replace()` trong `useEffect`

### Active state không hoạt động?
→ Kiểm tra `useLocation` và `isActive` function

### Layout bị lệch?
→ Kiểm tra `ml-20` và `pt-[72px]` trong main

### Navigation không hoạt động?
→ Kiểm tra `useNavigate` và đường dẫn trong `onClick`

---

**Tài liệu được tạo tự động** - Cập nhật lần cuối: 2025-10-28

