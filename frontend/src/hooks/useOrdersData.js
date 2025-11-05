// Custom hook để quản lý và cache orders data, giảm duplicate API calls
import { useState, useEffect, useRef, useCallback } from "react";
import api from "../lib/axios";

// Cache orders data trong memory (chia sẻ giữa các components)
let ordersCache = null;
let cacheTimestamp = null;
let cacheListeners = new Set();
const CACHE_DURATION = 10000; // 10 giây cache

// Hàm notify tất cả listeners khi cache thay đổi
const notifyCacheUpdate = (data) => {
  cacheListeners.forEach((listener) => listener(data));
};

// Hàm fetch orders từ API
const fetchOrdersFromAPI = async (companyId = null, customerId = null, statusFilter = null, vehicleId = null) => {
  try {
    let url = `/cargo-orders?`;
    const params = [];
    
    if (companyId) {
      params.push(`company_id=${companyId}`);
    }
    if (customerId) {
      // Đảm bảo customerId là string (UUID có thể là string hoặc object)
      const customerIdStr = typeof customerId === 'string' ? customerId : String(customerId);
      params.push(`customer_id=${encodeURIComponent(customerIdStr)}`);
    }
    if (statusFilter) {
      params.push(`status=${statusFilter}`);
    }
    if (vehicleId) {
      params.push(`vehicle_id=${vehicleId}`);
    }
    
    url += params.join('&');
    const response = await api.get(url);
    return response.data || [];
  } catch (error) {
    console.error("Error fetching orders:", error);
    throw error;
  }
};

/**
 * Hook để quản lý orders data với caching và sharing giữa components
 * @param {Object} options
 * @param {string|null} options.statusFilter - Filter theo status (null = tất cả)
 * @param {number|null} options.vehicleId - Filter theo vehicle_id (null = tất cả)
 * @param {string|null} options.customerId - Filter theo customer_id (null = tất cả, dùng cho customer pages)
 * @param {boolean} options.autoRefresh - Tự động refresh (default: true)
 * @param {number} options.refreshInterval - Interval refresh (ms, default: 30000)
 * @param {boolean} options.silentRefresh - Refresh ngầm không hiển thị loading (default: true)
 */
export function useOrdersData({
  statusFilter = null,
  vehicleId = null,
  customerId, // Không set default = null, để có thể phân biệt undefined vs null
  autoRefresh = true,
  refreshInterval = 30000,
  silentRefresh = true,
} = {}) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const isFirstLoadRef = useRef(true);
  const listenerIdRef = useRef(Symbol());

  // Lấy company_id từ localStorage
  const getCompanyId = useCallback(() => {
    try {
      const userData = localStorage.getItem("gd_user");
      if (userData) {
        const user = JSON.parse(userData);
        if (user.company_id) return user.company_id;
      }
    } catch (error) {
      console.error("Error getting company_id:", error);
    }
    return null;
  }, []);

  // Lấy customer_id từ localStorage (nếu không được truyền vào)
  const getCustomerId = useCallback(() => {
    // Nếu customerId được truyền vào rõ ràng (không phải undefined), dùng giá trị đó
    // undefined = tự động lấy từ localStorage
    // null = không filter theo customer_id
    if (customerId !== null && customerId !== undefined) {
      return customerId;
    }
    // Nếu customerId là undefined, tự động lấy từ localStorage
    if (customerId === undefined) {
      try {
        const userData = localStorage.getItem("gd_user");
        const role = localStorage.getItem("role");
        
        if (userData) {
          const user = JSON.parse(userData);
          
          // Lấy customer_id từ user.id nếu role là user
          if (role === "user" && user.id) {
            return user.id;
          }
        }
      } catch (error) {
        console.error("Error getting customer_id:", error);
      }
    }
    // Nếu customerId là null hoặc không tìm thấy, return null
    return null;
  }, [customerId]);

  // Fetch orders với caching
  const fetchOrders = useCallback(
    async (silent = false) => {
      try {
        const companyId = getCompanyId();
        const finalCustomerId = getCustomerId();
        
        // Cần ít nhất company_id hoặc customer_id
        if (!companyId && !finalCustomerId) {
          setOrders([]);
          if (isFirstLoadRef.current) setLoading(false);
          return;
        }

        // Kiểm tra cache (chỉ dùng cache nếu không có filter đặc biệt)
        const now = Date.now();
        const useCache =
          ordersCache &&
          cacheTimestamp &&
          now - cacheTimestamp < CACHE_DURATION &&
          !statusFilter &&
          !vehicleId &&
          !finalCustomerId; // Không cache nếu có customerId filter

        if (useCache) {
          // Sử dụng cache
          let filteredData = [...ordersCache];

          // Filter theo vehicle_id nếu có
          if (vehicleId) {
            filteredData = filteredData.filter(
              (order) => order.vehicle_id === vehicleId
            );
          }

          setOrders(filteredData);
          if (isFirstLoadRef.current && !silent) {
            setLoading(false);
          }
          isFirstLoadRef.current = false;
          return;
        }

        // Không có cache hoặc cache expired, fetch từ API
        if (isFirstLoadRef.current && !silent) {
          setLoading(true);
        }

        const data = await fetchOrdersFromAPI(companyId, finalCustomerId, statusFilter, vehicleId);

        // Update cache nếu không có filter đặc biệt (chỉ cache khi dùng company_id)
        if (!statusFilter && !vehicleId && !finalCustomerId && companyId) {
          ordersCache = data;
          cacheTimestamp = now;
          notifyCacheUpdate(data);
        }

        // Filter theo vehicle_id nếu có (backup filter)
        let filteredData = data;
        if (vehicleId) {
          filteredData = data.filter((order) => order.vehicle_id === vehicleId);
        }

        setOrders(filteredData);
      } catch (error) {
        console.error("Error fetching orders:", error);
        setOrders([]);
      } finally {
        if (isFirstLoadRef.current && !silent) {
          setLoading(false);
        }
        isFirstLoadRef.current = false;
      }
    },
    [getCompanyId, getCustomerId, statusFilter, vehicleId]
  );

  // Listen to cache updates từ các components khác
  useEffect(() => {
    const finalCustomerId = getCustomerId();
    const listener = (cachedData) => {
      // Chỉ update nếu không có statusFilter và không có customerId (vì cache chứa orders của company)
      if (!statusFilter && !finalCustomerId && cachedData) {
        let filteredData = cachedData;
        // Filter theo vehicle_id nếu có
        if (vehicleId) {
          filteredData = cachedData.filter(
            (order) => order.vehicle_id === vehicleId
          );
        }
        setOrders(filteredData);
      }
    };

    cacheListeners.add(listener);
    listenerIdRef.current = listener;

    return () => {
      cacheListeners.delete(listener);
    };
  }, [statusFilter, vehicleId, getCustomerId]);

  // Initial fetch và auto refresh
  useEffect(() => {
    // Force fetch ngay lập tức - luôn gọi để đảm bảo data được fetch
    // Kiểm tra nếu orders đã có thì không cần fetch lại
    if (orders.length === 0 || isFirstLoadRef.current) {
      fetchOrders(false);
    }

    if (autoRefresh) {
      const interval = setInterval(
        () => fetchOrders(silentRefresh),
        refreshInterval
      );
      return () => clearInterval(interval);
    }
  }, [fetchOrders, autoRefresh, refreshInterval, silentRefresh, orders.length]);

  // Manual refresh function
  const refresh = useCallback(
    (silent = true) => {
      // Invalidate cache để force refresh
      ordersCache = null;
      cacheTimestamp = null;
      fetchOrders(silent);
    },
    [fetchOrders]
  );

  return { orders, loading, refresh, fetchOrders };
}

// Helper function để invalidate cache (dùng khi có thay đổi order)
export function invalidateOrdersCache() {
  ordersCache = null;
  cacheTimestamp = null;
  notifyCacheUpdate(null);
}

