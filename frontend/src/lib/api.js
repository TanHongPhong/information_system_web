// API Helper để gọi backend
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

export const authAPI = {
  signup: async (name, phone, email, password, role) => {
    const response = await fetch(`${API_URL}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, phone, email, password, role }),
    });
    return response.json();
  },

  login: async (email, password, role) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, role }),
    });
    return response.json();
  },
};

export const driverAPI = {
  // Lấy thông tin xe và đơn hàng của driver
  getVehicleInfo: async (email, phone) => {
    const params = new URLSearchParams();
    if (email) params.append("email", email);
    if (phone) params.append("phone", phone);
    
    const response = await fetch(`${API_URL}/driver/vehicle-info?${params.toString()}`);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || errorData.error || response.statusText;
      const error = new Error(`Failed to fetch vehicle info: ${errorMessage}`);
      error.status = response.status;
      throw error;
    }
    return response.json();
  },

  // Ghi nhận sự kiện xuất phát
  recordDeparture: async (vehicle_id, order_ids, departure_location, notes) => {
    const response = await fetch(`${API_URL}/driver/departure`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        vehicle_id,
        order_ids,
        departure_location,
        notes,
      }),
    });
    if (!response.ok) {
      throw new Error(`Failed to record departure: ${response.statusText}`);
    }
    return response.json();
  },

  // Ghi nhận sự kiện đã tới kho (chỉ ghi location, không update status đơn hàng)
  recordWarehouseArrival: async (vehicle_id, order_ids, warehouse_location, warehouse_id, notes) => {
    const response = await fetch(`${API_URL}/driver/warehouse-arrival`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        vehicle_id,
        order_ids,
        warehouse_location,
        warehouse_id,
        notes,
      }),
    });
    if (!response.ok) {
      throw new Error(`Failed to record warehouse arrival: ${response.statusText}`);
    }
    return response.json();
  },

  // Chấp nhận nhập kho cho một đơn hàng cụ thể
  acceptWarehouseEntry: async (order_id, vehicle_id, warehouse_location, warehouse_id, notes) => {
    const response = await fetch(`${API_URL}/driver/accept-warehouse-entry`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        order_id,
        vehicle_id,
        warehouse_location,
        warehouse_id,
        notes,
      }),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || errorData.error || response.statusText;
      throw new Error(`Failed to accept warehouse entry: ${errorMessage}`);
    }
    return response.json();
  },

  // Bốc hàng lên xe bằng cách scan mã đơn hàng
  loadOrder: async (vehicle_id, order_code) => {
    const response = await fetch(`${API_URL}/driver/load-order`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        vehicle_id,
        order_code,
      }),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || errorData.error || response.statusText;
      throw new Error(`Failed to load order: ${errorMessage}`);
    }
    return response.json();
  },
};

// Warehouse API
export const warehouseAPI = {
  // Lấy danh sách warehouse operations
  getOperations: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.warehouse_id) params.append("warehouse_id", filters.warehouse_id);
    if (filters.operation_type) params.append("operation_type", filters.operation_type);
    if (filters.status) params.append("status", filters.status);
    if (filters.dock) params.append("dock", filters.dock);
    if (filters.temp) params.append("temp", filters.temp);
    if (filters.limit) params.append("limit", filters.limit);
    if (filters.offset) params.append("offset", filters.offset);
    
    const response = await fetch(`${API_URL}/warehouse/operations?${params.toString()}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch warehouse operations: ${response.statusText}`);
    }
    return response.json();
  },

  // Lấy KPI thống kê
  getKPIs: async (warehouse_id) => {
    const params = new URLSearchParams();
    if (warehouse_id) params.append("warehouse_id", warehouse_id);
    
    const response = await fetch(`${API_URL}/warehouse/kpis?${params.toString()}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch warehouse KPIs: ${response.statusText}`);
    }
    return response.json();
  },

  // Scan QR code
  scanQR: async (qr_code, operation_type, warehouse_id, dock_number) => {
    const response = await fetch(`${API_URL}/warehouse/scan-qr`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        qr_code,
        operation_type,
        warehouse_id,
        dock_number,
      }),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || errorData.error || response.statusText;
      throw new Error(`Failed to scan QR: ${errorMessage}`);
    }
    return response.json();
  },

  // Cập nhật warehouse operation
  updateOperation: async (operation_id, status, dock_number, notes) => {
    const response = await fetch(`${API_URL}/warehouse/update-operation`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        operation_id,
        status,
        dock_number,
        notes,
      }),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || errorData.error || response.statusText;
      throw new Error(`Failed to update operation: ${errorMessage}`);
    }
    return response.json();
  },

  // Lấy danh sách inventory (hàng hóa trong kho)
  getInventory: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.warehouse_id) params.append("warehouse_id", filters.warehouse_id);
    if (filters.status) params.append("status", filters.status);
    if (filters.location) params.append("location", filters.location);
    if (filters.date) params.append("date", filters.date);
    if (filters.month) params.append("month", filters.month);
    if (filters.limit) params.append("limit", filters.limit);
    if (filters.offset) params.append("offset", filters.offset);
    
    const response = await fetch(`${API_URL}/warehouse/inventory?${params.toString()}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch warehouse inventory: ${response.statusText}`);
    }
    return response.json();
  },

  // Tạo inventory mới khi nhập kho
  createInventory: async (order_id, warehouse_id, location_in_warehouse, quantity_pallets, weight_kg, volume_m3, temperature_category, entered_by, notes) => {
    const response = await fetch(`${API_URL}/warehouse/inventory/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        order_id,
        warehouse_id,
        location_in_warehouse,
        quantity_pallets,
        weight_kg,
        volume_m3,
        temperature_category,
        entered_by,
        notes,
      }),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || errorData.error || response.statusText;
      throw new Error(`Failed to create inventory: ${errorMessage}`);
    }
    return response.json();
  },

  // Cập nhật trạng thái inventory
  updateInventoryStatus: async (inventory_id, order_id, status, location_in_warehouse, stored_by, shipped_by, notes) => {
    const response = await fetch(`${API_URL}/warehouse/inventory/update-status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        inventory_id,
        order_id,
        status,
        location_in_warehouse,
        stored_by,
        shipped_by,
        notes,
      }),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || errorData.error || response.statusText;
      throw new Error(`Failed to update inventory status: ${errorMessage}`);
    }
    return response.json();
  },
};

// Order Status History API
export const orderStatusHistoryAPI = {
  // Lấy lịch sử thay đổi status của một đơn hàng
  getOrderStatusHistory: async (orderId) => {
    const response = await fetch(`${API_URL}/orders/${orderId}/status-history`);
    if (!response.ok) {
      throw new Error(`Failed to fetch status history: ${response.statusText}`);
    }
    return response.json();
  },

  // Lấy lịch sử với filter
  getStatusHistory: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.order_id) params.append("order_id", filters.order_id);
    if (filters.changed_by_type) params.append("changed_by_type", filters.changed_by_type);
    if (filters.limit) params.append("limit", filters.limit);
    
    const response = await fetch(`${API_URL}/orders/status-history?${params.toString()}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch status history: ${response.statusText}`);
    }
    return response.json();
  },
};

// Payment Methods API
export const paymentMethodsAPI = {
  // Lấy danh sách phương thức thanh toán
  getPaymentMethods: async (isActive = true) => {
    const params = new URLSearchParams();
    if (isActive !== undefined) params.append("is_active", isActive);
    
    const response = await fetch(`${API_URL}/payment-methods?${params.toString()}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch payment methods: ${response.statusText}`);
    }
    return response.json();
  },

  // Lấy thông tin một phương thức thanh toán
  getPaymentMethodByCode: async (code) => {
    const response = await fetch(`${API_URL}/payment-methods/${code}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch payment method: ${response.statusText}`);
    }
    return response.json();
  },
};

// User Preferences API
export const userPreferencesAPI = {
  // Lấy cài đặt người dùng
  getPreferences: async () => {
    const token = localStorage.getItem("auth_token");
    const response = await fetch(`${API_URL}/user/preferences`, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch preferences: ${response.statusText}`);
    }
    return response.json();
  },

  // Cập nhật cài đặt người dùng
  updatePreferences: async (preferences) => {
    const token = localStorage.getItem("auth_token");
    const response = await fetch(`${API_URL}/user/preferences`, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(preferences),
    });
    if (!response.ok) {
      throw new Error(`Failed to update preferences: ${response.statusText}`);
    }
    return response.json();
  },
};

// Document Files API
export const documentFilesAPI = {
  // Lấy danh sách tài liệu
  getDocuments: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.order_id) params.append("order_id", filters.order_id);
    if (filters.transaction_id) params.append("transaction_id", filters.transaction_id);
    if (filters.document_type) params.append("document_type", filters.document_type);
    if (filters.uploaded_by) params.append("uploaded_by", filters.uploaded_by);
    if (filters.limit) params.append("limit", filters.limit);
    
    const token = localStorage.getItem("auth_token");
    const response = await fetch(`${API_URL}/documents?${params.toString()}`, {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch documents: ${response.statusText}`);
    }
    return response.json();
  },

  // Tạo tài liệu mới
  createDocument: async (documentData) => {
    const token = localStorage.getItem("auth_token");
    const response = await fetch(`${API_URL}/documents`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(documentData),
    });
    if (!response.ok) {
      throw new Error(`Failed to create document: ${response.statusText}`);
    }
    return response.json();
  },

  // Xóa tài liệu
  deleteDocument: async (documentId) => {
    const token = localStorage.getItem("auth_token");
    const response = await fetch(`${API_URL}/documents/${documentId}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error(`Failed to delete document: ${response.statusText}`);
    }
    return response.json();
  },
};

