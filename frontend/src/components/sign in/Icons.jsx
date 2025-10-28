// src/components/login/Icons.jsx
function BaseIcon({ className = "w-4 h-4", children, ...rest }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {children}
    </svg>
  );
}

export const Zap = (p) => (
  <BaseIcon {...p}>
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
  </BaseIcon>
);

export const Phone = (p) => (
  <BaseIcon {...p}>
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.86.31 1.7.58 2.5a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.58-1.15a2 2 0 0 1 2.11-.45 12.6 12.6 0 0 0 2.5.58A2 2 0 0 1 22 16.92z"></path>
  </BaseIcon>
);

export const Truck = (p) => (
  <BaseIcon {...p}>
    <rect x="1" y="3" width="15" height="13" rx="2"></rect>
    <path d="M16 8h4l3 3v5h-4"></path>
    <circle cx="5.5" cy="18.5" r="2.5"></circle>
    <circle cx="18.5" cy="18.5" r="2.5"></circle>
  </BaseIcon>
);

export const Lock = (p) => (
  <BaseIcon {...p}>
    <rect x="3" y="11" width="18" height="11" rx="2"></rect>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
  </BaseIcon>
);

export const Shield = (p) => (
  <BaseIcon {...p}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
  </BaseIcon>
);

export const LogIn = (p) => (
  <BaseIcon {...p}>
    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
    <polyline points="10 17 15 12 10 7"></polyline>
    <line x1="15" y1="12" x2="3" y2="12"></line>
  </BaseIcon>
);

export const UserPlus = (p) => (
  <BaseIcon {...p}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
    <circle cx="9" cy="7" r="4"></circle>
    <path d="M19 8v6m3-3h-6"></path>
  </BaseIcon>
);

export const Facebook = (p) => (
  <BaseIcon {...p}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
  </BaseIcon>
);

export const Instagram = (p) => (
  <BaseIcon {...p}>
    <rect x="2" y="2" width="20" height="20" rx="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.5" y2="6.5"></line>
  </BaseIcon>
);

export const Twitter = (p) => (
  <BaseIcon {...p}>
    <path d="M23 3a10.9 10.9 0 0 1-3.14 1.54A4.48 4.48 0 0 0 12 8v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
  </BaseIcon>
);

export const Linkedin = (p) => (
  <BaseIcon {...p}>
    <rect x="2" y="2" width="20" height="20" rx="2"></rect>
    <path d="M8 11v7"></path>
    <path d="M8 7v.01"></path>
    <path d="M12 18v-7"></path>
    <path d="M16 18v-4a4 4 0 0 0-8 0"></path>
  </BaseIcon>
);
