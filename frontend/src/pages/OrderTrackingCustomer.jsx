import { useEffect } from "react";
import feather from "feather-icons";
import OrderItem from "../components/tracking_customer/OrderItem.jsx";
import MapTracker from "../components/tracking_customer/MapTracker.jsx";
import StatusTimeline from "../components/tracking_customer/StatusTimeline.jsx";

export default function TrackingContent() {
  useEffect(() => { feather.replace({ width: 18, height: 18 }); });

  return (
    <main className="pt-[64px] lg:overflow-hidden" style={{ marginLeft: "var(--sidebar-w)" }}>
      <div className="p-4 grid grid-cols-12 gap-4">
        {/* LEFT */}
        <section className="col-span-12 lg:col-span-3">
          <div className="sticky top-[calc(var(--topbar-h,64px)-55px)]">
            <div className="nice-scroll max-h-[calc(100dvh-var(--topbar-h,64px)-2rem)] overflow-y-auto pr-1">
              <div className="bg-white border border-slate-200 rounded-2xl p-3 relative">
                <div className="sticky top-0 z-10 -m-3 p-3 bg-white/95 backdrop-blur rounded-t-2xl border-b border-slate-200">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-semibold tracking-tight">ĐƠN HÀNG CỦA BẠN</h3>
                    <span className="text-xs text-slate-500">1 đơn đang theo dõi</span>
                  </div>
                </div>

                <OrderItem
                  id="ORDERID 0112"
                  route="279 Nguyễn Tri Phương, Q10 → 777 Lê Lai, Hà Nội"
                  percent={62}
                  eta="20/10/2025 16:30"
                  statusBadge="ĐANG VẬN CHUYỂN"
                />

                <div className="mt-4 p-3 rounded-xl ring-1 ring-slate-200 bg-gradient-to-br from-sky-50 to-white">
                  <div className="text-sm font-semibold text-slate-800">Mẹo giao nhận an toàn</div>
                  <ul className="mt-1 text-[12px] text-slate-600 list-disc pl-5 space-y-1">
                    <li>Luôn xác minh mã đơn/OTP khi nhận.</li>
                    <li>Ưu tiên thanh toán không tiền mặt.</li>
                    <li>Kiểm tra niêm phong trước khi ký.</li>
                  </ul>
                </div>

              </div>
            </div>
          </div>
        </section>

        {/* CENTER */}
        <section className="col-span-12 lg:col-span-6">
          <MapTracker
            orderId="ORDERID 0112"
            kpis={[
              { icon: "check-circle", text: "Không trễ", tone: "emerald" },
              { icon: "clock", text: "ETA 3h15’", tone: "blue" },
              { icon: "navigation", text: "78 km còn lại", tone: "indigo" },
            ]}
            driver={{ name: "Quang Trè", meta: "Xe tải 6.5T • DL04MP7045", phone: "0900000000", avatar: "https://i.pravatar.cc/48?img=12" }}
            mapImg="https://s3.cloud.cmctelecom.vn/tinhte2/2020/08/5100688_ban_do_tphcm.jpg"
          />
        </section>

        {/* RIGHT */}
        <section className="col-span-12 lg:col-span-3">
          <div className="sticky top-[calc(var(--topbar-h,64px)+16px)]">
            <div className="nice-scroll max-h-[calc(100dvh-var(--topbar-h,64px)-2rem)] overflow-y-auto pr-1">
              <div className="space-y-4">
                <StatusTimeline
                  segments={4}
                  fillPct={60}
                  milestones={["TP.HCM", "Quảng Ngãi", "Thanh Hóa", "Hà Nội"]}
                  etaLabel="12 Hrs Left"
                  steps={[
                    { type: "done",    title: "Departure", time: "17/7/2024, 10:00", note: "279 Nguyễn Trị Phương, P.8, Q.10, TP.HCM" },
                    { type: "current", title: "Stop",       time: "17/7/2024, 12:00", note: "76 Nguyễn Tất Thành, Quảng Ngãi", chips: ["Đang xử lý (15’)", "ON TIME"] },
                    { type: "future",  title: "Stop",       time: "17/7/2024, 20:00", note: "36 Phạm Văn Đồng, Thanh Hóa" },
                    { type: "future",  title: "Arrival",    time: "21/7/2024, 10:00", note: "777 Lê Lợi, P.3, Q.1, TP.Hà Nội", dim: true },
                  ]}
                />

                {/* Tóm tắt đơn (nhẹ) */}
                <div className="bg-white border border-slate-200 rounded-2xl p-3">
                  <h3 className="font-semibold">Tóm tắt</h3>
                  <div className="mt-2 text-sm">
                    <div className="flex items-center justify-between py-1"><span>Kiện hàng</span><span className="font-semibold">3</span></div>
                    <div className="flex items-center justify-between py-1"><span>Khối lượng</span><span className="font-semibold">120 kg</span></div>
                    <div className="flex items-center justify-between py-1"><span>Phí vận chuyển</span><span className="font-semibold">420.000₫</span></div>
                    <div className="border-t mt-2 pt-2 flex items-center justify-between"><span className="font-semibold">Tổng thanh toán</span><span className="font-bold text-slate-900">420.000₫</span></div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </section>

      </div>
    </main>
  );
}
