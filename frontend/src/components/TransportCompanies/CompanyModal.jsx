import React from "react";
import Stars from "./Stars";
import Icon from "./Icon";

export default function CompanyModal({ selected, closeModal, fmtVND }) {
  if (!selected) return null;

  return (
    <div className="fixed inset-0 z-[60]">
      <div className="absolute inset-0 bg-black/40" onClick={closeModal} />
      <div className="relative z-[61] w-full h-full grid place-items-center p-4">
        <div
          className="w-full max-w-[960px] lg:max-w-[1040px] bg-white rounded-2xl shadow-soft border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col animate-in"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative">
            <div className="px-5 md:px-6 mt-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <img
                  src="https://i.pravatar.cc/120?u=company-1"
                  alt="Company avatar"
                  className="w-16 h-16 rounded-2xl ring-2 ring-white object-cover shadow"
                />
                <div>
                  <h3 id="modal-title" className="text-xl md:text-2xl font-extrabold leading-none text-slate-900">
                    {selected?.name || "Chi tiết công ty"}
                  </h3>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-sm">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">
                      <i data-feather="check-circle" className="w-4 h-4" /> Đã xác minh
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 ring-1 ring-blue-200">
                      <i data-feather="truck" className="w-4 h-4" /> Cross-dock / FTL / LTL
                    </span>
                    <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 ring-1 ring-amber-200">
                      <Stars rating={selected?.rating ?? 0} />
                      <span className="text-xs font-semibold">
                        ({(selected?.reviews ?? 0).toLocaleString("vi-VN")} đánh giá)
                      </span>
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="h-9 w-9 grid place-items-center rounded-xl hover:bg-slate-50"
                  onClick={closeModal}
                  aria-label="Đóng"
                  title="Đóng"
                >
                  <i data-feather="x" className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Quick stats */}
            <div className="px-5 md:px-6 py-3">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="rounded-xl border border-slate-200 bg-white p-3">
                  <div className="text-xs text-slate-500">Đơn hoàn tất (12 tháng)</div>
                  <div className="mt-1 text-lg font-bold">
                    {(selected?.stats?.orders12m ?? "—")?.toLocaleString?.("vi-VN") ??
                      selected?.stats?.orders12m ??
                      "—"}
                  </div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-3">
                  <div className="text-xs text-slate-500">Tỉ lệ đúng hẹn</div>
                  <div className="mt-1 text-lg font-bold text-emerald-600">
                    {selected?.stats?.ontimeRate != null ? `${selected.stats.ontimeRate}%` : "—"}
                  </div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-3">
                  <div className="text-xs text-slate-500">Điểm phản hồi (CSAT)</div>
                  <div className="mt-1 text-lg font-bold">
                    {selected?.stats?.csat != null ? `${selected.stats.csat}/5` : "—"}
                  </div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-3">
                  <div className="text-xs text-slate-500">Phạm vi</div>
                  <div className="mt-1 text-lg font-bold">{selected?.area ?? "—"}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="p-5 md:p-6 overflow-auto">
            <div className="flex flex-wrap gap-2 text-sm mb-4">
              {selected?.services?.cold && (
                <span className="px-2.5 py-1 rounded-full bg-slate-50 ring-1 ring-slate-200">Xe lạnh</span>
              )}
              {selected?.services?.danger && (
                <span className="px-2.5 py-1 rounded-full bg-slate-50 ring-1 ring-slate-200">Hàng nguy hiểm</span>
              )}
              {selected?.services?.loading && (
                <span className="px-2.5 py-1 rounded-full bg-slate-50 ring-1 ring-slate-200">Bốc xếp</span>
              )}
              {selected?.services?.insurance && (
                <span className="px-2.5 py-1 rounded-full bg-slate-50 ring-1 ring-slate-200">Bảo hiểm</span>
              )}
            </div>

            <div className="grid md:grid-cols-3 gap-5 items-start">
              <div className="md:col-span-2">
                <div className="rounded-2xl border border-slate-200 p-4">
                  <h4 className="font-semibold mb-2">Giới thiệu</h4>
                  <p className="text-sm text-slate-700">
                    Đơn vị vận tải chuyên tuyến, thế mạnh cold-chain, FMCG, last-mile nội thành. Hỗ trợ API đồng bộ
                    đơn, tracking thời gian thực.
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 p-4 mt-4">
                  <h4 className="font-semibold mb-2">Năng lực</h4>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li>Phủ tuyến: {selected?.area}</li>
                    <li>Loại xe: {selected?.sizes?.join(", ")}</li>
                    <li>Giá tham chiếu: {fmtVND(selected?.cost ?? 0)}/KM</li>
                    <li>Đánh giá: {selected ? selected.rating.toFixed(1) : "—"}/5</li>
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
                  <ul className="space-y-3">
                    <li className="text-sm">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Coopmart DC</span>
                        <Stars rating={Math.min(5, selected?.rating ?? 0)} />
                      </div>
                      <p className="text-slate-600">Đúng giờ, chứng từ đầy đủ, xử lý khiếu nại nhanh.</p>
                    </li>
                    <li className="text-sm">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Big C Miền Đông</span>
                        <Stars rating={Math.min(5, (selected?.rating ?? 0) + 0.1)} />
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
                      <Icon name="map-pin" />
                      <span>{selected?.address ?? "Đang cập nhật"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Icon name="phone" />
                      {selected?.phone ? (
                        <a href={`tel:${selected.phone.replace(/\s/g, "")}`} className="underline decoration-dotted">
                          {selected.phone}
                        </a>
                      ) : (
                        <span>—</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Icon name="mail" />
                      <a href="mailto:sales@company.vn" className="underline decoration-dotted">
                        sales@company.vn
                      </a>
                    </div>
                    <div className="flex items-center gap-2">
                      <Icon name="globe" />
                      <a href="#" className="underline decoration-dotted">
                        company.vn
                      </a>
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-xl bg-white border border-slate-200 p-2">
                      <div className="text-[11px] text-slate-500">SLA</div>
                      <div className="font-semibold">24h</div>
                    </div>
                    <div className="rounded-xl bg-white border border-slate-200 p-2">
                      <div className="text-[11px] text-slate-500">Tối đa tải</div>
                      <div className="font-semibold">15T</div>
                    </div>
                    <div className="rounded-xl bg-white border border-slate-200 p-2">
                      <div className="text-[11px] text-slate-500">Bảo hiểm</div>
                      <div className="font-semibold">{selected?.services?.insurance ? "Có" : "—"}</div>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button className="flex-1 h-9 rounded-xl border border-slate-300 bg-white hover:bg-slate-50">
                      Báo giá nhanh
                    </button>
                    <button className="flex-1 h-9 rounded-xl bg-blue-600 text-white hover:bg-blue-700">Nhắn Zalo</button>
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

                <div className="p-4 rounded-2xl border border-slate-200">
                  <h4 className="font-semibold mb-2">Tài liệu</h4>
                  <div className="flex flex-col gap-2">
                    <button className="h-9 rounded-xl border border-slate-300 hover:bg-slate-50 flex items-center justify-center gap-2">
                      <i data-feather="file-text" className="w-4 h-4" /> Hồ sơ năng lực.pdf
                    </button>
                    <button className="h-9 rounded-xl border border-slate-300 hover:bg-slate-50 flex items-center justify-center gap-2">
                      <i data-feather="shield" className="w-4 h-4" /> Bảo hiểm hàng hóa.pdf
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-200 flex items-center justify-between gap-2">
            <div className="text-xs text-slate-500">* Giá, điều khoản có thể thay đổi theo mùa vụ và tải trọng.</div>
            <div className="flex items-center gap-2">
              <button className="h-10 px-4 rounded-xl border border-slate-200" onClick={closeModal}>
                Đóng
              </button>
              <button className="h-10 px-4 rounded-xl bg-blue-600 text-white hover:bg-blue-700">Tiếp tục đặt</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
