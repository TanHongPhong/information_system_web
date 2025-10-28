import React, { useEffect } from "react";
import feather from "feather-icons";

export default function OrderDetailPanel({ order, onClose }) {
  useEffect(() => {
    if (order) {
      feather.replace();
    }
  }, [order]);

  if (!order) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 transition-opacity"
        onClick={onClose}
      ></div>

      {/* Slide Panel */}
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-2xl bg-white shadow-2xl z-50 overflow-hidden flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-blue-50 to-white">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Chi tiết đơn hàng</h2>
            <p className="text-sm text-slate-500 mt-0.5">{order.id}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
            title="Đóng"
          >
            <i data-feather="x" className="w-5 h-5 text-slate-600"></i>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Trạng thái đơn hàng */}
          <section className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                <i data-feather="info" className="w-5 h-5 text-blue-600"></i>
                Trạng thái
              </h3>
              {order.highlight && (
                <span className="px-3 py-1 text-xs font-bold text-amber-800 bg-amber-300 rounded-full">
                  MỚI
                </span>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-slate-700">Đang chờ xác nhận</span>
              </div>
              <div className="text-xs text-slate-500 ml-6">
                Thời gian đặt: {order.time}
              </div>
            </div>
          </section>

          {/* Thông tin khách hàng */}
          <section className="bg-white rounded-xl p-5 border border-slate-200">
            <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <i data-feather="user" className="w-5 h-5 text-slate-600"></i>
              Thông tin khách hàng
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full ${order.avatarBg} ${order.avatarText} flex items-center justify-center font-bold text-lg`}>
                  {order.init}
                </div>
                <div>
                  <div className="font-medium text-slate-900">{order.name}</div>
                  <div className="text-sm text-slate-500">Khách hàng</div>
                </div>
              </div>
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <i data-feather="phone" className="w-4 h-4 text-slate-400"></i>
                  <span className="text-slate-600">0912 345 678</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <i data-feather="mail" className="w-4 h-4 text-slate-400"></i>
                  <span className="text-slate-600">{order.name.toLowerCase().replace(' ', '.')}@email.com</span>
                </div>
              </div>
            </div>
          </section>

          {/* Địa chỉ giao nhận */}
          <section className="bg-white rounded-xl p-5 border border-slate-200">
            <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <i data-feather="map-pin" className="w-5 h-5 text-slate-600"></i>
              Địa chỉ giao nhận
            </h3>
            <div className="space-y-4">
              {/* Điểm đi */}
              <div className="relative pl-6">
                <div className="absolute left-0 top-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-1">Điểm lấy hàng</div>
                  <div className="font-medium text-slate-900 leading-relaxed">{order.from}</div>
                </div>
              </div>

              {/* Line */}
              <div className="pl-[7px] h-8 border-l-2 border-dashed border-slate-300"></div>

              {/* Điểm đến */}
              <div className="relative pl-6">
                <div className="absolute left-0 top-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-1">Điểm giao hàng</div>
                  <div className="font-medium text-slate-900 leading-relaxed">{order.to}</div>
                </div>
              </div>
            </div>
          </section>

          {/* Thông tin hàng hóa */}
          <section className="bg-white rounded-xl p-5 border border-slate-200">
            <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <i data-feather="package" className="w-5 h-5 text-slate-600"></i>
              Thông tin hàng hóa
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Loại hàng</span>
                <span className="text-sm font-medium text-slate-900">Hàng thông thường</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Khối lượng</span>
                <span className="text-sm font-medium text-slate-900">~500 kg</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Kích thước</span>
                <span className="text-sm font-medium text-slate-900">2m × 1.5m × 1m</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Giá trị hàng</span>
                <span className="text-sm font-medium text-slate-900">~50.000.000 VNĐ</span>
              </div>
            </div>
          </section>

          {/* Phí vận chuyển */}
          <section className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border border-green-100">
            <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <i data-feather="dollar-sign" className="w-5 h-5 text-green-600"></i>
              Chi phí dự kiến
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Phí vận chuyển</span>
                <span className="font-medium text-slate-900">2.500.000 VNĐ</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Phí bốc xếp</span>
                <span className="font-medium text-slate-900">300.000 VNĐ</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Phí bảo hiểm</span>
                <span className="font-medium text-slate-900">200.000 VNĐ</span>
              </div>
              <div className="pt-3 border-t-2 border-green-200 flex justify-between">
                <span className="font-semibold text-slate-900">Tổng cộng</span>
                <span className="font-bold text-lg text-green-700">3.000.000 VNĐ</span>
              </div>
            </div>
          </section>

          {/* Ghi chú */}
          <section className="bg-white rounded-xl p-5 border border-slate-200">
            <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
              <i data-feather="message-circle" className="w-5 h-5 text-slate-600"></i>
              Ghi chú từ khách hàng
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Vui lòng giao hàng trong giờ hành chính. Liên hệ trước 30 phút khi đến nơi. Hàng dễ vỡ, cần xử lý cẩn thận.
            </p>
          </section>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-100 transition-colors"
          >
            <span className="flex items-center gap-2">
              <i data-feather="x" className="w-4 h-4"></i>
              Đóng
            </span>
          </button>
          
          <div className="flex items-center gap-3">
            <button className="px-5 py-2.5 rounded-lg border border-red-300 bg-red-50 text-red-700 font-medium hover:bg-red-100 transition-colors">
              <span className="flex items-center gap-2">
                <i data-feather="x-circle" className="w-4 h-4"></i>
                Từ chối
              </span>
            </button>
            
            <button className="px-5 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30">
              <span className="flex items-center gap-2">
                <i data-feather="check-circle" className="w-4 h-4"></i>
                Chấp nhận đơn
              </span>
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
      `}</style>
    </>
  );
}


