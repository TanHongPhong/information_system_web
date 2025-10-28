# Thiết lập Routing và Dashboard Navigation

## Tổng quan
Đã thiết lập hệ thống routing hoàn chỉnh cho ứng dụng với dashboard làm trung tâm điều hướng.

## Các thay đổi chính

### 1. App.jsx
- **Thêm route `/dashboard`**: Kết nối với trang `RoleDashboard`
- **Import RoleDashboard**: `import RoleDashboard from "./pages/RoleDashboard.jsx"`
- **Flow điều hướng**: 
  - `/` → HomePageAdmin (chọn vai trò) 
  - `/dashboard` → RoleDashboard (dashboard động theo vai trò)

### 2. RoleDashboard.jsx
- **Cập nhật routes cho các vai trò**:
  - `transport_company`: Dashboard Supplier, Theo dõi đội xe, Theo dõi đơn hàng, Chi tiết đơn hàng
  - `driver`: Quản lý xe, Theo dõi đơn
  - `warehouse`: Quản lý kho hàng, Theo dõi đơn hàng
  - `user`: Trang chủ, Đăng nhập, Danh sách công ty, Chọn xe, Nhập thông tin, Quét mã QR, Lịch sử thanh toán, Theo dõi đơn hàng
- **Sidebar có thể toggle**: Thu/mở sidebar
- **Nút quay về**: Có nút "Chọn vai trò khác" và "Đăng xuất"

### 3. Sidebar Components

Đã cập nhật **11 Sidebar components** với navigation links:

#### a. Sidebar chính (`frontend/src/components/Sidebar.jsx`)
- Logo → `/dashboard`
- Trang chủ → `/home-page`
- Quản lý xe → `/quan-li-doi-xe`
- Theo dõi đơn → `/order-tracking`
- Người dùng → `/sign-in`
- Active state highlighting

#### b. Sidebar Supplier (`frontend/src/components/sup/Sidebar.jsx`)
- Logo → `/dashboard`
- Trang chủ → `/suplier`
- Quản lý xe → `/quan-li-doi-xe`
- Theo dõi đơn → `/order-tracking`
- Người dùng → `/sign-in`

#### c. Sidebar Companies (`frontend/src/components/companies/Sidebar.jsx`)
- Logo → `/dashboard`
- Trang chủ → `/transport-companies`
- Theo dõi vị trí → `/order-tracking`
- Lịch sử giao dịch → `/payment-history`
- Người dùng → `/sign-in`

#### d. Sidebar Chi tiết đơn hàng (`frontend/src/components/chi tiet don hang/Sidebar.jsx`)
- Logo → `/dashboard`
- Trang chủ → `/chi-tiet-don-hang`
- Quản lý xe → `/quan-li-doi-xe`
- Theo dõi đơn → `/order-tracking`
- Người dùng → `/sign-in`

#### e. Sidebar Nhập thông tin (`frontend/src/components/nhap_in4/Sidebar.jsx`)
- Logo → `/dashboard`
- Trang chủ → `/nhap-in4`
- Theo dõi vị trí → `/order-tracking`
- Lịch sử giao dịch → `/payment-history`
- Người dùng → `/sign-in`

#### f. Sidebar Payment (`frontend/src/components/payment/Sidebar.jsx`)
- Logo → `/dashboard`
- Trang chủ → `/payment-qr`
- Theo dõi vị trí → `/order-tracking`
- Lịch sử giao dịch → `/payment-history`
- Người dùng → `/sign-in`

#### g. Sidebar Vehicle (`frontend/src/components/vehicle/Sidebar.jsx`)
- Logo → `/dashboard`
- Trang chủ → `/vehicle-list`
- Theo dõi vị trí → `/order-tracking`
- Lịch sử giao dịch → `/payment-history`
- Người dùng → `/sign-in`

#### h. SidebarTrack (`frontend/src/components/tracking/SidebarTrack.jsx`)
- Logo → `/dashboard`
- Trang chủ → `/home-page`
- Quản lý xe → `/quan-li-doi-xe`
- Theo dõi đơn → `/order-tracking`
- Người dùng → `/sign-in`

#### i. Sidebar Tracking Customer (`frontend/src/components/tracking_customer/Sidebar.jsx`)
- Logo → `/dashboard`
- Trang chủ → `/home-page`
- Theo dõi đơn → `/order-tracking-customer`
- Lịch sử → `/payment-history`
- Tài khoản → `/sign-in`

#### j. SidebarNav Quản lý đội xe (`frontend/src/components/quan li doi xe/SidebarNav.jsx`)
- Logo VT → `/dashboard`
- Check thông tin đơn hàng → `/chi-tiet-don-hang`
- Trạng thái đội xe → `/quan-li-doi-xe`
- Theo dõi đơn hàng → `/order-tracking`

#### k. SidebarMini (`frontend/src/components/history/SidebarMini.jsx`)
- Logo → `/dashboard`
- Home → `/home-page`
- Map → `/order-tracking`
- Transactions → `/payment-history`
- User → `/sign-in`

## Tính năng chính

### 1. Điều hướng thông minh
- Mỗi sidebar có logo/brand icon có thể click để quay về dashboard
- Active state highlighting: Nút tương ứng với trang hiện tại sẽ được highlight
- Hover effects trên tất cả các nút

### 2. Dashboard theo vai trò
- Mỗi vai trò (transport_company, driver, warehouse, user) có danh sách trang riêng
- Dashboard hiển thị các trang phù hợp với vai trò đã chọn
- Sidebar có thể thu/mở để tiết kiệm không gian

### 3. Flow người dùng
```
1. Truy cập "/" (HomePageAdmin)
2. Chọn vai trò (transport_company / driver / warehouse / user)
3. Chuyển đến "/dashboard" (RoleDashboard)
4. Click vào trang cần truy cập từ dashboard
5. Từ bất kỳ trang nào, có thể:
   - Click logo để về dashboard
   - Click các nút sidebar để chuyển trang khác
   - Quay lại chọn vai trò khác
   - Đăng xuất
```

## Cấu trúc Routes

### Routes chính
- `/` → HomePageAdmin (chọn vai trò)
- `/dashboard` → RoleDashboard (dashboard động)
- `/home-page` → HomePage
- `/sign-in` → SignIn
- `/transport-companies` → TransportCompanies
- `/vehicle-list` → VehicleList
- `/payment-history` → PaymentHistory
- `/payment-qr` → PaymentQR
- `/suplier` → Suplier (Supplier dashboard)
- `/warehouse` → WareHouse
- `/nhap-in4` → NhapIn4
- `/quan-li-doi-xe` → QuanLiDoiXe
- `/order-tracking` → OrderTracking
- `/order-tracking-customer` → OrderTrackingCustomer
- `/chi-tiet-don-hang` → ChiTietDonHang
- `/driver` → Driver

## Kiểm tra hoạt động

### Cách kiểm tra:
1. Chạy ứng dụng: `npm run dev` trong thư mục frontend
2. Mở trình duyệt: `http://localhost:5173`
3. Chọn một vai trò
4. Kiểm tra:
   - Dashboard hiển thị đúng các trang cho vai trò đó
   - Click vào các trang từ dashboard
   - Click logo để quay về dashboard
   - Click các nút sidebar để điều hướng
   - Active state highlighting hoạt động đúng

## Ghi chú
- **Không thay đổi giao diện**: Chỉ thêm navigation links, không thay đổi UI của các trang
- **React Router v7**: Sử dụng `useNavigate` và `useLocation` hooks
- **Active state**: Sử dụng `location.pathname` để xác định trang hiện tại
- **Responsive**: Các sidebar hoạt động tốt trên các kích thước màn hình khác nhau

