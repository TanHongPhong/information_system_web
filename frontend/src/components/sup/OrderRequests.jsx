import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export default function OrderRequests() {
  return (
    <section className="bg-white border border-slate-200 rounded-[1rem] shadow-[0_10px_28px_rgba(2,6,23,.08)] hover:shadow-[0_16px_40px_rgba(2,6,23,.12)] hover:-translate-y-px transition-all h-[calc(100vh-180px)] flex flex-col min-h-0">
      {/* Header panel */}
      <div className="p-4 md:p-5 flex items-center justify-between gap-3 border-b border-slate-100">
        <h3 className="font-semibold text-lg text-slate-800 flex-shrink-0">
          Order Requests
        </h3>

        <div className="relative flex-1 max-w-xs">
          <i
            data-feather="search"
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
          ></i>
          <input
            className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
            placeholder="Tìm kiếm đơn hàng"
          />
        </div>
      </div>

      <div className="px-4 md:px-5 pt-3 text-sm text-slate-600 font-medium">
        Yêu cầu đặt hàng gần đây
      </div>

      {/* Danh sách yêu cầu cuộn dọc, KHÔNG cuộn ngang */}
      <div className="p-4 md:p-5 pt-2 flex-1 min-h-0 overflow-y-auto overflow-x-hidden space-y-4">
        {/* ---- CARD 1 (có trạng thái NEW) ---- */}
        <OrderCard
          highlight
          id="ORDERID 0112"
          time="20/10/2025 9:00"
          from="279 Nguyễn Tri Phương P8 Q10 TPHCM"
          to="777 Lê Lai P3 Q1 TP.Hà Nội"
          avatarBg="bg-indigo-100"
          avatarText="text-indigo-700"
          init="QT"
          name="Quang Trè"
          latA={10.7676}
          lngA={106.6667}
          latB={21.0285}
          lngB={105.8542}
        />

        {/* ---- CARD 2 ---- */}
        <OrderCard
          id="ORDERID 0255"
          time="22/10/2025 14:00"
          from="436 Trường Sa P3 Q7 TPHCM"
          to="555 Phan Đăng Lưu P7 Q.Phú Nhuận"
          avatarBg="bg-green-100"
          avatarText="text-green-700"
          init="VA"
          name="Văn An"
          latA={10.7880}
          lngA={106.6800}
          latB={10.8009}
          lngB={106.6809}
        />

        {/* ---- CARD 3 ---- */}
        <OrderCard
          id="ORDERID 8813"
          time="28/10/2025 11:30"
          from="KCN Amata, Biên Hòa, Đồng Nai"
          to="KCN Sóng Thần, Dĩ An, Bình Dương"
          avatarBg="bg-red-100"
          avatarText="text-red-700"
          init="TB"
          name="Trần Bích"
          latA={10.9452}
          lngA={106.8553}
          latB={10.8876}
          lngB={106.7431}
        />

        {/* ---- CARD 4 ---- */}
        <OrderCard
          id="ORDERID 9021"
          time="01/11/2025 08:00"
          from="123 Lê Lợi, P. Bến Thành, Q.1, TPHCM"
          to="456 Hai Bà Trưng, P. Tân Định, Q.1"
          avatarBg="bg-purple-100"
          avatarText="text-purple-700"
          init="HP"
          name="Hữu Phước"
          latA={10.7755}
          lngA={106.7019}
          latB={10.7860}
          lngB={106.6903}
        />

        {/* ---- CARD 5 ---- */}
        <OrderCard
          id="ORDERID 9134"
          time="05/11/2025 10:00"
          from="789 Nguyễn Văn Cừ, P.4, Q.5, TPHCM"
          to="321 Trần Hưng Đạo, P. Cầu Ông Lãnh, Q.1"
          avatarBg="bg-blue-100"
          avatarText="text-blue-700"
          init="GH"
          name="Gia Hân"
          latA={10.7598}
          lngA={106.6750}
          latB={10.7690}
          lngB={106.6940}
        />

        {/* ---- CARD 6 ---- */}
        <OrderCard
          id="ORDERID 9278"
          time="10/11/2025 15:30"
          from="456 Lý Thường Kiệt, P.7, Q. Tân Bình, TPHCM"
          to="123 Nguyễn Huệ, P. Bến Nghé, Q.1"
          avatarBg="bg-orange-100"
          avatarText="text-orange-700"
          init="AT"
          name="Anh Tuấn"
          latA={10.7970}
          lngA={106.6600}
          latB={10.7765}
          lngB={106.7005}
        />

        {/* ---- CARD 7 ---- */}
        <OrderCard
          id="ORDERID 9356"
          time="15/11/2025 09:45"
          from="321 Phạm Văn Đồng, P.3, Q. Gò Vấp, TPHCM"
          to="654 Lê Văn Sỹ, P.11, Q.3"
          avatarBg="bg-teal-100"
          avatarText="text-teal-700"
          init="BC"
          name="Bảo Châu"
          latA={10.8210}
          lngA={106.6860}
          latB={10.7840}
          lngB={106.6760}
        />
      </div>

      {/* Footer panel */}
      <div className="px-4 md:px-5 py-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
        <div>
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
          <button className="px-3 py-2 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-all">
            Chấp nhận tất cả
          </button>
        </div>
      </div>
    </section>
  );
}

/* ======================
   SUBCOMPONENTS
   ====================== */

function OrderCard({
  highlight = false,
  id,
  time,
  from,
  to,
  avatarBg,
  avatarText,
  init,
  name,
  latA,
  lngA,
  latB,
  lngB,
}) {
  return (
    <article
      className={
        highlight
          ? "relative rounded-xl p-4 border-2 border-amber-300 bg-amber-50 transition-all"
          : "rounded-xl p-4 border border-slate-200 bg-white hover:border-blue-300 transition-all"
      }
    >
      {/* Hàng trên: ORDERID + giờ + (NEW nếu highlight) */}
      <div className="flex items-start justify-between text-xs text-slate-500 leading-relaxed">
        <div className="font-semibold text-slate-700">{id}</div>

        <div className="flex items-start gap-2 flex-shrink-0">
          <div className="text-slate-500">{time}</div>
          {highlight && (
            <span className="text-[10px] font-bold text-amber-800 bg-amber-300 px-1.5 py-[2px] rounded leading-none h-fit">
              NEW
            </span>
          )}
        </div>
      </div>

      {/* block địa chỉ + map */}
      <div className="mt-2 grid grid-cols-12 gap-3">
        <div className="col-span-8 space-y-2 text-sm leading-relaxed text-slate-700">
          <div>
            <div className="text-xs text-slate-500">Từ</div>
            <div className="font-medium text-slate-700 whitespace-pre-line">
              {from}
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-500">Đến</div>
            <div className="font-medium text-slate-700 whitespace-pre-line">
              {to}
            </div>
          </div>
        </div>

        <div className="col-span-4">
          <MapView latA={latA} lngA={lngA} latB={latB} lngB={lngB} />
        </div>
      </div>

      {/* footer: avatar + tên + nút Chi tiết */}
      <div
        className={
          highlight
            ? "mt-3 pt-3 border-t border-amber-200 flex items-center justify-between"
            : "mt-3 pt-3 border-t border-slate-100 flex items-center justify-between"
        }
      >
        <div className="flex items-center gap-2">
          <div
            className={`w-7 h-7 rounded-full grid place-items-center font-semibold text-xs ${avatarBg} ${avatarText}`}
          >
            {init}
          </div>
          <div className="font-medium text-sm text-slate-800">{name}</div>
        </div>

        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-all">
            Chi tiết
          </button>
        </div>
      </div>
    </article>
  );
}

/**
 * MapView
 * - Tạo 1 mini map Leaflet riêng biệt cho từng đơn.
 * - Không tương tác (pointer-events: none), bo góc, có border giống card gốc.
 * - Chiều cao cố định ~90px để giống screenshot ban đầu.
 */
function MapView({ latA, lngA, latB, lngB }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Nếu StrictMode render 2 lần, huỷ map cũ trước khi tạo map mới
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    // tạo map
    const map = L.map(containerRef.current, {
      attributionControl: false,
      zoomControl: false,
      scrollWheelZoom: false,
      dragging: false,
      doubleClickZoom: false,
      boxZoom: false,
      keyboard: false,
    });

    mapRef.current = map;

    // tile nền
    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}{r}.png",
      { maxZoom: 19 }
    ).addTo(map);

    const points = [];

    // điểm A (màu xanh dương)
    if (!isNaN(latA) && !isNaN(lngA)) {
      points.push([latA, lngA]);
      L.circleMarker([latA, lngA], {
        radius: 6,
        weight: 2,
        color: "#2563eb",
        fillColor: "#60a5fa",
        fillOpacity: 0.9,
      }).addTo(map);
    }

    // điểm B (màu xanh lá)
    if (!isNaN(latB) && !isNaN(lngB)) {
      points.push([latB, lngB]);
      L.circleMarker([latB, lngB], {
        radius: 6,
        weight: 2,
        color: "#059669",
        fillColor: "#34d399",
        fillOpacity: 0.9,
      }).addTo(map);
    }

    if (points.length === 2) {
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds, { padding: [12, 12], maxZoom: 16 });
    } else if (points.length === 1) {
      map.setView(points[0], 15);
    } else {
      map.setView([10.776, 106.7], 12); // fallback HCM
    }

    // fix bug map trắng lần render đầu (Leaflet cần biết kích thước)
    setTimeout(() => {
      map.invalidateSize();
    }, 0);

    // cleanup khi component unmount / rerender
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [latA, lngA, latB, lngB]);

  return (
    <div
      ref={containerRef}
      className="w-full h-[90px] rounded-lg border border-slate-200 overflow-hidden pointer-events-none bg-slate-100"
    />
  );
}
