<<<<<<< HEAD

import React, { useEffect, useMemo, useRef, useState } from "react";
import feather from "feather-icons";
import { Link } from "react-router-dom";

export default function OrderTracking() {
  // ======= Mock data =======
  const extraShipIds = useMemo(
    () => ["0124","0125","0126","0127","0128","0129","0130","0131","0132","0133"],
    []
  );

  const [progress, setProgress] = useState(0.6); // 60% tiến độ
  const topbarRef = useRef(null);
  const mapBoxRef = useRef(null);

  // ======= Helpers =======
  const setCSSVar = (name, value) =>
    document.documentElement.style.setProperty(name, value);

  const syncTopbarAndMap = () => {
    if (topbarRef.current) {
      setCSSVar("--topbar-h", `${topbarRef.current.offsetHeight}px`);
    }
    if (mapBoxRef.current) {
      setCSSVar("--map-h", `${mapBoxRef.current.offsetHeight}px`);
    }
  };

  useEffect(() => {
    feather.replace({ width: 16, height: 16 });
    syncTopbarAndMap();
    window.addEventListener("resize", syncTopbarAndMap);
    return () => window.removeEventListener("resize", syncTopbarAndMap);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Topbar */}
      <div ref={topbarRef} className="sticky top-0 z-10 bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="inline-flex items-center gap-2 font-semibold">
              <i data-feather="home" />
              Trang chủ
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-700">Theo dõi đơn hàng</span>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-lg border hover:bg-gray-50">
              <i data-feather="bell" />
            </button>
          </div>
        </div>
      </div>

      {/* Main */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-4">
            {/* Map placeholder */}
            <div
              ref={mapBoxRef}
              className="bg-white rounded-xl border p-4 h-64 flex items-center justify-center"
            >
              <span className="text-gray-500">Bản đồ (placeholder)</span>
            </div>

            {/* Progress */}
            <div className="bg-white rounded-xl border p-4">
              <div className="mb-2 flex justify-between text-sm">
                <span>Tiến độ</span>
                <span>{Math.round(progress * 100)}%</span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded">
                <div
                  className="h-2 bg-blue-500 rounded"
                  style={{ width: `${progress * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Aside */}
          <aside className="space-y-3">
            <div className="bg-white rounded-xl border p-4">
              <h3 className="font-semibold mb-2">Các mã đơn khác</h3>
              <ul className="grid grid-cols-2 gap-2 text-sm">
                {extraShipIds.map((id) => (
                  <li
                    key={id}
                    className="px-2 py-1 rounded border text-gray-700"
                  >
                    {id}
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
