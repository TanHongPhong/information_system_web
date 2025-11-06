import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { X, CheckCircle, Truck, MapPin, Phone, Mail, Globe } from "lucide-react";
import Stars from "./Stars";
import api from "../../lib/axios";

export default function CompanyModal({ company, onClose }) {
  const [detail, setDetail] = useState(null);
  const navigate = useNavigate();

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

  // Fetch extra details by id (email, description, services, full areas/rates) when opening
  useEffect(() => {
    let aborted = false;
    async function loadDetail() {
      try {
        if (!company || !company.id) {
          setDetail(null);
          return;
        }
        const res = await api.get(`/transport-companies/${company.id}`);
        const data = res.data || {};

        const transformed = {
          ...company,
          name: data.name ?? company.name,
          address: data.address ?? company.address,
          phone: data.phone ?? company.phone,
          email: data.email ?? company.email,
          description: data.description ?? company.description,
          status: data.status ?? company.status,
          area: Array.isArray(data.areas) ? data.areas.join(", ") : company.area,
          sizes: Array.isArray(data.rates) ? data.rates.map((r) => r.vehicle_type) : company.sizes,
          cost: Array.isArray(data.rates) && data.rates[0]?.cost_per_km != null ? data.rates[0].cost_per_km : company.cost,
          services: {
            cold: (data.has_cold ?? company.services?.cold) || false,
            danger: (data.has_dangerous_goods ?? company.services?.danger) || false,
            loading: (data.has_loading_dock ?? company.services?.loading) || false,
            insurance: (data.has_insurance ?? company.services?.insurance) || false,
          },
        };
        if (!aborted) setDetail(transformed);
      } catch {
        if (!aborted) setDetail(company);
      }
    }
    loadDetail();
    return () => {
      aborted = true;
    };
  }, [company]);

  if (!company) return null;

  const c = detail || company;

  const badges = [
    c.services?.cold && "Xe lạnh",
    c.services?.danger && "Hàng nguy hiểm",
    c.services?.loading && "Bốc xếp",
    c.services?.insurance && "Bảo hiểm",
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
                  src={`https://i.pravatar.cc/120?u=${encodeURIComponent(c.name)}`}
                  alt="Company avatar"
                  className="w-16 h-16 rounded-2xl ring-2 ring-white object-cover shadow"
                />
                <div>
                  <h3 id="modal-title" className="text-xl md:text-2xl font-extrabold leading-none text-slate-900">
                    {c.name}
                  </h3>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-sm">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">
                      <CheckCircle className="w-4 h-4" /> Đã xác minh
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 ring-1 ring-blue-200">
                      <Truck className="w-4 h-4" /> Cross-dock / FTL / LTL
                    </span>
                    <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 ring-1 ring-amber-200">
                      <Stars rating={c.rating} />{" "}
                      <span className="text-xs font-semibold">
                        ({(c.reviews ?? 0).toLocaleString("vi-VN")} đánh giá)
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
                <StatBox label="Đơn hoàn tất (12 tháng)" value={c.stats?.orders12m?.toLocaleString("vi-VN") ?? "—"} />
                <StatBox label="Tỉ lệ đúng hẹn" value={c.stats?.ontimeRate != null ? `${c.stats.ontimeRate}%` : "—"} accent />
                <StatBox label="Điểm phản hồi (CSAT)" value={c.stats?.csat != null ? `${c.stats.csat}/5` : "—"} />
                <StatBox label="Phạm vi" value={c.area ?? "—"} />
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
                    {c.description || "Đơn vị vận tải chuyên tuyến, thế mạnh cold-chain, FMCG, last-mile nội thành. Hỗ trợ API đồng bộ đơn, tracking thời gian thực."}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 p-4 mt-4">
                  <h4 className="font-semibold mb-2">Năng lực</h4>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li>Phủ tuyến: {c.area}</li>
                    <li>Loại xe: {c.sizes?.join(", ")}</li>
                    <li>Giá tham chiếu: {fmtVND(c.cost)}/KM</li>
                    <li>Đánh giá: {c.rating.toFixed(1)}/5</li>
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
                        <Stars rating={Math.min(5, c.rating)} />
                      </div>
                      <p className="text-slate-600">Đúng giờ, chứng từ đầy đủ, xử lý khiếu nại nhanh.</p>
                    </li>
                    <li>
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Big C Miền Đông</span>
                        <Stars rating={Math.min(5, c.rating + 0.1)} />
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
                      <span>{c.address || "Đang cập nhật"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      {c.phone ? (
                        <a className="underline decoration-dotted" href={`tel:${c.phone.replace(/\s/g, "")}`}>
                          {c.phone}
                        </a>
                      ) : (
                        <span>—</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      {c.email ? (
                        <a className="underline decoration-dotted" href={`mailto:${c.email}`}>
                          {c.email}
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
              <button 
                className="h-10 px-4 rounded-xl bg-blue-600 text-white hover:bg-blue-700"
                onClick={() => {
                  if (c?.id) {
                    // Lấy origin và destination từ URL, localStorage, hoặc state
                    // QUAN TRỌNG: origin_region = điểm đi (nơi xe phải ở)
                    //           destination_region = điểm đến (nơi xe sẽ đến)
                    const urlParams = new URLSearchParams(window.location.search);
                    let origin = urlParams.get('origin_region') || '';
                    let destination = urlParams.get('destination_region') || '';
                    
                    // Nếu không có trong URL, lấy từ localStorage
                    if (!origin || !destination) {
                      try {
                        const savedRoute = localStorage.getItem('selected_route');
                        if (savedRoute) {
                          const route = JSON.parse(savedRoute);
                          origin = origin || route.origin_region || '';
                          destination = destination || route.destination_region || '';
                        }
                      } catch (e) {
                        console.error("Error reading route from localStorage:", e);
                      }
                    }
                    
                    console.log("🚀 CompanyModal: Navigating to vehicle-list", {
                      companyId: c.id,
                      origin_region: origin,      // Điểm đi = nơi xe phải ở
                      destination_region: destination  // Điểm đến = nơi xe sẽ đến
                    });
                    
                    const params = new URLSearchParams({ companyId: c.id });
                    if (origin) params.append('origin_region', origin);      // Điểm đi
                    if (destination) params.append('destination_region', destination);  // Điểm đến
                    
                    console.log("🚀 CompanyModal: Final URL params", params.toString());
                    navigate(`/vehicle-list?${params.toString()}`);
                    onClose();
                  }
                }}
              >
                Tiếp tục đặt
              </button>
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
