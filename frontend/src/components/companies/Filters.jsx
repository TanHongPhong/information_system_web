import React from "react";

export default function Filters({ 
  from, to, size, sort,
  showAdv, svcCold, svcDanger, svcLoading, svcInsurance, cargoType, pickupTime,
  setFrom, setTo, setSize, setSort, toggleAdv,
  setSvcCold, setSvcDanger, setSvcLoading, setSvcInsurance,
  setCargoType, setPickupTime,
  onSwap, onSearch
}) {
  return (
    <>
      {/* Sort */}
      <div className="px-5 -mt-2">
        <div className="flex items-center gap-2 justify-end">
          <label className="text-sm text-slate-500" htmlFor="sort">Sắp xếp</label>
          <select
            id="sort"
            className="h-10 px-3 rounded-xl border border-slate-200"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="recommended">Phù hợp nhất</option>
            <option value="priceAsc">Giá ↑</option>
            <option value="priceDesc">Giá ↓</option>
            <option value="ratingDesc">Đánh giá ↓</option>
          </select>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 p-5 pt-2">
        <input
          className="h-10 min-w-[220px] px-3 rounded-xl border border-slate-200"
          placeholder="Chọn điểm lấy hàng"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSearch()}
        />
        <button
          className="size-10 rounded-xl border border-slate-200 grid place-items-center"
          title="Đổi chiều"
          onClick={onSwap}
        >
          ⇄
        </button>
        <input
          className="h-10 min-w-[220px] px-3 rounded-xl border border-slate-200"
          placeholder="Chọn điểm đến"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSearch()}
        />
        <select
          className="h-10 min-w-[180px] px-3 rounded-xl border border-slate-200"
          value={size}
          onChange={(e) => setSize(e.target.value)}
        >
          <option value="">Chọn kích thước</option>
          <option>≤ 2 tấn</option>
          <option>≤ 4 tấn</option>
          <option>Container 20ft</option>
          <option>Container 40ft</option>
          <option>Xe lạnh</option>
        </select>
        <button
          className="h-10 px-4 rounded-xl bg-blue-600 text-white hover:bg-blue-700"
          onClick={onSearch}
        >
          Tìm kiếm
        </button>
        <button
          className="h-10 px-3 rounded-xl border border-slate-200"
          onClick={toggleAdv}
        >
          Bộ lọc nâng cao
        </button>
      </div>

      {/* Advanced */}
      {showAdv && (
        <div className="px-5 pb-4">
          <div className="grid md:grid-cols-3 gap-3">
            <label className="flex items-center gap-2">
              <input type="checkbox" className="size-4" checked={svcCold} onChange={(e)=>setSvcCold(e.target.checked)} />
              Xe lạnh
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" className="size-4" checked={svcDanger} onChange={(e)=>setSvcDanger(e.target.checked)} />
              Hàng nguy hiểm
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" className="size-4" checked={svcLoading} onChange={(e)=>setSvcLoading(e.target.checked)} />
              Bốc xếp
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" className="size-4" checked={svcInsurance} onChange={(e)=>setSvcInsurance(e.target.checked)} />
              Bảo hiểm
            </label>
            <div>
              <label className="block text-sm text-slate-500 mb-1">Thời gian lấy hàng</label>
              <input
                type="datetime-local"
                className="h-10 w-full px-3 rounded-xl border border-slate-200"
                value={pickupTime}
                onChange={(e)=>setPickupTime(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm text-slate-500 mb-1">Loại hàng</label>
              <select
                className="h-10 w-full px-3 rounded-xl border border-slate-200"
                value={cargoType}
                onChange={(e)=>setCargoType(e.target.value)}
              >
                <option value="">— Chọn —</option>
                <option>Lạnh</option>
                <option>Nguy hiểm</option>
                <option>Hàng cồng kềnh</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
