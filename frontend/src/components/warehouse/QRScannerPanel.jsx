import React, { useEffect, useRef, useState } from "react";
import feather from "feather-icons";


export default function QRScannerPanel() {
  const readerId = "qrReader";
  const readerRef = useRef(null);

  const [mode, setMode] = useState("IN");
  const [cameras, setCameras] = useState([]);
  const [currentCameraId, setCurrentCameraId] = useState("");
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState("");

  useEffect(() => { feather.replace(); });

  useEffect(() => {
    (async () => {
      try { try{ await navigator.mediaDevices.getUserMedia({ video: true }); } catch {} } finally {}
      const devices = await navigator.mediaDevices.enumerateDevices();
      const cams = devices.filter(d=>d.kind==="videoinput");
      setCameras(cams);
      if(cams[0]?.deviceId) setCurrentCameraId(cams[0].deviceId);
    })();
    return () => { stopReader(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function stopReader() {
    if (!readerRef.current || !running) return;
    try { await readerRef.current.stop(); setRunning(false); } catch (e) { console.error(e); }
  }
  async function restartReader() { await stopReader(); await startReader(); }

  function onSuccess(decodedText) {
    setResult(decodedText);
    window.dispatchEvent(new CustomEvent("qr-scan", { detail: { code: decodedText, mode, ts: Date.now() } }));
    stopReader();
  }

  function switchCamera() {
    if (!cameras.length) return;
    const idx = cameras.findIndex(c => c.deviceId === currentCameraId);
    const next = (idx + 1) % cameras.length;
    setCurrentCameraId(cameras[next].deviceId);
    if (running) restartReader();
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
        <i data-feather="grid" className="w-4 h-4" /> QR Check-in/out (Camera)
      </div>

      <div className="flex flex-col gap-3">
        {/* Mode */}
        <div className="flex items-center gap-2">
          <span className="text-[12px] text-slate-600">Chế độ:</span>
          <div className="inline-flex rounded-xl ring-1 ring-slate-200 overflow-hidden">
            <button type="button" onClick={() => setMode("IN")} className={`px-3 py-1.5 text-sm font-semibold ${mode==="IN" ? "bg-emerald-50 text-emerald-700" : "bg-white text-slate-700 hover:bg-slate-50"}`}>
              Check-in (Nhập)
            </button>
            <button type="button" onClick={() => setMode("OUT")} className={`px-3 py-1.5 text-sm font-semibold ${mode==="OUT" ? "bg-amber-50 text-amber-700" : "bg-white text-slate-700 hover:bg-slate-50"}`}>
              Check-out (Xuất)
            </button>
          </div>
        </div>

        {/* Camera select */}
        <div className="flex items-center gap-2">
          <span className="text-[12px] text-slate-600">Camera:</span>
          <select className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-sm min-w-[180px]" value={currentCameraId} onChange={e=>setCurrentCameraId(e.target.value)}>
            {!cameras.length && <option value="">Không tìm thấy camera</option>}
            {cameras.map((c, idx) => (
              <option key={c.deviceId} value={c.deviceId}>{`Camera ${idx+1}`}{c.label ? ` – ${c.label}`:""}</option>
            ))}
          </select>
          <button type="button" onClick={switchCamera} className="h-9 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-sm flex items-center gap-2">
            <i data-feather="refresh-cw" className="w-4 h-4" /> Đổi camera
          </button>
        </div>

        {/* Reader */}
        <div className="rounded-xl bg-slate-50 border border-slate-200 p-2">
          <div id={readerId} className="rounded-lg overflow-hidden" style={{ aspectRatio: "1/1", maxWidth: 320, margin: "0 auto" }} />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button type="button" onClick={startReader} disabled={running || !currentCameraId} className="h-9 px-3 rounded-xl bg-sky-600 text-white hover:bg-sky-700 text-sm flex items-center gap-2 disabled:opacity-50">
            <i data-feather="play" className="w-4 h-4" /> Bắt đầu quét
          </button>
          <button type="button" onClick={stopReader} disabled={!running} className="h-9 px-3 rounded-xl bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50 text-sm flex items-center gap-2 disabled:opacity-50">
            <i data-feather="pause" className="w-4 h-4" /> Tạm dừng
          </button>
        </div>

        {/* Result */}
        {result && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
            <div className="text-[12px] text-emerald-700 mb-1 font-semibold">Kết quả quét</div>
            <div className="text-sm font-mono text-emerald-800 break-all">{result}</div>
            <div className="mt-1 text-[12px] text-slate-600">Chế độ hiện tại: <span className="font-semibold">{mode === "IN" ? "NHẬP" : "XUẤT"}</span></div>
          </div>
        )}

        <p className="text-[12px] text-slate-500 mt-1">Tip: nếu có nhiều camera, ưu tiên “Camera 2” (camera sau).</p>
      </div>
    </div>
  );
}
