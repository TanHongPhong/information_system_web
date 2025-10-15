import React, { useEffect, useRef, useState } from "react";
import { Grid, Play, Pause, RefreshCw } from "lucide-react";

export default function QRCameraCard() {
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const [mode, setMode] = useState("IN"); // IN | OUT
  const [devices, setDevices] = useState([]);
  const [currentId, setCurrentId] = useState("");
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState("");

  useEffect(() => {
    async function init() {
      try {
        // Warm-up ask permission (best-effort)
        try {
          await navigator.mediaDevices.getUserMedia({ video: true });
        } catch {}
        const list = await navigator.mediaDevices.enumerateDevices();
        const cams = list.filter((d) => d.kind === "videoinput");
        setDevices(cams);
        if (cams[0]) setCurrentId(cams[0].deviceId);
      } catch (e) {
        console.error(e);
      }
    }
    init();
    return () => {
      stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function start() {
    try {
      if (running) return;
      const constraints = currentId
        ? { video: { deviceId: { exact: currentId } } }
        : { video: true };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setRunning(true);

      // Demo: giả lập có mã quét được sau 2s (vì không tích hợp lib decode ở đây)
      setTimeout(() => {
        setResult(`DEMO-${mode}-${Date.now()}`);
      }, 2000);
    } catch (e) {
      console.error(e);
      alert("Không truy cập được camera. Vui lòng cấp quyền.");
    }
  }

  async function stop() {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.srcObject = null;
      }
      setRunning(false);
    } catch (e) {
      console.error(e);
    }
  }

  function switchCamera() {
    if (!devices.length) return;
    const idx = devices.findIndex((d) => d.deviceId === currentId);
    const next = devices[(idx + 1) % devices.length];
    setCurrentId(next.deviceId);
    if (running) {
      stop().then(start);
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
        <Grid className="w-4 h-4" /> QR Check-in/out (Camera)
      </div>

      <div className="flex flex-col gap-3" aria-label="Khu vực camera quét mã QR nhập/xuất">
        {/* Mode */}
        <div className="flex items-center gap-2">
          <span className="text-[12px] text-slate-600">Chế độ:</span>
          <div className="inline-flex rounded-xl ring-1 ring-slate-200 overflow-hidden">
            <button
              type="button"
              onClick={() => setMode("IN")}
              className={`px-3 py-1.5 text-sm font-semibold ${
                mode === "IN"
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              Check-in (Nhập)
            </button>
            <button
              type="button"
              onClick={() => setMode("OUT")}
              className={`px-3 py-1.5 text-sm font-semibold ${
                mode === "OUT"
                  ? "bg-amber-50 text-amber-700"
                  : "bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              Check-out (Xuất)
            </button>
          </div>
        </div>

        {/* Camera selector */}
        <div className="flex items-center gap-2">
          <span className="text-[12px] text-slate-600">Camera:</span>
          <select
            value={currentId}
            onChange={(e) => setCurrentId(e.target.value)}
            className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-sm min-w-[180px]"
          >
            {devices.length === 0 && <option>Không tìm thấy camera</option>}
            {devices.map((c, i) => (
              <option key={c.deviceId} value={c.deviceId}>
                {`Camera ${i + 1}` + (c.label ? ` – ${c.label}` : "")}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={switchCamera}
            className="h-9 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-sm flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" /> Đổi camera
          </button>
        </div>

        {/* Reader */}
        <div className="rounded-xl bg-slate-50 border border-slate-200 p-2">
          <div className="rounded-lg overflow-hidden" style={{ aspectRatio: "1/1", maxWidth: 320, margin: "0 auto" }}>
            <video ref={videoRef} muted playsInline className="w-full h-full object-cover" />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={start}
            disabled={running}
            className="h-9 px-3 rounded-xl bg-sky-600 text-white hover:bg-sky-700 text-sm flex items-center gap-2 disabled:opacity-60"
          >
            <Play className="w-4 h-4" /> Bắt đầu quét
          </button>
          <button
            type="button"
            onClick={stop}
            disabled={!running}
            className="h-9 px-3 rounded-xl bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50 text-sm flex items-center gap-2 disabled:opacity-60"
          >
            <Pause className="w-4 h-4" /> Tạm dừng
          </button>
        </div>

        {/* Result */}
        {result && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
            <div className="text-[12px] text-emerald-700 mb-1 font-semibold">Kết quả quét</div>
            <div className="text-sm font-mono text-emerald-800 break-all">{result}</div>
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
