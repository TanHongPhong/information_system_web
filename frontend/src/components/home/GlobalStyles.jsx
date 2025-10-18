export default function GlobalStyles() {
  return (
    <style>{`
:root{
  --a1: rgba(96,165,250,.22); --a2: rgba(59,130,246,.18); --a3: rgba(99,102,241,.16);
  --a4: rgba(34,211,238,.14); --a5: rgba(167,139,250,.14);
}
.nice-scroll::-webkit-scrollbar{ width:8px;height:8px }
.nice-scroll::-webkit-scrollbar-thumb{ background:rgba(37,99,235,.35);border-radius:999px }
.nice-scroll::-webkit-scrollbar-track{ background:transparent }
.glass{ background:rgba(255,255,255,.68); -webkit-backdrop-filter:blur(10px); backdrop-filter:blur(10px) }
.section-curve{ mask:radial-gradient(200% 100% at 50% 0%,transparent 49%,#000 50%);
  -webkit-mask:radial-gradient(200% 100% at 50% 0%,transparent 49%,#000 50%) }
.link-ux{ position:relative; background-image:linear-gradient(90deg,rgba(37,99,235,0),rgba(37,99,235,1),rgba(37,99,235,0));
  background-repeat:no-repeat; background-size:0% 2px; background-position:50% 100%;
  transition: background-size .25s ease, color .18s ease, transform .18s ease; }
.link-ux:hover{ background-size:100% 2px; transform: translateY(-1px) }
.btn-shine{ position:relative; overflow:hidden; isolation:isolate }
.btn-shine::after{ content:""; position:absolute; inset:-1px;
  background:linear-gradient(120deg,rgba(255,255,255,0) 20%,rgba(255,255,255,.55) 45%,rgba(255,255,255,0) 65%);
  transform:skewX(-20deg); background-size:200% 100%; animation:shine 2.4s linear infinite; mix-blend-mode:overlay; pointer-events:none }
.btn-blue{ background:linear-gradient(180deg,#3b82f6,#2563eb); box-shadow:0 6px 18px rgba(37,99,235,.35) }
.btn-blue:hover{ filter:brightness(1.03); box-shadow:0 8px 24px rgba(37,99,235,.45) }
.is-scrolled{ box-shadow:0 10px 30px rgba(2,6,23,.08) inset, 0 10px 30px rgba(2,6,23,.08) }
#progressBar{ height:3px; background:linear-gradient(90deg,#60a5fa,#3b82f6,#818cf8); background-size:200% 100%; animation:shine 3s linear infinite; width:0 }
.card-grad{ position:relative }
.card-grad::before{ content:""; position:absolute; inset:0; border-radius:1rem; padding:1px;
  background:linear-gradient(120deg,rgba(96,165,250,.35),rgba(167,139,250,.35),rgba(34,211,238,.35));
  -webkit-mask:linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  mask:linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite:xor; mask-composite:exclude; opacity:0; transition:.25s; border-radius:1rem }
.card-grad:hover::before{ opacity:1 }
.title-grad{ background:linear-gradient(90deg,#0f172a,#1e3a8a 40%,#312e81 80%); -webkit-background-clip:text; background-clip:text; color:transparent }
.subtitle-soft{ color:#334155 }
@media (max-width:640px){ .mobile-sticky{ position:sticky; bottom:0 } }
.bg-grid{ background-image:linear-gradient(rgba(37,99,235,.05) 1px, transparent 1px),linear-gradient(90deg, rgba(37,99,235,.05) 1px, transparent 1px); background-size:22px 22px }
.bg-dots{ background-image:radial-gradient(rgba(37,99,235,.10) 1px, transparent 1px); background-size:18px 18px }
.rounded-blob{ border-radius:38% 62% 55% 45% / 35% 44% 56% 65% }

@keyframes fadeIn{ from{opacity:0; transform:translateY(8px)} to{opacity:1; transform:translateY(0)} }
@keyframes float{ from{transform:translateY(0)} to{transform:translateY(-8px)} }
@keyframes pulseUp{ 0%{transform:scale(1)} 50%{transform:scale(1.03)} 100%{transform:scale(1)} }
@keyframes blob{ 0%{border-radius:38% 62% 55% 45% / 35% 44% 56% 65%}
  50%{border-radius:55% 45% 38% 62% / 60% 35% 65% 40%}
  100%{border-radius:38% 62% 55% 45% / 35% 44% 56% 65%} }
@keyframes shine{ to{ background-position:200% 0 } }
@keyframes aurora{ 0%{ transform:translate3d(0,0,0) scale(1); opacity:.9 }
  50%{ transform:translate3d(2%,-2%,0) scale(1.04); opacity:.95 }
  100%{ transform:translate3d(0,0,0) scale(1); opacity:.9 } }

.animate-fadeIn{ animation:fadeIn .32s ease-out both }
.animate-float{ animation:float 3.2s ease-in-out infinite alternate }
.animate-pulseUp{ animation:pulseUp 3.8s ease-in-out infinite }
.animate-blob{ animation:blob 9s ease-in-out infinite }
.animate-aurora{ animation:aurora 16s ease-in-out infinite }
    `}</style>
  );
}
