// Save as Supplier.jsx.new
import React, { useEffect, useMemo, useState, useRef, useCallback } from "react";
import feather from "feather-icons";

// OrderCard component
function OrderCard({ req, onDetail }) {
  const mapRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current) return;
    // Map initialization code
  }, []);

  return (
    <article
      className={`rounded-xl p-4 ${
        req.isNew
          ? "border-2 border-amber-300 bg-amber-50/70 relative overflow-hidden"
          : "border border-slate-200 bg-white hover:border-blue-300"
      }`}
    >
      {req.isNew && (
        <div className="absolute top-0 right-0 text-xs font-bold text-amber-800 bg-amber-300 px-2 py-0.9 rounded-bl-lg">
          NEW
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-slate-500">
        <div className="font-semibold text-slate-700">{req.orderCode}</div>
        <div>{req.time}</div>
      </div>

      <div className="mt-2 grid grid-cols-12 gap-3">
        <div className="col-span-8 space-y-2 text-sm">
          <div>
            <div className="text-xs text-slate-500">Từ</div>
            <div className="font-medium text-slate-700">{req.from}</div>
          </div>
          <div>
            <div className="text-xs text-slate-500">Đến</div>
            <div className="font-medium text-slate-700">{req.to}</div>
          </div>
        </div>
        <div className="col-span-4">
          <div
            ref={mapRef}
            className="mini-map w-full h-full rounded-lg border border-slate-200"
          />
        </div>
      </div>

      <div className={`mt-3 pt-3 ${req.isNew ? "border-t border-amber-200" : "border-t border-slate-100"} flex items-center justify-between`}>
        <div className="flex items-center gap-2">
          <div className={`w-7 h-7 rounded-full grid place-items-center font-semibold text-xs ${AVATAR_TONES[req.avatarTone]}`}>
            {req.initials}
          </div>
          <div className="font-medium text-sm">{req.name}</div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onDetail?.({
              orderId: req.orderCode,
              customer: req.name,
              goods: "—",
              route: `${req.from} → ${req.to}`,
              weight: "—",
              size: "—",
              vehicle: "—",
              desc: "",
              phone: "",
            })}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700"
          >
            Xem chi tiết
          </button>
        </div>
      </div>
    </article>
  );
}

const AVATAR_TONES = {
  amber: "bg-amber-100 text-amber-700",
  sky: "bg-sky-100 text-sky-700",
  emerald: "bg-emerald-100 text-emerald-700",
  rose: "bg-rose-100 text-rose-700"
};

const norm = (s) => (s || "").toString().toLowerCase().replace(/\s+/g, "").trim();

// OrderRequests component
function OrderRequests({ list = [], onDetail }) {
  const [q, setQ] = useState("");
  
  const filtered = useMemo(() => {
    const nq = norm(q);
    if (!nq) return list;
    return list.filter(it => norm(it.orderCode).includes(nq));
  }, [list, q]);

  return (
    <section className="card h-222 flex flex-col min-h-0">
      <div className="p-4 md:p-5 flex items-center justify-between gap-3 border-b border-slate-100">
        <h3 className="font-semibold text-lg">Order Requests</h3>
        <div className="relative flex-1 max-w-xs">
          <i data-feather="search" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-100"
            placeholder="Tìm theo ID (ví dụ: ORDERID 0112)"
            aria-label="Tìm kiếm đơn hàng theo ID"
          />
        </div>
      </div>

      <div className="px-4 md:px-5 pt-3 text-sm text-slate-600 font-medium">
        Yêu cầu đặt hàng gần đây
      </div>

      <div className="p-4 md:p-5 pt-2 flex-1 min-h-0 overflow-y-auto nice-scroll space-y-4">
        {filtered.length === 0 ? (
          <div className="text-sm text-slate-500">
            Không tìm thấy đơn hàng phù hợp.
          </div>
        ) : (
          filtered.map(req => <OrderCard key={req.orderCode} req={req} onDetail={onDetail} />)
        )}
      </div>

      <div className="px-4 md:px-5 py-3 border-t border-slate-100 flex items-center justify-between">
        <div className="text-[11px] text-slate-400">
          Map tiles ©{" "}
          <a
            className="underline"
            href="https://www.openstreetmap.org/copyright"
            target="_blank"
            rel="noreferrer"
          >
            OpenStreetMap
          </a>{" "}
          contributors.
        </div>
        <div className="flex items-center gap-2">
          <button className="px-3 py-2 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700">
            Chấp nhận tất cả
          </button>
        </div>
      </div>
    </section>
  );
}

// Main Supplier component
export default function Supplier() {
  const [sheet, setSheet] = useState({ open: false, data: null });

  const openSheet = (data) => {
    setSheet({ open: true, data });
    document.body.style.overflow = "hidden";
  };

  const closeSheet = () => {
    setSheet({ open: false, data: null });
    document.body.style.overflow = "";
  };

  useEffect(() => {
    feather.replace();
  }, []);

  return (
    <div className="text-slate-800">
      <style>{`
        html,body{height:100%}
        body{ background: linear-gradient(180deg,#f8fafc 0%, #eef2f7 60%, #eef2f7 100%); font-family: Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; scrollbar-gutter: stable both-edges; }
        .card{ background:#fff; border:1px solid rgb(226 232 240); border-radius:1rem; box-shadow:0 10px 28px rgba(2,6,23,.08) }
        .card, article, button{ transition:all .18s ease; }
        .card:hover{ transform:translateY(-1px); box-shadow:0 16px 40px rgba(2,6,23,.12) }
        .nice-scroll{ scrollbar-width:thin; scrollbar-color:#cbd5e1 #f1f5f9 }
        .nice-scroll::-webkit-scrollbar{ width:10px }
        .nice-scroll::-webkit-scrollbar-track{ background:#f1f5f9; border-radius:9999px }
        .nice-scroll::-webkit-scrollbar-thumb{ background:#c7d2fe; border-radius:9999px; border:3px solid #f8fafc }
        .pro-table tbody tr:nth-child(even){ background:#f8fafc }
        .pro-table tbody tr:hover{ background:#eff6ff }
        .mini-map{ pointer-events:none; }
      `}</style>

      <main className="py-6 px-6 xl:px-8">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-6">
            <section>
              <div className="mb-4">
                <h1 className="text-2xl font-bold">Welcome back, Supplier!</h1>
                <p className="text-slate-600">Here's your dashboard overview</p>
              </div>
            </section>
          </div>

          <aside className="space-y-8">
            <OrderRequests list={[]} onDetail={openSheet} />
          </aside>
        </div>
      </main>

      {sheet.open && (
        <div
          className="fixed inset-0 bg-slate-900/30 backdrop-blur-[1px] z-[60]"
          onClick={closeSheet}
        />
      )}

      <footer className="text-center text-xs text-slate-500 mt-8">
        © 2025 VT Logistics — Demo UI
      </footer>
    </div>
  );
}