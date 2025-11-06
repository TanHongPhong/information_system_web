import React, { useState } from "react";
import { driverAPI } from "../../lib/api";

export default function LoadOrderInput({ vehicleId, onOrderLoaded }) {
  const [orderCode, setOrderCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleLoadOrder = async (e) => {
    e.preventDefault();
    
    if (!orderCode.trim()) {
      setError("Vui lòng nhập mã đơn hàng");
      return;
    }

    if (!vehicleId) {
      setError("Không tìm thấy thông tin xe");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await driverAPI.loadOrder(vehicleId, orderCode.trim().toUpperCase());
      
      setSuccess(result.message || `Đã bốc hàng ${orderCode} thành công!`);
      setOrderCode("");
      
      // Callback để refresh orders
      if (onOrderLoaded) {
        onOrderLoaded(result.order);
      }
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message || "Không thể bốc hàng. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-[1rem] shadow-[0_12px_40px_rgba(2,6,23,.08)] p-4">
      <h3 className="text-sm font-semibold text-slate-800 mb-3">
        Bốc hàng lên xe
      </h3>
      
      <form onSubmit={handleLoadOrder} className="space-y-3">
        <div>
          <label className="block text-xs text-slate-600 mb-1.5">
            Nhập mã đơn hàng
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={orderCode}
              onChange={(e) => {
                setOrderCode(e.target.value.toUpperCase());
                setError(null);
                setSuccess(null);
              }}
              placeholder="VD: ORD-0001"
              className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
              autoFocus
            />
            <button
              type="submit"
              disabled={loading || !orderCode.trim()}
              className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 active:scale-[.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <circle cx="12" cy="12" r="10" opacity="0.25"/>
                  <path d="M12 2 A10 10 0 0 1 22 12" strokeDasharray="8" strokeDashoffset="8"/>
                </svg>
              ) : (
                "Bốc hàng"
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="p-2 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="p-2 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg">
            {success}
          </div>
        )}
      </form>
    </div>
  );
}

