/**
 * Headless UI cho QR scanning:
 * - Bạn tích hợp thư viện (vd: html5-qrcode) ở parent, truyền props & handlers xuống.
 * - Panel chỉ render UI + phát sự kiện qua callback props.
 */
export default function QRScannerPanel({
  mode = "IN",
  cameras = [],
  currentCameraId = "",
  running = false,
  lastResult = "",
  onModeChange, onStart, onPause, onSwitchCamera, onPickCamera
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
        # QR Check-in/out (Camera)
      </div>

      <div className="flex flex-col gap-3">
        {/* Mode */}
        <div className="flex items-center gap-2">
          <span className="text-[12px] text-slate-600">Chế độ:</span>
          <div className="inline-flex rounded-xl ring-1 ring-slate-200 overflow-hidden">
            <button
              type="button"
              onClick={() => onModeChange?.("IN")}
              className={
                "px-3 py-1.5 text-sm font-semibold " +
                (mode==="IN" ? "bg-emerald-50 text-emerald-700" : "bg-white text-slate-700 hover:bg-slate-50")
              }>
              Check-in (Nhập)
            </button>
            <button
              type="button"
              onClick={() => onModeChange?.("OUT")}
              className={
                "px-3 py-1.5 text-sm font-semibold " +
                (mode==="OUT" ? "bg-amber-50 text-amber-700" : "bg-white text-slate-700 hover:bg-slate-50")
              }>
              Check-out (Xuất)
            </button>
          </div>
        </div>

        {/* Camera selector */}
        <div className="flex items-center gap-2">
          <span className="text-[12px] text-slate-600">Camera:</span>
          <select
            value={currentCameraId}
            onChange={e => onPickCamera?.(e.target.value)}
            className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-sm min-w-[180px]"
          >
            {cameras.length === 0 && <option>Không tìm thấy camera</option>}
            {cameras.map((c, idx) => (
              <option key={c.deviceId} value={c.deviceId}>
                {`Camera ${idx+1}`}{c.label ? ` – ${c.label}` : ""}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => onSwitchCamera?.()}
            className="h-9 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-sm flex items-center gap-2">
            🔄 Đổi camera
          </button>
        </div>

        {/* Reader viewport (parent mount scanner vào div này qua ref) */}
        <div className="rounded-xl bg-slate-50 border border-slate-200 p-2">
          <div id="qrReader" className="rounded-lg overflow-hidden" style={{ aspectRatio: "1/1", maxWidth: 320, margin: "0 auto" }} />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onStart?.()}
            disabled={running}
            className="h-9 px-3 rounded-xl bg-sky-600 text-white hover:bg-sky-700 text-sm flex items-center gap-2 disabled:opacity-50">
            ▶ Bắt đầu quét
          </button>
          <button
            type="button"
            onClick={() => onPause?.()}
            disabled={!running}
            className="h-9 px-3 rounded-xl bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50 text-sm flex items-center gap-2 disabled:opacity-50">
            ⏸ Tạm dừng
          </button>
        </div>

        {/* Result */}
        {lastResult && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
            <div className="text-[12px] text-emerald-700 mb-1 font-semibold">Kết quả quét</div>
            <div className="text-sm font-mono text-emerald-800 break-all">{lastResult}</div>
            <div className="mt-1 text-[12px] text-slate-600">
              Chế độ hiện tại: <span className="font-semibold">{mode === "IN" ? "NHẬP" : "XUẤT"}</span>
            </div>
          </div>
        )}

        <p className="text-[12px] text-slate-500 mt-1">
          Tip: nếu có nhiều camera, hãy chọn “Camera 2” (thường là camera sau của điện thoại).
        </p>
      </div>
    </div>
  );
}
