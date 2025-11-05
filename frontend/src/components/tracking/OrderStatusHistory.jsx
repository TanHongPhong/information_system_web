import { useState, useEffect } from "react";
import { orderStatusHistoryAPI } from "../../lib/api.js";
import { IconClock, IconUser, IconAlertCircle } from "./IconsFeather";

const statusMap = {
  PENDING_PAYMENT: "Chờ thanh toán",
  PAID: "Đã thanh toán",
  ACCEPTED: "Đã tiếp nhận",
  LOADING: "Đang bốc hàng",
  IN_TRANSIT: "Đang vận chuyển",
  WAREHOUSE_RECEIVED: "Đã nhập kho",
  COMPLETED: "Hoàn thành",
};

const typeMap = {
  USER: "Khách hàng",
  DRIVER: "Tài xế",
  SYSTEM: "Hệ thống",
  ADMIN: "Quản trị viên",
  WAREHOUSE: "Kho hàng",
};

const formatDate = (dateString) => {
  if (!dateString) return "—";
  try {
    return new Date(dateString).toLocaleString("vi-VN", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  } catch {
    return dateString;
  }
};

export default function OrderStatusHistory({ orderId }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }

    const fetchHistory = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await orderStatusHistoryAPI.getOrderStatusHistory(orderId);
        setHistory(data || []);
      } catch (err) {
        console.error("Error fetching status history:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [orderId]);

  if (!orderId) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-4">
        <div className="text-center text-slate-500 text-sm">Chọn đơn hàng để xem lịch sử</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-4">
        <div className="text-center text-slate-500 text-sm">Đang tải...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-4">
        <div className="text-center text-red-500 text-sm">
          <IconAlertCircle className="w-5 h-5 mx-auto mb-2" />
          Lỗi: {error}
        </div>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-4">
        <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2 text-sm">
          <IconClock className="w-4 h-4 text-slate-600" />
          Lịch sử thay đổi trạng thái
        </h3>
        <div className="text-center text-slate-500 text-sm py-4">Chưa có lịch sử thay đổi</div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4">
      <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2 text-sm">
        <IconClock className="w-4 h-4 text-slate-600" />
        Lịch sử thay đổi trạng thái
      </h3>
      <div className="space-y-4">
        {history.map((item, index) => (
          <div key={item.history_id} className="relative pl-6">
            <div className="absolute left-0 top-1 w-3 h-3 bg-blue-500 rounded-full"></div>
            {index < history.length - 1 && (
              <div className="absolute left-[5px] top-4 w-0.5 h-full bg-slate-200"></div>
            )}
            <div className="pb-2">
              <div className="flex items-start justify-between gap-2 mb-1">
                <div className="flex-1">
                  {item.old_status ? (
                    <div className="text-sm">
                      <span className="text-slate-500">{statusMap[item.old_status] || item.old_status}</span>
                      <span className="mx-2 text-slate-400">→</span>
                      <span className="font-medium text-slate-900">{statusMap[item.new_status] || item.new_status}</span>
                    </div>
                  ) : (
                    <div className="text-sm font-medium text-slate-900">{statusMap[item.new_status] || item.new_status}</div>
                  )}
                </div>
                <div className="text-xs text-slate-500">{formatDate(item.created_at)}</div>
              </div>
              {item.changed_by_name && (
                <div className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                  <IconUser className="w-3 h-3" />
                  {typeMap[item.changed_by_type] || item.changed_by_type}: {item.changed_by_name}
                </div>
              )}
              {item.reason && (
                <div className="text-xs text-slate-600 mt-1 bg-slate-50 rounded px-2 py-1">Lý do: {item.reason}</div>
              )}
              {item.notes && <div className="text-xs text-slate-500 mt-1 italic">{item.notes}</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

