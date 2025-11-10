import { useMemo, useState, useEffect } from "react";
import AppLayout from "../components/layout/AppLayout.jsx";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

import TitleControls from "../components/warehouse/TitleControls";
import KpiStrip from "../components/warehouse/KpiStrip";
import WarehouseTable from "../components/warehouse/WarehouseTable";
import OrderDetailModal from "../components/warehouse/OrderDetailModal";
import Pagination from "../components/warehouse/Pagination";

export default function WarehouseInOutPage() {
  // Kiểm tra role nghiêm ngặt và logout nếu không đúng
  useEffect(() => {
    const checkRole = () => {
      const userData = localStorage.getItem("gd_user");
      const role = localStorage.getItem("role");

      if (!userData || role !== "warehouse") {
        console.error(`❌ Access denied: Role '${role}' is not allowed for warehouse page. Required: warehouse`);
        alert("Bạn không có quyền truy cập trang này. Vui lòng đăng nhập với tài khoản warehouse.");
        logout();
        return false;
      }
      return true;
    };

    if (!checkRole()) {
      return;
    }

    const handleStorageChange = () => {
      if (!checkRole()) {
        return;
      }
    };

    window.addEventListener("storage", handleStorageChange);
    
    const intervalId = setInterval(() => {
      if (!checkRole()) {
        clearInterval(intervalId);
      }
    }, 2000);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(intervalId);
    };
  }, []);

  const logout = () => {
    localStorage.removeItem("gd_user");
    localStorage.removeItem("role");
    localStorage.removeItem("isAdmin");
    localStorage.removeItem("remember");
    localStorage.removeItem("auth_token");
    window.location.href = "/sign-in";
  };

  // Data state
  const [orders, setOrders] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [kpis, setKpis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter & Search state
  const [searchValue, setSearchValue] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  
  // Modal state
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Load data từ API - lấy cargo orders theo status warehouse
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Lấy các đơn hàng đã tới kho (WAREHOUSE_STORED)
      const allOrdersData = [];

      try {
        const response = await fetch(`${API_URL}/cargo-orders?status=WAREHOUSE_STORED&limit=1000`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`API Error: ${response.status} - ${errorText}`);
          throw new Error(`Failed to fetch orders: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Fetched orders data (WAREHOUSE_STORED):', data);
        
        // API trả về mảng trực tiếp
        const ordersList = Array.isArray(data) ? data : (data.orders || data.data || []);
        console.log('Orders list length (WAREHOUSE_STORED):', ordersList.length);
        
        if (ordersList.length > 0) {
          allOrdersData.push(...ordersList);
        } else {
          console.warn('No orders found with status WAREHOUSE_STORED');
          
          // Kiểm tra các status khác để debug
          try {
            const statusesToCheck = ['WAREHOUSE_RECEIVED', 'WAREHOUSE_OUTBOUND', 'IN_TRANSIT', 'LOADING', 'ACCEPTED'];
            for (const status of statusesToCheck) {
              const checkResponse = await fetch(`${API_URL}/cargo-orders?status=${status}&limit=10`, {
                headers: {
                  'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`,
                  'Content-Type': 'application/json'
                }
              });
              if (checkResponse.ok) {
                const checkData = await checkResponse.json();
                const checkList = Array.isArray(checkData) ? checkData : (checkData.orders || checkData.data || []);
                if (checkList.length > 0) {
                  console.log(`Found ${checkList.length} orders with status ${status}`);
                }
              }
            }
          } catch (debugErr) {
            console.error('Error checking other statuses:', debugErr);
          }
        }
      } catch (err) {
        console.error(`Error fetching orders with status WAREHOUSE_STORED:`, err);
        setError(`Lỗi khi tải dữ liệu: ${err.message}`);
      }

      // Format dữ liệu để hiển thị
      const formatDate = (dateStr) => {
        if (!dateStr) return '';
        try {
          const date = new Date(dateStr);
          if (isNaN(date.getTime())) return '';
          return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          });
        } catch {
          return '';
        }
      };

      const formattedOrders = allOrdersData.map(order => {
        // Trang này chỉ hiển thị đơn hàng đã tới kho (WAREHOUSE_STORED)
        const inventoryStatus = 'STORED';
        const displayStatus = 'Đang lưu kho';

        // Lấy ngày từ updated_at hoặc created_at
        const orderDate = order.updated_at || order.created_at || null;
        const formattedDate = formatDate(orderDate);

        return {
          id: order.order_id || order.order_code,
          order_id: order.order_id,
          order_code: order.order_code,
          status: displayStatus,
          inventory_status: inventoryStatus,
          order_status: order.status, // Giữ nguyên status gốc
          customer: order.customer_name || order.contact_name || 'Khách hàng',
          cargo_name: order.cargo_name || '—',
          cargo_type: order.cargo_type || '—',
          weight: Number(order.weight_kg) || 0,
          volume_m3: Number(order.volume_m3) || 0,
          pallets: 0, // Có thể tính từ weight nếu cần
          from: order.pickup_address || 'Chưa xác định',
          to: order.dropoff_address || 'Chưa xác định',
          temp: order.require_cold ? 'Lạnh' : 'Thường',
          entered_at: formattedDate,
          entered_at_datetime: orderDate,
          stored_at: formattedDate,
          stored_at_datetime: orderDate,
          shipped_at: '',
          shipped_at_datetime: null,
          location: null,
          notes: order.note || '',
          company_name: order.company_name,
          vehicle_id: order.vehicle_id,
          license_plate: order.license_plate,
        };
      });

      console.log('Formatted orders:', formattedOrders.length);
      
      setAllOrders(formattedOrders);
      setOrders(formattedOrders);
      
      if (formattedOrders.length === 0) {
        console.warn('No formatted orders to display');
      }

      // Load KPIs từ warehouse API
      try {
        const kpisResponse = await fetch(`${API_URL}/warehouse/kpis`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`
          }
        });
        if (kpisResponse.ok) {
          const kpisData = await kpisResponse.json();
          setKpis(kpisData);
        }
      } catch (err) {
        console.error("Error loading KPIs:", err);
      }
    } catch (err) {
      console.error("Error loading warehouse data:", err);
      setError(err.message || "Không thể tải dữ liệu kho");
      setOrders([]);
      setKpis(null);
    } finally {
      setLoading(false);
    }
  };

  // Load data khi component mount
  useEffect(() => {
    loadData();
  }, []);

  // Filter và sort data
  const rows = useMemo(() => {
    let filtered = [...allOrders];

    // Search filter
    if (searchValue) {
      const search = searchValue.toLowerCase();
      filtered = filtered.filter(item =>
        item.id?.toLowerCase().includes(search) ||
        item.order_code?.toLowerCase().includes(search) ||
        item.customer?.toLowerCase().includes(search) ||
        item.cargo_name?.toLowerCase().includes(search)
      );
    }

    // Status filter - trang này chỉ có STORED nên không cần filter
    // Giữ lại để tương thích với component

    // Date filter
    if (dateFilter !== "all") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      filtered = filtered.filter(item => {
        let entryDate = item.entered_at;
        if (!entryDate) return false;
        
        let date;
        if (entryDate.includes('/')) {
          const parts = entryDate.split('/');
          if (parts.length === 3) {
            date = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
          } else {
            return false;
          }
        } else {
          date = new Date(entryDate);
        }
        
        if (isNaN(date.getTime())) return false;
        date.setHours(0, 0, 0, 0);
        
        if (dateFilter === "today") {
          return date.getTime() === today.getTime();
        } else if (dateFilter === "week") {
          const weekAgo = new Date(today);
          weekAgo.setDate(weekAgo.getDate() - 7);
          return date >= weekAgo;
        } else if (dateFilter === "month") {
          const monthAgo = new Date(today);
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          return date >= monthAgo;
        }
        return true;
      });
    }

    // Sort
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aVal = a[sortConfig.key];
        let bVal = b[sortConfig.key];

        if (sortConfig.key.includes('_at') || sortConfig.key.includes('date')) {
          aVal = aVal ? new Date(aVal) : new Date(0);
          bVal = bVal ? new Date(bVal) : new Date(0);
        }

        if (typeof aVal === 'number' || typeof bVal === 'number') {
          aVal = Number(aVal) || 0;
          bVal = Number(bVal) || 0;
        }

        if (typeof aVal === 'string') {
          aVal = aVal.toLowerCase();
        }
        if (typeof bVal === 'string') {
          bVal = bVal.toLowerCase();
        }

        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [allOrders, searchValue, statusFilter, dateFilter, sortConfig]);

  // Pagination
  const totalPages = Math.ceil(rows.length / itemsPerPage);
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return rows.slice(start, end);
  }, [rows, currentPage, itemsPerPage]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchValue, statusFilter, dateFilter]);

  function handleReload() {
    loadData();
  }

  const handleSearch = (value) => {
    setSearchValue(value);
  };

  const handleStatusFilter = (value) => {
    setStatusFilter(value);
  };

  const handleDateFilter = (value) => {
    setDateFilter(value);
  };

  const handleSort = (key, direction) => {
    setSortConfig({ key, direction });
  };

  const handleRowClick = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  return (
    <AppLayout>
      <section className="px-6 md:px-8 py-6 md:py-8 space-y-6">
        <TitleControls
          onReload={handleReload}
          onStatusFilter={handleStatusFilter}
          onDateFilter={handleDateFilter}
          statusFilter={statusFilter}
          dateFilter={dateFilter}
        />

        <KpiStrip kpis={kpis} operations={allOrders} loading={loading} />

        {/* Bảng dữ liệu */}
        <section className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-slate-600">Đang tải dữ liệu...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700 text-sm">{error}</p>
              <button
                onClick={handleReload}
                className="mt-3 inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg text-white bg-red-600 hover:bg-red-700 active:scale-[.98]"
              >
                Thử lại
              </button>
            </div>
          ) : rows.length === 0 ? (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
              <div className="text-blue-600 text-lg font-semibold mb-2">📦 Không có đơn hàng nào đang lưu kho</div>
              <p className="text-blue-700 text-sm mb-4">
                Hiện tại không có đơn hàng nào với trạng thái <strong>"Đã tới kho"</strong> (WAREHOUSE_STORED).
              </p>
              <div className="bg-white rounded-lg p-4 mb-4 text-left max-w-md mx-auto">
                <p className="text-sm font-semibold text-slate-700 mb-2">Để có đơn hàng hiển thị ở đây:</p>
                <ol className="text-sm text-slate-600 space-y-1 list-decimal list-inside">
                  <li>Vào trang <strong>"Nhập kho & Xuất kho"</strong></li>
                  <li>Tab <strong>"Nhập kho"</strong> - tìm đơn hàng có status WAREHOUSE_RECEIVED</li>
                  <li>Nhập mã đơn hàng và click <strong>"Nhập kho"</strong></li>
                  <li>Đơn hàng sẽ chuyển sang status WAREHOUSE_STORED và hiển thị ở đây</li>
                </ol>
              </div>
              <button
                onClick={() => window.location.href = '/warehouse-in-out'}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
                Đi đến trang Nhập kho & Xuất kho
              </button>
            </div>
          ) : (
            <>
              <WarehouseTable 
                rows={paginatedRows} 
                onRowClick={handleRowClick}
                sortConfig={sortConfig}
                onSort={handleSort}
                searchValue={searchValue}
                onSearch={handleSearch}
                pagination={
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                }
              />
              <div className="text-sm text-slate-600 text-center mt-2">
                Hiển thị {paginatedRows.length} / {rows.length} đơn hàng
              </div>
            </>
          )}
        </section>
      </section>

      {/* Order Detail Modal */}
      <OrderDetailModal
        order={selectedOrder}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </AppLayout>
  );
}
