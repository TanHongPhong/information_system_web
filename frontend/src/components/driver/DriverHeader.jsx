import React from "react";
import { TruckIcon, MoreHorizontalIcon } from "./FeatherIcons";

export default function DriverHeader() {
  return (
    <header className="sticky top-0 z-10 shadow-sm">
      <div
        className="relative px-4 pt-[env(safe-area-inset-top)] py-3 flex items-center justify-between text-white"
        style={{
          background:
            "linear-gradient(90deg, #c8efff 0%, #9ccdf7 45%, #759cea 100%)",
          isolation: "isolate",
        }}
      >
        {/* overlay tối dần qua phải */}
        <div
          className="absolute inset-0 pointer-events-none -z-10"
          style={{
            background:
              "linear-gradient(90deg, rgba(0,0,0,.18), rgba(0,0,0,.08) 40%, rgba(0,0,0,0) 65%)",
          }}
        />

        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-white/15 ring-1 ring-inset ring-white/10">
            <TruckIcon className="w-5 h-5 text-white drop-shadow-[0_1px_1px_rgba(0,0,0,.45)]" />
          </div>

          <div>
            <h1 className="text-base font-semibold leading-none drop-shadow-[0_1px_1px_rgba(0,0,0,.5)]">
              Trang tài xế
            </h1>
            <p className="text-xs leading-5 text-white/95 mt-0.5 drop-shadow-[0_1px_1px_rgba(0,0,0,.45)]">
              Thông tin chuyến &amp; hàng hóa
            </p>
          </div>
        </div>

        <button className="p-2 rounded-lg hover:bg-white/10 active:scale-95 transition ring-1 ring-inset ring-white/10">
          <MoreHorizontalIcon className="w-5 h-5 text-white drop-shadow-[0_1px_1px_rgba(0,0,0,.45)]" />
        </button>
      </div>
    </header>
  );
}
