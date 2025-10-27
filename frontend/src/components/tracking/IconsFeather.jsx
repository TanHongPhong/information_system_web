// src/components/theo doi don hang/IconsFeather.jsx
import React from "react";

const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

export const IconShield = (props) => (
  <svg {...base} {...props} viewBox="0 0 24 24">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

export const IconHome = (props) => (
  <svg {...base} {...props} viewBox="0 0 24 24">
    <path d="M3 9l9-7 9 7" />
    <path d="M9 22V12h6v10" />
  </svg>
);

export const IconTruck = (props) => (
  <svg {...base} {...props} viewBox="0 0 24 24">
    <path d="M10 17H5a1 1 0 0 1-1-1V6h11v5h3l3 3v2a1 1 0 0 1-1 1h-2" />
    <circle cx="7" cy="18" r="2" />
    <circle cx="17" cy="18" r="2" />
  </svg>
);

export const IconMap = (props) => (
  <svg {...base} {...props} viewBox="0 0 24 24">
    <polygon points="1 6 1 22 8 19 16 22 23 18 23 2 16 5 8 2 1 6" />
    <line x1="8" y1="2" x2="8" y2="19" />
    <line x1="16" y1="5" x2="16" y2="22" />
  </svg>
);

export const IconUser = (props) => (
  <svg {...base} {...props} viewBox="0 0 24 24">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

export const IconSettings = (props) => (
  <svg {...base} {...props} viewBox="0 0 24 24">
    {/* feather settings */}
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82 2 2 0 1 1-2.83 2.83 1.65 1.65 0 0 0-1.82.33 2 2 0 1 1-3.4 0 1.65 1.65 0 0 0-1.82-.33 2 2 0 1 1-2.83-2.83 1.65 1.65 0 0 0 .33-1.82 2 2 0 1 1 0-3.4 1.65 1.65 0 0 0-.33-1.82 2 2 0 1 1 2.83-2.83 1.65 1.65 0 0 0 1.82-.33 2 2 0 1 1 3.4 0 1.65 1.65 0 0 0 1.82.33 2 2 0 1 1 2.83 2.83 1.65 1.65 0 0 0-.33 1.82 2 2 0 1 1 0 3.4z" />
  </svg>
);

export const IconSearch = (props) => (
  <svg {...base} {...props} viewBox="0 0 24 24">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

export const IconFilter = (props) => (
  <svg {...base} {...props} viewBox="0 0 24 24">
    <polygon points="22 3 2 3 10 12 10 19 14 21 14 12 22 3" />
  </svg>
);

export const IconPlus = (props) => (
  <svg {...base} {...props} viewBox="0 0 24 24">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

export const IconBell = (props) => (
  <svg {...base} {...props} viewBox="0 0 24 24">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

export const IconArchive = (props) => (
  <svg {...base} {...props} viewBox="0 0 24 24">
    <polyline points="21 8 21 21 3 21 3 8" />
    <rect x="1" y="3" width="22" height="5" />
    <line x1="10" y1="12" x2="14" y2="12" />
  </svg>
);

export const IconChevronDown = (props) => (
  <svg {...base} {...props} viewBox="0 0 24 24">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

export const IconEye = (props) => (
  <svg {...base} {...props} viewBox="0 0 24 24">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export const IconBook = (props) => (
  <svg {...base} {...props} viewBox="0 0 24 24">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M4 4h16v17H6.5A2.5 2.5 0 0 0 4 23z" />
  </svg>
);

export const IconCalendar = (props) => (
  <svg {...base} {...props} viewBox="0 0 24 24">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

export const IconClock = (props) => (
  <svg {...base} {...props} viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);
