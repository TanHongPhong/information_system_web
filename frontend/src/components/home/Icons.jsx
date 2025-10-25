/* SVG icons nội bộ — không cần thư viện ngoài */
const Base = ({ className = "w-5 h-5", children }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none"
       stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
);

export const Phone = ({ className }) => (
  <Base className={className}>
    <rect x="7" y="2" width="10" height="20" rx="2" />
    <line x1="11" y1="18" x2="13" y2="18" />
  </Base>
);

export const Zap = ({ className }) => (
  <Base className={className}>
    <polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </Base>
);

export const LogIn = ({ className }) => (
  <Base className={className}>
    <path d="M3 4v16" />
    <path d="M10 17l5-5-5-5" />
    <path d="M15 12H8" />
  </Base>
);

export const UserPlus = ({ className }) => (
  <Base className={className}>
    <circle cx="12" cy="7" r="4" />
    <path d="M5.5 21a7 7 0 0 1 13 0" />
    <line x1="19" y1="8" x2="19" y2="14" />
    <line x1="16" y1="11" x2="22" y2="11" />
  </Base>
);

export const Search = ({ className }) => (
  <Base className={className}>
    <circle cx="11" cy="11" r="7" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </Base>
);

export const Truck = ({ className }) => (
  <Base className={className}>
    <rect x="1" y="7" width="13" height="8" rx="1" />
    <path d="M14 10h3l3 3v2h-6z" />
    <circle cx="5" cy="18" r="2" />
    <circle cx="17" cy="18" r="2" />
  </Base>
);

export const Cpu = ({ className }) => (
  <Base className={className}>
    <rect x="4" y="4" width="16" height="16" rx="2" />
    <rect x="9" y="9" width="6" height="6" />
    <path d="M9 2v2M15 2v2M9 20v2M15 20v2M2 9h2M2 15h2M20 9h2M20 15h2" />
  </Base>
);

export const Map = ({ className }) => (
  <Base className={className}>
    <polyline points="1 6 8 3 16 6 23 3 23 18 16 21 8 18 1 21 1 6" />
    <line x1="8" y1="3" x2="8" y2="18" />
    <line x1="16" y1="6" x2="16" y2="21" />
  </Base>
);

export const Shield = ({ className }) => (
  <Base className={className}>
    <path d="M12 2l7 4v6c0 5-3.5 9-7 10-3.5-1-7-5-7-10V6z" />
  </Base>
);

export const Headphones = ({ className }) => (
  <Base className={className}>
    <path d="M4 13a8 8 0 0 1 16 0" />
    <path d="M4 13v7h3v-5H4" />
    <path d="M20 13v7h-3v-5h3" />
  </Base>
);

export const Package = ({ className }) => (
  <Base className={className}>
    <path d="M21 16V8l-9-5-9 5v8l9 5 9-5z" />
    <path d="M12 3v18" />
    <path d="M3 8l9 5 9-5" />
  </Base>
);

export const CheckCircle = ({ className }) => (
  <Base className={className}>
    <circle cx="12" cy="12" r="9" />
    <path d="M9 12l2 2 4-5" />
  </Base>
);

export const Facebook = ({ className }) => (
  <Base className={className}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </Base>
);

export const Instagram = ({ className }) => (
  <Base className={className}>
    <rect x="3" y="3" width="18" height="18" rx="4" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="1" />
  </Base>
);

export const Twitter = ({ className }) => (
  <Base className={className}>
    <path d="M22 5.8c-.7.3-1.4.5-2.2.6.8-.5 1.3-1.2 1.6-2.1-.7.5-1.6.8-2.5 1A3.7 3.7 0 0 0 12 8a10.6 10.6 0 0 1-7.7-3.9c-.8 1.4-.4 3.2 1 4.1-.6 0-1.2-.2-1.7-.5 0 1.8 1.3 3.3 3 3.7-.6.2-1.2.2-1.8.1.5 1.6 2 2.7 3.7 2.7A7.5 7.5 0 0 1 2 17a10.6 10.6 0 0 0 5.7 1.7c6.8 0 10.6-5.7 10.6-10.6v-.5c.7-.5 1.3-1.1 1.7-1.8z" />
  </Base>
);
