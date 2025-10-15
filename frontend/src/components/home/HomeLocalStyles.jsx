import React from "react";

export default function HomeLocalStyles() {
  return (
    <style>{`
      :root{ --a1:rgba(96,165,250,.22); --a2:rgba(59,130,246,.18); --a3:rgba(99,102,241,.16); --a4:rgba(34,211,238,.14); --a5:rgba(167,139,250,.14) }
      .nice-scroll::-webkit-scrollbar{ width:8px; height:8px }
      .nice-scroll::-webkit-scrollbar-thumb{ background:rgba(37,99,235,.35); border-radius:999px }
      .glass{ background:rgba(255,255,255,.68); -webkit-backdrop-filter:blur(10px); backdrop-filter:blur(10px) }
      .bg-grid{ background-image:linear-gradient(rgba(37,99,235,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(37,99,235,.05) 1px,transparent 1px); background-size:22px 22px }
      .bg-dots{ background-image:radial-gradient(rgba(37,99,235,.10) 1px,transparent 1px); background-size:18px 18px }
      .bg-ribbon{ background-image:linear-gradient(90deg,#22d3ee,#60a5fa,#a78bfa,#f472b6,#f59e0b) }
      .section-curve{ mask:radial-gradient(200% 100% at 50% 0%,transparent 49%,#000 50%); -webkit-mask:radial-gradient(200% 100% at 50% 0%,transparent 49%,#000 50%) }
      .link-ux{ position:relative; background-image:linear-gradient(90deg,rgba(37,99,235,0),rgba(37,99,235,1),rgba(37,99,235,0)); background-repeat:no-repeat; background-size:0% 2px; background-position:50% 100%; transition:background-size .25s, transform .18s }
      .link-ux:hover{ background-size:100% 2px; transform:translateY(-1px) }
      .btn-shine{ position:relative; overflow:hidden; isolation:isolate }
      .btn-shine::after{ content:""; position:absolute; inset:-1px; background:linear-gradient(120deg,rgba(255,255,255,0) 20%,rgba(255,255,255,.55) 45%,rgba(255,255,255,0) 65%); transform:skewX(-20deg); background-size:200% 100%; animation:shine 2.4s linear infinite; mix-blend-mode:overlay; pointer-events:none }
      .btn-blue{ background:linear-gradient(180deg,#3b82f6,#2563eb); box-shadow:0 6px 18px rgba(37,99,235,.35) }
      .btn-blue:hover{ filter:brightness(1.03); box-shadow:0 8px 24px rgba(37,99,235,.45) }
      .title-grad{ background:linear-gradient(90deg,#0f172a,#1e3a8a 40%,#312e81 80%); -webkit-background-clip:text; background-clip:text; color:transparent }
      .subtitle-soft{ color:#334155 }
      @keyframes shine{ to{ background-position:200% 0 } }
      @keyframes aurora{ 0%{transform:translate3d(0,0,0) scale(1);opacity:.9} 50%{transform:translate3d(2%,-2%,0) scale(1.04);opacity:.95} 100%{transform:translate3d(0,0,0) scale(1);opacity:.9} }
      @keyframes blob{ 0%{border-radius:38% 62% 55% 45% / 35% 44% 56% 65%} 50%{border-radius:55% 45% 38% 62% / 60% 35% 65% 40%} 100%{border-radius:38% 62% 55% 45% / 35% 44% 56% 65%} }
      .animate-aurora{ animation:aurora 16s ease-in-out infinite }
      .rounded-blob{ animation:blob 9s ease-in-out infinite }
      @media (max-width:640px){ .mobile-sticky{ position:sticky; bottom:0 } }
    `}</style>
  );
}
