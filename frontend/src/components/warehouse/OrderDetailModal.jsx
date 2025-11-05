import { useEffect } from "react";

export default function OrderDetailModal({ order, isOpen, onClose }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div 
        className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-t-2xl flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold">Chi tiết đơn hàng</h3>
            <p className="text-sm opacity-90 mt-1">Mã đơn: {order.id}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Thông tin chung */}
          <section>
            <h4 className="text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wide">Thông tin chung</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-500 mb-1">Mã đơn hàng</p>
                <p className="font-medium text-slate-900">{order.id}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Trạng thái</p>
                <p className="font-medium text-slate-900">{order.status}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Khách hàng</p>
                <p className="font-medium text-slate-900">{order.customer || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Tên hàng</p>
                <p className="font-medium text-slate-900">{order.cargo_name || '—'}</p>
              </div>
            </div>
          </section>

          {/* Thông tin hàng hóa */}
          <section>
            <h4 className="text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wide">Thông tin hàng hóa</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-500 mb-1">Loại hàng</p>
                <p className="font-medium text-slate-900">{order.cargo_type || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Khối lượng</p>
                <p className="font-medium text-slate-900">{order.weight ? `${order.weight.toLocaleString()} KG` : '—'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Số pallets</p>
                <p className="font-medium text-slate-900">{order.pallets || 0}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Thể tích</p>
                <p className="font-medium text-slate-900">{order.volume_m3 ? `${order.volume_m3} m³` : '—'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Nhiệt độ</p>
                <p className="font-medium text-slate-900">{order.temp || 'Thường'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Vị trí trong kho</p>
                <p className="font-medium text-slate-900">{order.location || 'Chưa xác định'}</p>
              </div>
            </div>
          </section>

          {/* Thông tin vận chuyển */}
          <section>
            <h4 className="text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wide">Thông tin vận chuyển</h4>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <p className="text-xs text-slate-500 mb-1">Địa chỉ giao hàng</p>
                <p className="font-medium text-slate-900">{order.to || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Địa chỉ lấy hàng</p>
                <p className="font-medium text-slate-900">{order.from || '—'}</p>
              </div>
            </div>
          </section>

          {/* Thời gian */}
          <section>
            <h4 className="text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wide">Thời gian</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-500 mb-1">Ngày tới kho</p>
                <p className="font-medium text-slate-900">{order.entered_at || order.stored_at || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Ngày xuất kho</p>
                <p className="font-medium text-slate-900">{order.shipped_at || '—'}</p>
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-slate-50 px-6 py-4 rounded-b-2xl flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 text-sm font-medium transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}

