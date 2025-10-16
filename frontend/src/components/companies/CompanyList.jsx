// StarRating gọn trong file này để không phải tách thêm component
function StarRating({ rating = 0, size = 18, withText = false }) {
  const pct = Math.max(0, Math.min(100, (rating / 5) * 100));
  const GRAY =
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23d1d5db' d='M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27z'/%3E%3C/svg%3E\")";
  const AMBER =
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23f59e0b' d='M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27z'/%3E%3C/svg%3E\")";

  return (
    <span className="inline-flex items-center gap-1" title={`${rating.toFixed(1)}/5`}>
      <span
        aria-hidden
        style={{
          position: "relative",
          display: "inline-block",
          width: size * 5,
          height: size,
        }}
      >
        <span
          style={{
            position: "absolute",
            inset: 0,
            backgroundRepeat: "repeat-x",
            backgroundSize: `${size}px ${size}px`,
            backgroundImage: GRAY,
          }}
        />
        <span
          style={{
            position: "absolute",
            inset: 0,
            width: `${pct}%`,
            overflow: "hidden",
            backgroundRepeat: "repeat-x",
            backgroundSize: `${size}px ${size}px`,
            backgroundImage: AMBER,
          }}
        />
      </span>
      {withText && <span className="text-xs font-bold text-slate-900">({rating.toFixed(1)})</span>}
    </span>
  );
}

export default function CompanyList({ list, sort, onSortChange, onOpenModal, fmtVND }) {
  return (
    <div className="border-t border-slate-200" role="table" aria-label="Danh sách công ty">
      {/* Sort */}
      <div className="px-5 pt-3 pb-2 flex justify-end">
        <div className="flex items-center gap-2">
          <label className="text-sm text-slate-500">Sắp xếp</label>
          <select
            value={sort}
            onChange={(e) => onSortChange(e.target.value)}
            className="h-10 px-3 rounded-xl border border-slate-200"
          >
            <option value="recommended">Phù hợp nhất</option>
            <option value="priceAsc">Giá ↑</option>
            <option value="priceDesc">Giá ↓</option>
            <option value="ratingDesc">Đánh giá ↓</option>
          </select>
        </div>
      </div>

      {/* Head */}
      <div className="hidden md:grid grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,.8fr)_160px] gap-4 items-center px-5 pt-1 pb-2 text-slate-500 font-semibold" role="row">
        <div>Công ty vận tải</div>
        <div>Khu vực hoạt động</div>
        <div className="text-center">Giá</div>
        <div className="text-center">Đánh giá</div>
        <div className="text-center">Thông tin</div>
      </div>

      {/* Rows */}
      <div>
        {list.length === 0 ? (
          <div className="px-5 py-10 text-center text-slate-500">
            Không có kết quả phù hợp. Hãy chỉnh bộ lọc hoặc thử tuyến khác.
          </div>
        ) : (
          list.map((c) => {
            const co2 = Math.round((c.cost / 1000) * 0.8);
            const eta = (c.cost / 10000 + 2).toFixed(1);
            return (
              <div
                key={c.name}
                className="grid grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,.8fr)_160px] gap-4 items-center px-5 py-4 border-t border-slate-200"
              >
                <div className="font-medium flex items-center gap-2">{c.name}</div>
                <div className="min-w-0 font-medium truncate">{c.area}</div>
                <div className="font-medium text-center">
                  {fmtVND(c.cost)}/KM
                  <div className="text-[11px] text-slate-500">ETA: ~{eta}h • CO₂ ~{co2}g/KM</div>
                </div>
                <div className="text-center">
                  <StarRating rating={c.rating} withText />
                </div>
                <div className="text-center">
                  <button
                    type="button"
                    className="h-9 px-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700"
                    onClick={() => onOpenModal(c.name)}
                  >
                    Xem chi tiết
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
