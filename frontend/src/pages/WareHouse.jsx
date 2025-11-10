import { useMemo, useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../components/layout/AppLayout.jsx";
import { warehouseAPI } from "../lib/api";

import TitleControls from "../components/warehouse/TitleControls";
import KpiStrip from "../components/warehouse/KpiStrip";
import WarehouseTable from "../components/warehouse/WarehouseTable";
import OrderDetailModal from "../components/warehouse/OrderDetailModal";
import Pagination from "../components/warehouse/Pagination";

export default function WarehouseInOutPage() {
  const navigate = useNavigate();

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

    // Kiểm tra ngay khi mount
    if (!checkRole()) {
      return;
    }

    // Listen for storage changes (khi user logout ở tab khác hoặc đổi role)
    const handleStorageChange = () => {
      if (!checkRole()) {
        return;
      }
    };

    window.addEventListener("storage", handleStorageChange);
    
    // Kiểm tra lại định kỳ (mỗi 2 giây) để catch các thay đổi role
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
    // Xóa tất cả dữ liệu authentication
    localStorage.removeItem("gd_user");
    localStorage.removeItem("role");
    localStorage.removeItem("isAdmin");
    localStorage.removeItem("remember");
    localStorage.removeItem("auth_token");
    
    // Sử dụng window.location.href để đảm bảo redirect hoàn toàn
    window.location.href = "/sign-in";
  };

  // Data state
  const [operations, setOperations] = useState([]);
  const [allOperations, setAllOperations] = useState([]); // Lưu tất cả data để filter
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

  // Load data từ API - lấy warehouse operations
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load operations từ WarehouseOperations
      const operationsData = await warehouseAPI.getOperations({
        limit: 1000,
      });
      
      // Format dữ liệu để hiển thị
      // Trang này hiển thị: INCOMING, STORED, OUTGOING (tất cả đơn hàng đang trong kho)
      const formattedOperations = (operationsData.operations || []).map(op => {
        const isInOperation = op.type === 'in' || op.operation_type === 'IN';
        const isOutOperation = op.type === 'out' || op.operation_type === 'OUT';
        
        // Xác định inventory_status dựa trên operation_type và status
        // INCOMING: operation IN với status PENDING
        // STORED: operation IN với status COMPLETED hoặc IN_PROGRESS
        // OUTGOING: operation OUT với status PENDING
        // SHIPPED: operation OUT với status COMPLETED (không hiển thị ở trang này)
        let inventoryStatus = 'INCOMING';
        let displayStatus = 'Đang chờ nhập kho';
        
        // Kiểm tra status từ backend (có thể là text hoặc status code)
        const statusText = op.status || '';
        const isPending = statusText.includes('PENDING') || statusText.includes('Chờ') || statusText.includes('Đang nhập') || statusText.includes('Đang xuất');
        const isInProgress = statusText.includes('IN_PROGRESS') || statusText.includes('Đang xử lý') || statusText.includes('Lưu kho');
        const isCompleted = statusText.includes('COMPLETED') || statusText.includes('Đã xuất');
        
        if (isInOperation) {
          if (isPending) {
            inventoryStatus = 'INCOMING';
            displayStatus = 'Đang chờ nhập kho';
          } else if (isInProgress || isCompleted) {
            inventoryStatus = 'STORED';
            displayStatus = 'Đang lưu kho';
          } else {
            // Mặc định cho IN operation
            inventoryStatus = 'INCOMING';
            displayStatus = 'Đang chờ nhập kho';
          }
        } else if (isOutOperation) {
          if (isPending) {
            inventoryStatus = 'OUTGOING';
            displayStatus = 'Chuẩn bị xuất kho';
          } else {
            // SHIPPED - không hiển thị ở trang này
            inventoryStatus = 'SHIPPED';
            displayStatus = 'Đã xuất kho';
          }
        }
        
        // Lấy ngày từ actual_time hoặc created_at
        const operationDate = op.actual_time || op.created_at || op.eta || null;
        
        // Format ngày nếu có
        const formatDate = (dateStr) => {
          if (!dateStr) return '';
          try {
            if (typeof dateStr === 'string' && dateStr.includes('/')) {
              return dateStr;
            }
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

        return {
          ...op,
          operation_id: op.operation_id,
          id: op.id || op.order_id,
          order_id: op.order_id || op.id,
          type: op.type || (op.operation_type === 'IN' ? 'in' : 'out'),
          operation_type: op.operation_type,
          status: displayStatus,
          customer: op.customer || 'Khách hàng',
          from: op.from || 'Chưa xác định',
          to: op.to || 'Chưa xác định',
          weight: op.weight || 0,
          pallets: op.pallets || 0,
          docks: op.docks || 'D1',
          carrier: op.carrier || 'N/A',
          eta: formatDate(operationDate),
          temp: op.temp || 'Thường',
          cargo_name: op.cargo_name || '—',
          cargo_type: op.cargo_type || '—',
          warehouse_name: op.warehouse_name || '—',
          // Ngày tới kho: có khi là INCOMING hoặc STORED
          entered_at: (inventoryStatus === 'INCOMING' || inventoryStatus === 'STORED') ? formatDate(operationDate) : '',
          entered_at_datetime: (inventoryStatus === 'INCOMING' || inventoryStatus === 'STORED') ? operationDate : null,
          // Ngày xuất kho: có khi là OUTGOING
          shipped_at: inventoryStatus === 'OUTGOING' ? formatDate(operationDate) : '',
          shipped_at_datetime: inventoryStatus === 'OUTGOING' ? operationDate : null,
          stored_at: inventoryStatus === 'STORED' ? formatDate(operationDate) : '',
          stored_at_datetime: inventoryStatus === 'STORED' ? operationDate : null,
          inventory_status: inventoryStatus
        };
      });
      
      // Filter: chỉ hiển thị INCOMING, STORED, OUTGOING (không hiển thị SHIPPED)
      const filteredOperations = formattedOperations.filter(item => 
        item.inventory_status === 'INCOMING' || 
        item.inventory_status === 'STORED' || 
        item.inventory_status === 'OUTGOING'
      );
      
      setAllOperations(filteredOperations);
      setOperations(filteredOperations);

      // Load KPIs
      const kpisData = await warehouseAPI.getKPIs();
      setKpis(kpisData);
    } catch (err) {
      console.error("Error loading warehouse data:", err);
      setError(err.message || "Không thể tải dữ liệu kho");
      // Fallback to empty data
      setOperations([]);
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
    let filtered = [...allOperations];

    // Search filter
    if (searchValue) {
      const search = searchValue.toLowerCase();
      filtered = filtered.filter(item =>
        item.id?.toLowerCase().includes(search) ||
        item.customer?.toLowerCase().includes(search) ||
        item.cargo_name?.toLowerCase().includes(search)
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(item => item.inventory_status === statusFilter);
    }

    // Date filter
    if (dateFilter !== "all") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      filtered = filtered.filter(item => {
        // Try to get date from entered_at (format: DD/MM/YYYY or ISO)
        let entryDate = item.entered_at;
        if (!entryDate) return false;
        
        // Parse date (handle both DD/MM/YYYY and ISO format)
        let date;
        if (entryDate.includes('/')) {
          // Format: DD/MM/YYYY
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

        // Handle date strings
        if (sortConfig.key.includes('_at') || sortConfig.key.includes('date')) {
          aVal = aVal ? new Date(aVal) : new Date(0);
          bVal = bVal ? new Date(bVal) : new Date(0);
        }

        // Handle numbers
        if (typeof aVal === 'number' || typeof bVal === 'number') {
          aVal = Number(aVal) || 0;
          bVal = Number(bVal) || 0;
        }

        // Handle strings
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
  }, [allOperations, searchValue, statusFilter, dateFilter, sortConfig]);

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

  // Handler xuất Excel - export dữ liệu đang filter hiện tại hoặc theo ngày/tháng
  const handleExportExcel = async (type, value) => {
    try {
      let data = [];
      
      if (type === "date" || type === "month") {
        // Export theo ngày/tháng từ API
        const filters = {
          limit: 10000,
        };

        if (type === "date") {
          filters.date = value; // YYYY-MM-DD
        } else if (type === "month") {
          filters.month = value; // YYYY-MM
        }

        // Dùng operations thay vì inventory
        const operationsData = await warehouseAPI.getOperations(filters);
        // Format operations giống như loadData
        data = (operationsData.operations || []).map(op => {
          const isInOperation = op.type === 'in' || op.operation_type === 'IN';
          const isOutOperation = op.type === 'out' || op.operation_type === 'OUT';
          const operationDate = op.actual_time || op.created_at || op.eta || null;
          
          const formatDate = (dateStr) => {
            if (!dateStr) return '';
            try {
              if (typeof dateStr === 'string' && dateStr.includes('/')) {
                return dateStr;
              }
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
          
          return {
            ...op,
            status: isInOperation ? 'Nhập kho' : 'Xuất kho',
            entered_at: isInOperation ? formatDate(operationDate) : '',
            shipped_at: isOutOperation ? formatDate(operationDate) : '',
            inventory_status: isInOperation ? 'INCOMING' : 'SHIPPED'
          };
        });
      } else {
        // Export dữ liệu đang filter hiện tại (rows đã được filter)
        data = rows;
      }

      if (data.length === 0) {
        alert("Không có dữ liệu để xuất.");
        return;
      }

      // Chuẩn bị dữ liệu cho Excel (CSV format) - tập trung vào thông tin cơ bản cho WMS
      const headers = [
        "Mã đơn hàng",
        "Khách hàng",
        "Tên hàng",
        "Loại hàng",
        "Khối lượng (KG)",
        "Số pallets",
        "Thể tích (m³)",
        "Nhiệt độ",
        "Trạng thái",
        "Ngày tới kho",
        "Ngày xuất kho",
        "Địa chỉ giao hàng"
      ];

      const rows = data.map(item => [
        item.id || "",
        item.customer || "",
        item.cargo_name || "",
        item.cargo_type || "",
        item.weight || 0,
        item.pallets || 0,
        item.volume_m3 || 0,
        item.temp || "",
        item.status || "",
        item.entered_at || "",
        item.shipped_at || "",
        item.to || ""
      ]);

      // Tạo CSV content
      const csvContent = [
        headers.map(h => `"${h.replace(/"/g, '""')}"`).join(","),
        ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      ].join("\n");

      // Tạo BOM cho UTF-8 (để Excel hiển thị tiếng Việt đúng)
      const BOM = "\uFEFF";
      const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      
      let fileName;
      if (type === "date") {
        fileName = `warehouse_orders_${value}.csv`;
      } else if (type === "month") {
        fileName = `warehouse_orders_${value}.csv`;
      } else {
        const filterInfo = [];
        if (searchValue) filterInfo.push(`search_${searchValue.substring(0, 10)}`);
        if (statusFilter !== "all") filterInfo.push(statusFilter);
        if (dateFilter !== "all") filterInfo.push(dateFilter);
        const suffix = filterInfo.length > 0 ? `_${filterInfo.join('_')}` : '';
        fileName = `warehouse_orders${suffix}_${new Date().toISOString().split('T')[0]}.csv`;
      }
      
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);

      alert(`✅ Đã xuất ${data.length} bản ghi thành công!`);
    } catch (err) {
      console.error("Error exporting Excel:", err);
      alert("Lỗi khi xuất file: " + err.message);
    }
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

      <KpiStrip kpis={kpis} operations={allOperations} loading={loading} />

      {/* Bảng dữ liệu - full width */}
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
