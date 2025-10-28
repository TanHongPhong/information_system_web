import React, { useEffect } from "react";
import { X, CheckCircle, Truck, MapPin, Phone, Mail, Globe } from "lucide-react";
import Stars from "./Stars";

export default function CompanyModal({ company, onClose }) {
  useEffect(() => {
    if (!company) return;
    const onEsc = (e) => e.key === "Escape" && onClose();
    document.documentElement.classList.add("overflow-hidden");
    window.addEventListener("keydown", onEsc);
    return () => {
      document.documentElement.classList.remove("overflow-hidden");
      window.removeEventListener("keydown", onEsc);
    };
  }, [company, onClose]);

  if (!company) return null;

  const badges = [
    company.services?.cold && "Xe lạnh",
    company.services?.danger && "Hàng nguy hiểm",
    company.services?.loading && "Bốc xếp",
    company.services?.insurance && "Bảo hiểm",
  ].filter(Boolean);

  return (
    <div className="fixed inset-0 z-[60]">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-[61] w-full h-full grid place-items-center p-4">
        <div className="w-full max-w-[960px] lg:max-w-[1040px] bg-white rounded-2xl shadow-[0_8px_30px_rgba(15,23,42,.08)] border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col animate-[in_.25s_ease-out_both]">
          {/* Header */}
          <div className="relative">
            <div className="px-5 md:px-6 mt-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <img
                  src={`https://i.pravatar.cc/120?u=${encodeURIComponent(company.name)}`}
                  alt="Company avatar"
                  className="w-16 h-16 rounded-2xl ring-2 ring-white object-cover shadow"
                />
                <div>
                  <h3 id="modal-title" className="text-xl md:text-2xl font-extrabold leading-none text-slate-900">
                    {company.name}
                  </h3>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-sm">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">
                      <CheckCircle className="w-4 h-4" /> Đã xác minh
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 ring-1 ring-blue-200">
                      <Truck className="w-4 h-4" /> Cross-dock / FTL / LTL
                    </span>
                    <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 ring-1 ring-amber-200">
                      <Stars rating={company.rating} />{" "}
                      <span className="text-xs font-semibold">
                        ({company.reviews.toLocaleString("vi-VN")} đánh giá)
                      </span>
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="h-9 w-9 grid place-items-center rounded-xl hover:bg-slate-50"
                  onClick={onClose}
                  aria-label="Đóng"
                  title="Đóng"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Quick stats */}
            <div className="px-5 md:px-6 py-3">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <StatBox label="Đơn hoàn tất (12 tháng)" value={company.stats?.orders12m?.toLocaleString("vi-VN") ?? "—"} />
                <StatBox label="Tỉ lệ đúng hẹn" value={company.stats?.ontimeRate != null ? `${company.stats.ontimeRate}%` : "—"} accent />
                <StatBox label="Điểm phản hồi (CSAT)" value={company.stats?.csat != null ? `${company.stats.csat}/5` : "—"} />
                <StatBox label="Phạm vi" value={company.area ?? "—"} />
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="p-5 md:p-6 overflow-auto">
            <div className="flex flex-wrap gap-2 text-sm mb-4">
              {badges.map((b) => (
                <span key={b} className="px-2.5 py-1 rounded-full bg-slate-50 ring-1 ring-slate-200">
                  {b}
                </span>
              ))}
            </div>

            <div className="grid md:grid-cols-3 gap-5 items-start">
              <div className="md:col-span-2">
                <div className="rounded-2xl border border-slate-200 p-4">
                  <h4 className="font-semibold mb-2">Giới thiệu</h4>
                  <p className="text-sm text-slate-700">
                    {company.description || "Đơn vị vận tải chuyên tuyến, thế mạnh cold-chain, FMCG, last-mile nội thành. Hỗ trợ API đồng bộ đơn, tracking thời gian thực."}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 p-4 mt-4">
                  <h4 className="font-semibold mb-2">Năng lực</h4>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li>Phủ tuyến: {company.area}</li>
                    <li>Loại xe: {company.sizes?.join(", ")}</li>
                    <li>Giá tham chiếu: {fmtVND(company.cost)}/KM</li>
                    <li>Đánh giá: {company.rating.toFixed(1)}/5</li>
                  </ul>
                </div>

                <div className="rounded-2xl border border-slate-200 p-4 mt-4">
                  <h4 className="font-semibold mb-2">Điều khoản</h4>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li>Hủy miễn phí trong 30 phút</li>
                    <li>Phạt trễ theo SLA</li>
                    <li>Hỗ trợ 24/7</li>
                  </ul>
                </div>

                <div className="rounded-2xl border border-slate-200 p-4 mt-4">
                  <h4 className="font-semibold mb-2">Đánh giá gần đây</h4>
                  <ul className="space-y-3 text-sm">
                    <li>
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Coopmart DC</span>
                        <Stars rating={Math.min(5, company.rating)} />
                      </div>
                      <p className="text-slate-600">Đúng giờ, chứng từ đầy đủ, xử lý khiếu nại nhanh.</p>
                    </li>
                    <li>
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Big C Miền Đông</span>
                        <Stars rating={Math.min(5, company.rating + 0.1)} />
                      </div>
                      <p className="text-slate-600">Cold-chain ổn định, tài xế chuyên nghiệp.</p>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50">
                  <h4 className="font-semibold mb-2">Liên hệ</h4>
                  <div className="space-y-2 text-[13px]">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>{company.address || "Đang cập nhật"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      {company.phone ? (
                        <a className="underline decoration-dotted" href={`tel:${company.phone.replace(/\s/g, "")}`}>
                          {company.phone}
                        </a>
                      ) : (
                        <span>—</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      {company.email ? (
                        <a className="underline decoration-dotted" href={`mailto:${company.email}`}>
                          {company.email}
                        </a>
                      ) : (
                        <span>—</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      <a className="underline decoration-dotted" href="#" onClick={(e) => e.preventDefault()}>
                        company.vn
                      </a>
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                    <MiniStat label="SLA" value="24h" />
                    <MiniStat label="Tối đa tải" value="15T" />
                    <MiniStat label="Bảo hiểm" value="Có" />
                  </div>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200">
                  <h4 className="font-semibold mb-2">Giờ làm việc</h4>
                  <ul className="text-[13px] text-slate-700 space-y-1">
                    <li>Thứ 2–6: 08:00–18:00</li>
                    <li>Thứ 7: 08:00–12:00</li>
                    <li>CN: Hỗ trợ trực hotline</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-200 flex items-center justify-between gap-2">
            <div className="text-xs text-slate-500">* Giá, điều khoản có thể thay đổi theo mùa vụ và tải trọng.</div>
            <div className="flex items-center gap-2">
              <button className="h-10 px-4 rounded-xl border border-slate-200" onClick={onClose}>Đóng</button>
              <button className="h-10 px-4 rounded-xl bg-blue-600 text-white hover:bg-blue-700">Tiếp tục đặt</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatBox({ label, value, accent }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3">
      <div className="text-xs text-slate-500">{label}</div>
      <div className={`mt-1 text-lg font-bold ${accent ? "text-emerald-600" : ""}`}>{value}</div>
    </div>
  );
}

function MiniStat({ label, value }) {
  return (
    <div className="rounded-xl bg-white border border-slate-200 p-2">
      <div className="text-[11px] text-slate-500">{label}</div>
      <div className="font-semibold">{value}</div>
    </div>
  );
}

function fmtVND(n) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(n);
}
