// src/components/theo doi don hang/OrderSearchPanel.jsx
import React from "react";
import { IconSearch, IconTruck, IconEye } from "./IconsFeather";

export default function OrderSearchPanel() {
  // danh sách ship phía dưới (bắt chước script HTML clone template)
  const moreShipIds = [
    "0124",
    "0125",
    "0126",
    "0127",
    "0128",
    "0129",
    "0130",
    "0131",
    "0132",
    "0133",
  ];

  return (
    <section className="h-full flex flex-col min-h-0">
      <div className="flex-1 min-h-0 overflow-auto pr-1">
        <div className="bg-white border border-slate-200 rounded-2xl p-3 relative">
          {/* sticky header trong card */}
          <div className="sticky top-0 z-10 -m-3 p-3 bg-white/95 backdrop-blur rounded-t-2xl border-b border-slate-200">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <h3 className="font-semibold tracking-tight text-[14px]">
                ORDER SEARCH
              </h3>

              <div className="relative flex-1 min-w-[140px]">
                <input
                  className="h-9 w-full rounded-lg border border-slate-300 pl-8 pr-3 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  placeholder="Tìm kiếm"
                />
                <IconSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 w-[16px] h-[16px]" />
              </div>
            </div>

            <div className="mt-3 flex items-center gap-2 text-xs flex-wrap">
              <button className="px-2.5 py-1 rounded-full ring-1 ring-slate-200 bg-white text-slate-700">
                Active
              </button>
              <button className="px-2.5 py-1 rounded-full ring-1 ring-slate-200 bg-white text-slate-700">
                Arriving
              </button>
              <button className="px-2.5 py-1 rounded-full ring-1 ring-slate-200 bg-white text-slate-700">
                Departed
              </button>
            </div>
          </div>

          {/* Card nổi bật */}
          <article className="mt-3 rounded-xl border border-blue-200 bg-blue-50/40 p-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2 flex-1 min-w-0 overflow-hidden">
                <span className="inline-grid place-items-center w-8 h-8 rounded-lg bg-blue-100 text-[#1E66FF]">
                  <IconTruck className="w-4 h-4" />
                </span>

                <div className="text-sm min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <a
                      href="#!"
                      className="font-semibold text-slate-800 text-[14px]"
                    >
                      ShipID-0123
                    </a>
                    <span className="text-[10px] px-[0.45rem] py-[0.15rem] rounded-full bg-blue-100 text-[#1E66FF] ring-1 ring-blue-200/70 font-semibold tracking-wide">
                      ARRIVING
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-500 leading-snug">
                    <div>DL04MP7045</div>
                    <div className="whitespace-nowrap">
                      Tải trọng tối đa 6.5 tấn
                    </div>
                  </div>
                </div>
              </div>

              <button
                title="Đang theo dõi"
                className="shrink-0 w-8 h-8 rounded-full grid place-items-center bg-[#1E66FF] text-white ring-1 ring-blue-500/30 hover:brightness-105"
              >
                <IconEye className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-3 grid grid-cols-12 gap-2">
              <div className="col-span-8">
                <ul className="space-y-1.5 text-xs text-slate-600 leading-snug">
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-blue-500" />
                    <span>Departure: TP.Hồ Chí Minh</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-blue-500" />
                    <span>Stop 01: Quảng Ngãi</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-blue-500" />
                    <span>Stop 02: Thanh Hóa</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-blue-500" />
                    <span>Arrival: Hà Nội</span>
                  </li>
                </ul>
              </div>
              <div className="col-span-4">
                <img
                  src="https://s3.cloud.cmctelecom.vn/tinhte2/2020/08/5100688_ban_do_tphcm.jpg"
                  alt="Mini map"
                  className="w-full h-20 rounded-lg object-cover border border-slate-200"
                />
              </div>
            </div>
          </article>

          {/* Danh sách còn lại */}
          <div className="mt-3 space-y-3">
            {moreShipIds.map((id) => (
              <article
                key={id}
                className="rounded-xl border border-slate-200 bg-white p-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="inline-grid place-items-center w-8 h-8 rounded-lg bg-blue-50 text-[#1E66FF]">
                      <IconTruck className="w-4 h-4" />
                    </span>
                    <div className="text-sm">
                      <div className="flex items-center gap-2 flex-wrap">
                        <a
                          href="#!"
                          className="font-semibold text-slate-800 text-[14px]"
                        >
                          {`ShipID-${id}`}
                        </a>
                        <span className="text-[10px] px-[0.45rem] py-[0.15rem] rounded-full bg-blue-100 text-[#1E66FF] ring-1 ring-blue-200/70 font-semibold tracking-wide">
                          ARRIVING
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 leading-snug">
                        <div>DL04MP7045</div>
                        <div>Tải trọng tối đa 6.5 tấn</div>
                      </div>
                    </div>
                  </div>

                  <button
                    title="Theo dõi"
                    className="shrink-0 w-8 h-8 rounded-md grid place-items-center ring-1 ring-slate-200 hover:bg-slate-50"
                  >
                    <IconEye className="w-4 h-4 text-slate-700" />
                  </button>
                </div>

                <div className="mt-2 text-right">
                  <a
                    className="text-[11px] text-blue-600 hover:underline"
                    href="#!"
                  >
                    Chi tiết
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
