export default function LoginGlobalStyles() {
  return (
    <style>{`
/* Giữ giao diện phẳng, bỏ nền hiệu ứng */
body{ background:#fff; }

.glass{ background:rgba(255,255,255,.85); backdrop-filter:blur(8px); -webkit-backdrop-filter:blur(8px); }
.subtitle-soft{ color:#334155; }

/* Shadows tương đương homepage */
.shadow-soft{ box-shadow: 0 12px 40px rgba(2,6,23,.08); }
.shadow-blueglow{ box-shadow: 0 10px 24px rgba(37,99,235,.32); }

/* Buttons */
.btn-blue{
  background: linear-gradient(180deg,#3b82f6,#2563eb);
  color:#fff; box-shadow: 0 6px 18px rgba(37,99,235,.35);
}
.btn-blue:hover{ filter: brightness(1.03); box-shadow: 0 8px 24px rgba(37,99,235,.45); }

.btn-green{
  background: linear-gradient(180deg,#34d399,#10b981);
  color:#fff; box-shadow: 0 6px 18px rgba(16,185,129,.35);
}
.btn-green:hover{ filter: brightness(1.03); box-shadow: 0 8px 24px rgba(16,185,129,.45); }

.btn-shine{ position:relative; overflow:hidden; isolation:isolate; }
.btn-shine::after{
  content:""; position:absolute; inset:-1px;
  background: linear-gradient(120deg,rgba(255,255,255,0) 20%,rgba(255,255,255,.55) 45%,rgba(255,255,255,0) 65%);
  background-size:200% 100%; transform:skewX(-20deg);
  animation: shine 2.4s linear infinite; pointer-events:none; mix-blend-mode:overlay;
}

/* Link underline chạy */
.link-ux{
  position:relative;
  background-image:linear-gradient(90deg,transparent,#2563eb,transparent);
  background-repeat:no-repeat; background-size:0% 2px; background-position:50% 100%;
  transition:background-size .25s, transform .18s;
}
.link-ux:hover{ background-size:100% 2px; transform:translateY(-1px); }

/* Ribbon animation */
@keyframes shine{ to{ background-position:200% 0 } }
    `}</style>
  );
}
