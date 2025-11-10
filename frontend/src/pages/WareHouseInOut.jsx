import { useMemo, useState, useEffect, useRef } from "react";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import AppLayout from "../components/layout/AppLayout.jsx";
import { getApiUrl } from "../lib/utils.js";

const API_URL = getApiUrl();

import KpiStrip from "../components/warehouse/KpiStrip";
import WarehouseTable from "../components/warehouse/WarehouseTable";
import OrderDetailModal from "../components/warehouse/OrderDetailModal";
import Pagination from "../components/warehouse/Pagination";

export default function WareHouseInOut() {
  // Tab state
  const [activeTab, setActiveTab] = useState("nhap"); // "nhap" hoặc "xuat"

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
  const [incomingOrders, setIncomingOrders] = useState([]); // WAREHOUSE_RECEIVED
  const [storedOrders, setStoredOrders] = useState([]); // WAREHOUSE_STORED + WAREHOUSE_OUTBOUND
  const [kpis, setKpis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter & Search state
  const [searchValue, setSearchValue] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  
  // Modal state
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Order ID input for nhập/xuất kho
  const [orderIdInput, setOrderIdInput] = useState("");
  const [loadingAction, setLoadingAction] = useState(false);
  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);
  const exportDropdownRef = useRef(null);

  // Load data từ API - lấy cargo orders theo status
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

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

      // Tab "Nhập kho": Lấy đơn hàng với status WAREHOUSE_RECEIVED
      try {
        const incomingResponse = await fetch(`${API_URL}/cargo-orders?status=WAREHOUSE_RECEIVED&limit=1000`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`
          }
        });
        
        let incomingData = [];
        if (incomingResponse.ok) {
          const data = await incomingResponse.json();
          const ordersList = Array.isArray(data) ? data : (data.orders || data.data || []);
          
          incomingData = ordersList.map(order => ({
            id: order.order_id || order.order_code,
            order_id: order.order_id,
            order_code: order.order_code,
            status: 'Đã tới kho',
            inventory_status: 'INCOMING',
            order_status: order.status,
            customer: order.customer_name || order.contact_name || 'Khách hàng',
            cargo_name: order.cargo_name || '—',
            cargo_type: order.cargo_type || '—',
            weight: Number(order.weight_kg) || 0,
            volume_m3: Number(order.volume_m3) || 0,
            pallets: 0,
            from: order.pickup_address || 'Chưa xác định',
            to: order.dropoff_address || 'Chưa xác định',
            temp: order.require_cold ? 'Lạnh' : 'Thường',
            entered_at: formatDate(order.updated_at || order.created_at),
            entered_at_datetime: order.updated_at || order.created_at,
            entered_at_raw: order.updated_at || order.created_at,
            location: null,
            notes: order.note || '',
            company_name: order.company_name,
            vehicle_id: order.vehicle_id,
            license_plate: order.license_plate,
          }));
        }
        setIncomingOrders(incomingData);
      } catch (err) {
        console.error("Error loading incoming orders:", err);
        setIncomingOrders([]);
      }

      // Tab "Xuất kho": Lấy đơn hàng với status WAREHOUSE_STORED (đã tới kho)
      try {
        const storedResponse = await fetch(`${API_URL}/cargo-orders?status=WAREHOUSE_STORED&limit=1000`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`
          }
        });

        let storedData = [];

        if (storedResponse.ok) {
          const data = await storedResponse.json();
          const ordersList = Array.isArray(data) ? data : (data.orders || data.data || []);
          storedData = ordersList.map(order => ({
            id: order.order_id || order.order_code,
            order_id: order.order_id,
            order_code: order.order_code,
            status: 'Đang lưu kho',
            inventory_status: 'STORED',
            order_status: order.status,
            customer: order.customer_name || order.contact_name || 'Khách hàng',
            cargo_name: order.cargo_name || '—',
            cargo_type: order.cargo_type || '—',
            weight: Number(order.weight_kg) || 0,
            volume_m3: Number(order.volume_m3) || 0,
            pallets: 0,
            from: order.pickup_address || 'Chưa xác định',
            to: order.dropoff_address || 'Chưa xác định',
            temp: order.require_cold ? 'Lạnh' : 'Thường',
            stored_at: formatDate(order.updated_at || order.created_at),
            stored_at_datetime: order.updated_at || order.created_at,
            stored_at_raw: order.updated_at || order.created_at,
            entered_at: formatDate(order.updated_at || order.created_at),
            entered_at_datetime: order.updated_at || order.created_at,
            location: null,
            notes: order.note || '',
            company_name: order.company_name,
            vehicle_id: order.vehicle_id,
            license_plate: order.license_plate,
          }));
        }

        setStoredOrders(storedData);
      } catch (err) {
        console.error("Error loading stored/outbound orders:", err);
        setStoredOrders([]);
      }

      // Load KPIs
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
      setIncomingOrders([]);
      setStoredOrders([]);
      setKpis(null);
    } finally {
      setLoading(false);
    }
  };

  // Load data khi component mount
  useEffect(() => {
    loadData();
  }, []);

  // Get current tab data
  const currentTabData = activeTab === "nhap" ? incomingOrders : storedOrders;

  // Filter và sort data
  const rows = useMemo(() => {
    let filtered = [...currentTabData];

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

    // Date filter
    if (dateFilter !== "all") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      filtered = filtered.filter(item => {
        let entryDate = activeTab === "nhap" ? item.entered_at : (item.stored_at || item.entered_at);
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
  }, [currentTabData, searchValue, dateFilter, sortConfig, activeTab]);

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
  }, [searchValue, dateFilter, activeTab]);

  function handleReload() {
    loadData();
  }

  const handleSearch = (value) => {
    setSearchValue(value);
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

  // Handler nhập kho - chuyển từ WAREHOUSE_RECEIVED -> WAREHOUSE_STORED
  const handleOrderIdSubmit = async () => {
    if (!orderIdInput.trim()) {
      alert("Vui lòng nhập mã đơn hàng");
      return;
    }

    try {
      setLoadingAction(true);
      const orderId = orderIdInput.trim().toUpperCase();

      // Tìm đơn hàng trong danh sách incomingOrders
      const orderItem = incomingOrders.find(
        item => (item.id === orderId || item.order_id === orderId || item.order_code === orderId)
      );

      if (!orderItem) {
        alert(`Không tìm thấy đơn hàng ${orderId} đang chờ nhập kho hoặc đơn hàng đã được nhập kho rồi.`);
        setOrderIdInput("");
        setLoadingAction(false);
        return;
      }

      // Xác nhận nhập kho
      if (!window.confirm(`Xác nhận nhập kho cho đơn hàng ${orderId}?`)) {
        setLoadingAction(false);
        return;
      }

      // Cập nhật status từ WAREHOUSE_RECEIVED sang WAREHOUSE_STORED
      const response = await fetch(`${API_URL}/cargo-orders/${orderItem.order_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`
        },
        body: JSON.stringify({
          status: 'WAREHOUSE_STORED'
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || 'Không thể cập nhật trạng thái đơn hàng');
      }

      alert(`✅ Đã nhập kho đơn hàng ${orderId} thành công!`);
      setOrderIdInput("");
      await loadData(); // Reload data
    } catch (err) {
      console.error("Error storing order:", err);
      alert("Lỗi khi nhập kho: " + err.message);
    } finally {
      setLoadingAction(false);
    }
  };

  // Handler xuất kho - chuyển từ WAREHOUSE_STORED -> COMPLETED
  const handleOrderIdExport = async () => {
    if (!orderIdInput.trim()) {
      alert("Vui lòng nhập mã đơn hàng");
      return;
    }

    try {
      setLoadingAction(true);
      const orderId = orderIdInput.trim().toUpperCase();

      // Tìm đơn hàng trong danh sách storedOrders (đã tới kho)
      const orderItem = storedOrders.find(
        item => (item.id === orderId || item.order_id === orderId || item.order_code === orderId)
      );

      if (!orderItem) {
        alert(`Không tìm thấy đơn hàng ${orderId} đang lưu kho. Đơn hàng có thể đã được xuất kho rồi hoặc chưa được nhập kho.`);
        setOrderIdInput("");
        setLoadingAction(false);
        return;
      }

      // Xác nhận xuất kho
      if (!window.confirm(`Xác nhận xuất kho cho đơn hàng ${orderId}?`)) {
        setLoadingAction(false);
        return;
      }

      // Cập nhật status sang COMPLETED
      const response = await fetch(`${API_URL}/cargo-orders/${orderItem.order_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`
        },
        body: JSON.stringify({
          status: 'COMPLETED'
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || 'Không thể cập nhật trạng thái đơn hàng');
      }

      alert(`✅ Đã xuất kho đơn hàng ${orderId} thành công!`);
      setOrderIdInput("");
      await loadData(); // Reload data
    } catch (err) {
      console.error("Error shipping order:", err);
      alert("Lỗi khi xuất kho: " + err.message);
    } finally {
      setLoadingAction(false);
    }
  };

  // Close export dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (exportDropdownRef.current && !exportDropdownRef.current.contains(event.target)) {
        setExportDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handler xuất Excel
  const handleExportExcel = async (type, value) => {
    try {
      let incomingData = [];
      let storedData = [];
      
      if (type === "date" || type === "month") {
        // Export theo ngày/tháng: Lấy từ cargo orders
        const statuses = activeTab === "nhap" 
          ? ['WAREHOUSE_RECEIVED'] 
          : ['WAREHOUSE_STORED'];
        
        for (const status of statuses) {
          const response = await fetch(`${API_URL}/cargo-orders?status=${status}&limit=10000`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            const ordersList = Array.isArray(data) ? data : (data.orders || data.data || []);
            
            // Filter theo ngày/tháng
            let filteredOrders = ordersList;
            if (type === "date" && value) {
              const targetDate = new Date(value);
              targetDate.setHours(0, 0, 0, 0);
              filteredOrders = ordersList.filter(order => {
                const orderDate = new Date(order.updated_at || order.created_at);
                orderDate.setHours(0, 0, 0, 0);
                return orderDate.getTime() === targetDate.getTime();
              });
            } else if (type === "month" && value) {
              const [year, month] = value.split('-');
              filteredOrders = ordersList.filter(order => {
                const orderDate = new Date(order.updated_at || order.created_at);
                return orderDate.getFullYear() === parseInt(year) && 
                       (orderDate.getMonth() + 1) === parseInt(month);
              });
            }
            
            if (status === 'WAREHOUSE_RECEIVED') {
              incomingData = filteredOrders;
            } else {
              storedData.push(...filteredOrders);
            }
          }
        }
      } else {
        // Export dữ liệu hiện tại
        incomingData = activeTab === "nhap" ? incomingOrders : [];
        storedData = activeTab === "xuat" ? storedOrders : [];
      }

      if (incomingData.length === 0 && storedData.length === 0) {
        alert("Không có dữ liệu để xuất.");
        return;
      }

      const formatDateTime = (dateStr) => {
        if (!dateStr) return "";
        try {
          const date = new Date(dateStr);
          if (isNaN(date.getTime())) return "";
          return date.toLocaleString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          });
        } catch {
          return dateStr || "";
        }
      };

      // Chuẩn bị dữ liệu cho sheet "Nhập kho"
      const incomingSheetData = incomingData.map(item => ({
        "Mã đơn hàng": item.id || item.order_id || "",
        "Khách hàng": item.customer || "Khách hàng",
        "Tên hàng": item.cargo_name || "",
        "Loại hàng": item.cargo_type || "",
        "Khối lượng (KG)": item.weight || 0,
        "Số pallets": item.pallets || 0,
        "Thể tích (m³)": item.volume_m3 || 0,
        "Nhiệt độ": item.temp || "Thường",
        "Trạng thái": item.status || "Đang chờ nhập",
        "Ngày nhập kho": item.entered_at || "",
        "Giờ nhập kho": formatDateTime(item.entered_at_datetime),
        "Địa chỉ lấy hàng": item.from || "",
        "Địa chỉ giao hàng": item.to || "",
        "Ghi chú": item.notes || ""
      }));

      // Chuẩn bị dữ liệu cho sheet "Xuất kho"
      const storedSheetData = storedData.map(item => ({
        "Mã đơn hàng": item.id || item.order_id || "",
        "Khách hàng": item.customer || "Khách hàng",
        "Tên hàng": item.cargo_name || "",
        "Loại hàng": item.cargo_type || "",
        "Khối lượng (KG)": item.weight || 0,
        "Số pallets": item.pallets || 0,
        "Thể tích (m³)": item.volume_m3 || 0,
        "Nhiệt độ": item.temp || "Thường",
        "Trạng thái": item.status || "Đang lưu kho",
        "Ngày tới kho": item.stored_at || item.entered_at || "",
        "Giờ tới kho": formatDateTime(item.stored_at_datetime || item.entered_at_datetime),
        "Ngày xuất kho": item.shipped_at || "",
        "Giờ xuất kho": formatDateTime(item.shipped_at_datetime),
        "Địa chỉ lấy hàng": item.from || "",
        "Địa chỉ giao hàng": item.to || "",
        "Ghi chú": item.notes || ""
      }));

      // Tạo worksheet
      const wsNhap = XLSX.utils.json_to_sheet(incomingSheetData);
      const wsXuat = XLSX.utils.json_to_sheet(storedSheetData);

      // Điều chỉnh độ rộng cột
      const columnWidthsNhap = [
        { wch: 12 }, { wch: 20 }, { wch: 25 }, { wch: 15 }, { wch: 15 },
        { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 18 }, { wch: 18 },
        { wch: 20 }, { wch: 30 }, { wch: 30 }, { wch: 30 }
      ];
      const columnWidthsXuat = [
        { wch: 12 }, { wch: 20 }, { wch: 25 }, { wch: 15 }, { wch: 15 },
        { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 18 }, { wch: 18 },
        { wch: 20 }, { wch: 18 }, { wch: 20 }, { wch: 30 }, { wch: 30 }, { wch: 30 }
      ];

      wsNhap['!cols'] = columnWidthsNhap;
      wsXuat['!cols'] = columnWidthsXuat;

      // Tạo workbook
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, wsNhap, 'Nhập kho');
      XLSX.utils.book_append_sheet(wb, wsXuat, 'Xuất kho');

      // Tên file
      let fileName;
      if (type === "date") {
        fileName = `Warehouse_NhapXuat_${value}.xlsx`;
      } else if (type === "month") {
        fileName = `Warehouse_NhapXuat_${value}.xlsx`;
      } else {
        const today = new Date();
        const dateStr = today.toISOString().split('T')[0];
        fileName = `Warehouse_NhapXuat_${dateStr}.xlsx`;
      }

      // Xuất file
      const wbout = XLSX.write(wb, { 
        bookType: 'xlsx', 
        type: 'array',
        cellStyles: true
      });
      
      saveAs(new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), fileName);

      alert(`✅ Đã xuất Excel thành công!\n- Nhập kho: ${incomingData.length} đơn hàng\n- Xuất kho: ${storedData.length} đơn hàng`);
    } catch (err) {
      console.error("Error exporting Excel:", err);
      alert("Lỗi khi xuất file Excel: " + err.message);
    }
  };

  return (
    <AppLayout>
      <section className="px-6 md:px-8 py-6 md:py-8 space-y-6">
        <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Nhập kho & Xuất kho</h2>
            <p className="text-xs text-slate-500 mt-1">Quản lý đơn hàng đang nhập kho và đang xuất kho. Nhập mã đơn hàng để thực hiện nhập/xuất kho.</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Date filter */}
            <select
              value={dateFilter || "all"}
              onChange={(e) => handleDateFilter(e.target.value)}
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tất cả thời gian</option>
              <option value="today">Hôm nay</option>
              <option value="week">Tuần này</option>
              <option value="month">Tháng này</option>
            </select>

            {/* Export Excel Dropdown */}
            <div className="relative" ref={exportDropdownRef}>
              <button
                onClick={() => setExportDropdownOpen(!exportDropdownOpen)}
                className="h-10 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-sm flex items-center gap-2 font-medium"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Xuất Excel</span>
                <svg className={`w-4 h-4 transition-transform ${exportDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {exportDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg ring-1 ring-black/5 py-1 z-50">
                  <button
                    onClick={() => {
                      handleExportExcel("current", null);
                      setExportDropdownOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2 border-b border-slate-100"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    <span>Xuất dữ liệu hiện tại</span>
                  </button>
                  <button
                    onClick={() => {
                      const date = prompt("Nhập ngày xuất (định dạng: YYYY-MM-DD)\nVí dụ: 2024-01-15");
                      if (date && date.match(/^\d{4}-\d{2}-\d{2}$/)) {
                        handleExportExcel("date", date);
                        setExportDropdownOpen(false);
                      } else if (date) {
                        alert("Định dạng ngày không đúng. Vui lòng nhập theo định dạng YYYY-MM-DD");
                      }
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>Xuất theo ngày</span>
                  </button>
                  <button
                    onClick={() => {
                      const month = prompt("Nhập tháng xuất (định dạng: YYYY-MM)\nVí dụ: 2024-01");
                      if (month && month.match(/^\d{4}-\d{2}$/)) {
                        handleExportExcel("month", month);
                        setExportDropdownOpen(false);
                      } else if (month) {
                        alert("Định dạng tháng không đúng. Vui lòng nhập theo định dạng YYYY-MM");
                      }
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 2v6M6 18v6M12 2v6M12 18v6M18 2v6M18 18v6M3 6h18M3 12h18M3 18h18" />
                    </svg>
                    <span>Xuất theo tháng</span>
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={handleReload}
              className="h-10 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-sm flex items-center gap-2"
            >
              ↻ <span>Tải lại</span>
            </button>
          </div>
        </div>

        {/* KPI Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          {(() => {
            const currentData = activeTab === "nhap" ? incomingOrders : storedOrders;
            const totalWeight = currentData.reduce((sum, item) => sum + (Number(item.weight) || 0), 0);
            const totalPallets = currentData.reduce((sum, item) => sum + (Number(item.pallets) || 0), 0);
            
            const stats = activeTab === "nhap" ? [
              { icon: "📥", label: "Đang chờ nhập", value: incomingOrders.length, subtitle: `${totalPallets} pallets`, bg: "bg-blue-50" },
              { icon: "📦", label: "Tổng khối lượng", value: `${(totalWeight / 1000).toFixed(1)}T`, subtitle: `${totalWeight.toLocaleString()} KG`, bg: "bg-emerald-50" },
              { icon: "⏱️", label: "Đã chờ", value: incomingOrders.length, subtitle: "Sẵn sàng nhập kho", bg: "bg-orange-50" },
              { icon: "📊", label: "Tổng đơn", value: incomingOrders.length, subtitle: "Đơn hàng mới", bg: "bg-slate-50" }
            ] : [
              { icon: "📤", label: "Đang chờ xuất", value: storedOrders.length, subtitle: `${totalPallets} pallets`, bg: "bg-orange-50" },
              { icon: "📦", label: "Tổng khối lượng", value: `${(totalWeight / 1000).toFixed(1)}T`, subtitle: `${totalWeight.toLocaleString()} KG`, bg: "bg-emerald-50" },
              { icon: "⏱️", label: "Đã lưu", value: storedOrders.length, subtitle: "Sẵn sàng xuất kho", bg: "bg-blue-50" },
              { icon: "📊", label: "Tổng đơn", value: storedOrders.length, subtitle: "Đơn hàng lưu kho", bg: "bg-slate-50" }
            ];

            return stats.map((stat, idx) => (
              <div key={idx} className={`rounded-xl p-4 border border-slate-200 ${stat.bg}`}>
                <div className="flex items-center gap-2 text-sm text-slate-600 mb-1">
                  <span>{stat.icon}</span>
                  <span>{stat.label}</span>
                </div>
                <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
                {stat.subtitle && (
                  <div className="text-xs text-slate-500 mt-1">{stat.subtitle}</div>
                )}
              </div>
            ));
          })()}
        </div>

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
          ) : (
            <>
              <WarehouseTable 
                rows={paginatedRows} 
                onRowClick={handleRowClick}
                sortConfig={sortConfig}
                onSort={handleSort}
                searchValue={searchValue}
                onSearch={handleSearch}
                orderIdInput={orderIdInput}
                onOrderIdInputChange={setOrderIdInput}
                onOrderIdSubmit={activeTab === "nhap" ? handleOrderIdSubmit : null}
                onOrderIdExport={activeTab === "xuat" ? handleOrderIdExport : null}
                loadingAction={loadingAction}
                tabs={[
                  { key: "nhap", icon: "📥", label: "Nhập kho", count: incomingOrders.length },
                  { key: "xuat", icon: "📤", label: "Xuất kho", count: storedOrders.length }
                ]}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                showTitle={false}
                showSearch={false}
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
